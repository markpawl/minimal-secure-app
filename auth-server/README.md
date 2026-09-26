# auth-server

This folder holds documentation and design decisions for this project's use of [Clerk](https://clerk.com) as the authentication provider. There is no code here — Clerk itself is the actual auth server; nothing in this repo runs in its place.

See [`../docs/OVERVIEW.md`](../docs/OVERVIEW.md) for the full set of interaction sequences (registration, login, logout, password reset) that Clerk drives.

## Why Clerk

Clerk is used instead of a self-hosted auth solution so that `webapp-client` and `homepage-server` can be a *minimal* starting point — registration, login, logout, session management, and password reset are delegated entirely to Clerk rather than implemented in this codebase.

## How each component integrates with Clerk

- **`homepage-server`** — Serves its Clerk *publishable* key to the browser via `GET /config.json`. Registration/login on the homepage happens client-side, directly against Clerk's API, using that key. The server itself never sees credentials or the secret key.
- **`webapp-client`** — Same pattern: uses the Clerk frontend SDK/publishable key in the browser for login, logout, and password reset. Persists the resulting session (JWT) for the duration of the session; caches only the user's email locally as a login-form convenience (never the password).
- **`application-server`** — The only component that holds a Clerk *secret* key. It verifies incoming JWTs using `@clerk/express`'s `clerkMiddleware()`. See the design decision below about how unauthenticated requests are handled.

## Key handling

- `CLERK_PUBLISHABLE_KEY` — safe to expose to the browser; used by `homepage-server` and `webapp-client`.
- `CLERK_SECRET_KEY` — server-side only; used by `application-server` to verify JWTs. Never sent to a browser or checked into version control (see each project's `.env.example`).

## Design decisions

- **JSON APIs return 401, not a redirect.** `@clerk/express`'s built-in `requireAuth()` middleware redirects (302) unauthenticated requests to a sign-in page — it's designed for server-rendered browser apps, not a JSON API. `application-server` uses its own guard (`clerkMiddleware()` + a custom check via `getAuth(req)`) that returns `401 Unauthorized` JSON instead, matching sequence 6 in `docs/OVERVIEW.md`.
- **No self-hosted user database (yet).** Clerk is the system of record for identity and credentials. Application-specific data that Clerk doesn't natively model (e.g. custom user preferences) is expected to live in `application-server`'s own storage, added when that need arises — not designed yet.

## Open questions

- **Should there be a dedicated "auth failed" / "unauthorized" page?** Since `application-server` returns a JSON 401 rather than redirecting, there's no server-driven redirect target today. If `webapp-client` later has protected routes and a session expires or fails client-side, it will need *some* UI response (e.g. bounce to the login screen with a message, vs. a dedicated error page) — not yet decided. Leaning toward: redirect to the existing login screen with an inline "please sign in again" message, rather than a separate page, to keep this starter minimal — but open for discussion once `webapp-client` has real protected routes to test against.
