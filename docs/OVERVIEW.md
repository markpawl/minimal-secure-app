# Overview

`minimal-secure-app` is a React web application built with Vite and TypeScript.

## Status

Early scaffold stage. The app currently consists of the default Vite starter page; no product features have been implemented yet. This document captures the intended purpose, system components, and interaction flows before implementation begins.

## Tech Stack

- React 19 + TypeScript
- Vite (build tool / dev server)
- Vitest + Testing Library (unit tests)
- ESLint + oxlint (linting)

See [`CLAUDE.md`](../CLAUDE.md) for commands and architecture notes.

## Purpose

`minimal-secure-app` will be a web app that includes registration, login, logout, account settings, user profile, and user preferences. It is meant to be used as a starter project for SaaS apps that require these features — other apps build their specific requirements on top of it.

"Secure" refers to this being a minimal, secure web app client suitable for SaaS services where an end user needs to log in to a central server in order to make API calls against it.

## Components

The overall system is made up of four components. Only `minimal-secure-app` lives in this repository; the others are separate/adjacent projects referenced here for context.

- **`minimal-secure-app`** (this project) — The end-user web app client. Provides register/login/logout, account settings, user profile, and user preferences. Calls `application-server` APIs using a JWT obtained from Clerk. Intended as a starter template that other apps extend.
- **`saas-homepage-shell`** — A marketing/registration site where users sign up for the SaaS service. Not yet started.
- **`application-server`** — A lightweight backend with API endpoints for application services. Most endpoints require a JWT (issued by Clerk) for authentication/authorization. Meant to be built upon in the same way as `minimal-secure-app`. To simulate application services, it exposes an endpoint that lets a user pick and download an image used as the client app's splash screen. Not yet started.
- **Clerk (clerk.com)** — Third-party auth server. Handles registration, login/logout, session (JWT) issuance, and password reset for both `saas-homepage-shell` and `minimal-secure-app`.

## Interaction Sequences

### Sequence 1 — User registers on saas-homepage

1. User opens their browser to `saas-homepage-shell`.
2. At the top of the screen, in the title bar on the right, a "register" button/link appears.
3. User clicks the "register" button/link.
4. A register form comes up.
5. User enters their credentials (email and password) and submits them.
6. The credentials are sent to Clerk's register API.
7. Clerk saves the credentials and associates a set of default user claims with the account.
8. Clerk issues a session (JWT); `saas-homepage-shell` persists it for the duration of the session.
9. The browser locally caches the user's email as a convenience for pre-filling future login forms — the password itself is never persisted.
10. The `saas-homepage-shell` UI notifies the user of a successful registration.

### Sequence 2 — User logs in to the saas-homepage

1. User opens their browser to `saas-homepage-shell`.
2. Title bar shows a "login" button/link (alongside "register").
3. User clicks "login".
4. A login form appears; user enters their email and password and submits.
5. Credentials are sent to Clerk's login/sign-in API.
6. Clerk validates the credentials against the stored user record.
7. Clerk responds with a session (JWT).
8. `saas-homepage-shell` persists the JWT for the duration of the session; the browser locally caches the user's email as a login-form convenience (password not persisted).
9. The `saas-homepage-shell` UI updates to reflect the logged-in state (e.g., "login"/"register" links replaced with an account menu).

### Sequence 3 — User logs out of the saas-homepage

1. User clicks "logout" (from an account menu) on `saas-homepage-shell`.
2. `saas-homepage-shell` calls Clerk's sign-out function.
3. Clerk invalidates the current session.
4. `saas-homepage-shell`'s persisted JWT/session is cleared. (The locally cached email, if any, is left in place so it can still pre-fill the login form next time.)
5. The `saas-homepage-shell` UI reverts to showing "login"/"register" links.

### Sequence 4 — A registered user logs into the minimal-secure-app webapp

1. User opens their browser to `minimal-secure-app`.
2. The app shows a login screen (Clerk-hosted or embedded Clerk component).
3. User enters their email and password and submits.
4. Credentials are sent to Clerk's login API.
5. Clerk validates the credentials and responds with a session (JWT).
6. `minimal-secure-app` persists the JWT for the duration of the session; the browser locally caches the user's email as a login-form convenience (password not persisted).
7. `minimal-secure-app` UI transitions from the login screen to the authenticated app shell.

### Sequence 5 — The end user uses minimal-secure-app to request a splashscreen image from application-server

1. Authenticated user navigates to a splashscreen-picker screen within `minimal-secure-app`.
2. `minimal-secure-app` fetches and displays a list/gallery of available splashscreen images from `application-server`.
3. User selects an image.
4. `minimal-secure-app` attaches the user's JWT (from Clerk) as an Authorization header.
5. `minimal-secure-app` sends a request to `application-server`'s image endpoint for the selected image.
6. `minimal-secure-app` receives the image in the response and uses it as the splash screen.

### Sequence 6 — application-server processes a splashscreen image request

1. `application-server` receives the request at its image endpoint.
2. It extracts the JWT from the Authorization header.
3. It verifies the JWT against Clerk (e.g., via Clerk's backend SDK / JWKS).
4. If verification fails, it responds `401 Unauthorized`.
5. If verification succeeds, it reads the requested image identifier from the request.
6. It retrieves the corresponding image from its own storage/asset set.
7. It returns the image data in the response.

### Sequence 7 — User logs out of the minimal-secure-app webapp

1. User clicks "logout" (from an account menu) within `minimal-secure-app`.
2. `minimal-secure-app` calls Clerk's sign-out function.
3. Clerk invalidates the current session.
4. `minimal-secure-app`'s persisted JWT/session is cleared. (The locally cached email, if any, is left in place so it can still pre-fill the login form next time.)
5. `minimal-secure-app` UI transitions back to the login screen.

### Sequence 8 — User forgot their password and requests a password reset

1. On the login form (either `saas-homepage-shell` or `minimal-secure-app`), user clicks "Forgot password?".
2. A password-reset request form appears; user enters their email and submits.
3. The request is sent to Clerk's password-reset API.
4. Clerk sends a password-reset email containing a reset link/code to the user's registered address.
5. The UI confirms a reset email has been sent.
6. User follows the link/enters the code and lands on a "set new password" form.
7. User enters and submits a new password.
8. Clerk validates and updates the stored credentials for the account.
9. Clerk confirms the reset succeeded.
10. The UI directs the user to log in with the new password.
