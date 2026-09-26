# Overview

This repository is a monorepo starter for SaaS apps that need registration/login-gated access to a central API, built around [Clerk](https://clerk.com) as the hosted auth provider.

## Status

`webapp-client` and `homepage-server` are wired up to Clerk (registration, login, logout, password reset). `webapp-client` also has account settings, profile (Clerk's `<UserProfile />`), and preferences (custom page, stored in Clerk's `unsafeMetadata`). `application-server` verifies JWTs but doesn't yet serve real application data (the splash-image endpoint in sequences 5–6 is still to be built). This document captures the intended purpose, system components, and interaction flows to guide that implementation.

See [`CLAUDE.md`](../CLAUDE.md) for commands and architecture notes, and [`../auth-server/README.md`](../auth-server/README.md) for Clerk-specific design decisions.

## Purpose

The system provides registration, login, logout, account settings, user profile, and user preferences. It's meant to be used as a starter for SaaS apps that need these features — other apps build their specific requirements on top of it.

"Secure" refers to this being a minimal, secure client/server setup suitable for SaaS services where an end user needs to log in to a central server in order to make API calls against it.

## Components

- **`webapp-client`** — The end-user web app client (React + Vite + TypeScript). Provides register/login/logout, account settings, user profile, and user preferences. Calls `application-server` APIs using a JWT obtained from Clerk. Intended as a starter template that other apps extend.
- **`homepage-server`** — A marketing/registration site (Node.js + Express) where users sign up for the SaaS service.
- **`application-server`** — A lightweight backend (Node.js + Express) with API endpoints for application services. Most endpoints require a JWT (issued by Clerk) for authentication/authorization. Meant to be built upon in the same way as `webapp-client`. To simulate application services, it exposes an endpoint that lets a user pick and download an image used as the client app's splash screen.
- **`auth-server`** — Not a running service; holds documentation and design decisions for how this project uses Clerk (see [its README](../auth-server/README.md)).
- **Clerk (clerk.com)** — Third-party auth provider. Handles registration, login/logout, session (JWT) issuance, and password reset for both `homepage-server` and `webapp-client`.

## Repository organization

This is a single monorepo containing all components, which is fine for a starter/template repo — whoever builds on this template is free to split it into separate repos if that suits their setup better.

The project root and its git/GitHub repo are currently named `minimal-secure-app`; there's a plan to rename both to `secure-app-starter` once the manual GitHub rename steps are walked through (tracked outside this doc).

## Local development

All components currently run locally (each with its own `npm run dev`, see each project's README); Clerk is the only external/hosted dependency. A deployment platform (possibly Vercel) will be chosen and documented later.

There's no orchestration (e.g. Docker Compose) to run all three components together yet — see "Future enhancements" below.

This repo lives inside a Dropbox-synced folder (synced between Mac and Windows). If `npm run dev` fails with `EBUSY`, see [`DROPBOX_SYNC.md`](DROPBOX_SYNC.md).

## Future enhancements

- **Docker Compose for local dev** — run `webapp-client`, `homepage-server`, and `application-server` together with one command.
  - Mac: works with Docker Desktop (or Colima) as usual.
  - Windows: Docker Desktop is being avoided here; Docker is installed directly inside WSL2. `docker compose` needs to be run from inside a WSL shell (not PowerShell) against that engine — the same `docker-compose.yml` works, just invoked from WSL. Concrete setup steps TBD when this is actually built.
- **Deployment** — choose a hosting platform (possibly Vercel) and adjust each component's config to match.
- **"Auth failed" / unauthorized UI** — decide whether `webapp-client` needs a dedicated "auth failed" page, or should just bounce back to the login screen with an inline message when a session is missing/expired. See "Open questions" in [`../auth-server/README.md`](../auth-server/README.md).

## Interaction Sequences

### Sequence 1 — User registers on homepage-server

1. User opens their browser to `homepage-server`.
2. At the top of the screen, in the title bar on the right, a "register" button/link appears.
3. User clicks the "register" button/link.
4. A register form comes up.
5. User enters their credentials (email and password) and submits them.
6. The credentials are sent to Clerk's register API.
7. Clerk saves the credentials and associates a set of default user claims with the account.
8. Clerk issues a session (JWT); `homepage-server` persists it for the duration of the session.
9. The browser locally caches the user's email as a convenience for pre-filling future login forms — the password itself is never persisted.
10. The `homepage-server` UI notifies the user of a successful registration.

### Sequence 2 — User logs in to homepage-server

1. User opens their browser to `homepage-server`.
2. Title bar shows a "login" button/link (alongside "register").
3. User clicks "login".
4. A login form appears; user enters their email and password and submits.
5. Credentials are sent to Clerk's login/sign-in API.
6. Clerk validates the credentials against the stored user record.
7. Clerk responds with a session (JWT).
8. `homepage-server` persists the JWT for the duration of the session; the browser locally caches the user's email as a login-form convenience (password not persisted).
9. The `homepage-server` UI updates to reflect the logged-in state (e.g., "login"/"register" links replaced with an account menu).

### Sequence 3 — User logs out of homepage-server

1. User clicks "logout" (from an account menu) on `homepage-server`.
2. `homepage-server` calls Clerk's sign-out function.
3. Clerk invalidates the current session.
4. `homepage-server`'s persisted JWT/session is cleared. (The locally cached email, if any, is left in place so it can still pre-fill the login form next time.)
5. The `homepage-server` UI reverts to showing "login"/"register" links.

### Sequence 4 — A registered user logs into webapp-client

1. User opens their browser to `webapp-client`.
2. The app shows a login screen (Clerk-hosted or embedded Clerk component).
3. User enters their email and password and submits.
4. Credentials are sent to Clerk's login API.
5. Clerk validates the credentials and responds with a session (JWT).
6. `webapp-client` persists the JWT for the duration of the session; the browser locally caches the user's email as a login-form convenience (password not persisted).
7. `webapp-client` UI transitions from the login screen to the authenticated app shell.

### Sequence 5 — The end user uses webapp-client to request a splashscreen image from application-server

1. Authenticated user navigates to a splashscreen-picker screen within `webapp-client`.
2. `webapp-client` fetches and displays a list/gallery of available splashscreen images from `application-server`.
3. User selects an image.
4. `webapp-client` attaches the user's JWT (from Clerk) as an Authorization header.
5. `webapp-client` sends a request to `application-server`'s image endpoint for the selected image.
6. `webapp-client` receives the image in the response and uses it as the splash screen.

### Sequence 6 — application-server processes a splashscreen image request

1. `application-server` receives the request at its image endpoint.
2. It extracts the JWT from the Authorization header.
3. It verifies the JWT against Clerk (e.g., via Clerk's backend SDK / JWKS).
4. If verification fails, it responds `401 Unauthorized`.
5. If verification succeeds, it reads the requested image identifier from the request.
6. It retrieves the corresponding image from its own storage/asset set.
7. It returns the image data in the response.

### Sequence 7 — User logs out of webapp-client

1. User clicks "logout" (from an account menu) within `webapp-client`.
2. `webapp-client` calls Clerk's sign-out function.
3. Clerk invalidates the current session.
4. `webapp-client`'s persisted JWT/session is cleared. (The locally cached email, if any, is left in place so it can still pre-fill the login form next time.)
5. `webapp-client` UI transitions back to the login screen.

### Sequence 8 — User forgot their password and requests a password reset

1. On the login form (either `homepage-server` or `webapp-client`), user clicks "Forgot password?".
2. A password-reset request form appears; user enters their email and submits.
3. The request is sent to Clerk's password-reset API.
4. Clerk sends a password-reset email containing a reset link/code to the user's registered address.
5. The UI confirms a reset email has been sent.
6. User follows the link/enters the code and lands on a "set new password" form.
7. User enters and submits a new password.
8. Clerk validates and updates the stored credentials for the account.
9. Clerk confirms the reset succeeded.
10. The UI directs the user to log in with the new password.
