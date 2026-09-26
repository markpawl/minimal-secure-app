# auth-server

This folder holds documentation and design decisions for this project's use of [Clerk](https://clerk.com) as the authentication provider. There is no code here — Clerk itself is the actual auth server; nothing in this repo runs in its place.

See [`../docs/OVERVIEW.md`](../docs/OVERVIEW.md) for the full set of interaction sequences (registration, login, logout, password reset) that Clerk drives.

Account-specific details (dashboard link, publishable/secret keys, etc.) live in `clerk-account.local.md` in this folder — gitignored, never committed. Fill it in locally; each runnable component also has its own `.env.example` for the subset of those values it actually needs at runtime.

## Why Clerk

Clerk is used instead of a self-hosted auth solution so that `webapp-client` and `homepage-server` can be a *minimal* starting point — registration, login, logout, session management, and password reset are delegated entirely to Clerk rather than implemented in this codebase.

## How each component integrates with Clerk

- **`homepage-server`** — Serves its Clerk *publishable* key to the browser via `GET /config.json`. The client-side script (`public/app.js`, plain JS — no bundler here) loads Clerk's hosted script from the project's own Clerk Frontend API domain (derived from the publishable key itself) and uses `openSignIn()`/`openSignUp()` modals plus `mountUserButton()` for login, registration, and logout. The server itself never sees credentials or the secret key.
- **`webapp-client`** — Uses `@clerk/react`'s prebuilt components: `<ClerkProvider>` (wrapping the app in `main.tsx`), `<Show when="signed-out"><SignIn /></Show>` for the login screen, and `<Show when="signed-in">` + `<UserButton />` for the authenticated shell (which also provides sign-out). No custom login form — Clerk's hosted UI handles login, logout, and password reset ("Forgot password?" is built into `<SignIn />`) without additional code here.
- **`application-server`** — The only component that holds a Clerk *secret* key. It verifies incoming JWTs using `@clerk/express`'s `clerkMiddleware()`. See the design decision below about how unauthenticated requests are handled.

## Key handling

- `CLERK_PUBLISHABLE_KEY` — safe to expose to the browser; used by `homepage-server` and `webapp-client`.
- `CLERK_SECRET_KEY` — server-side only; used by `application-server` to verify JWTs. Never sent to a browser or checked into version control (see each project's `.env.example`).

## Design decisions

- **Use `@clerk/react`, not `@clerk/clerk-react`.** The latter is deprecated as of Clerk's Core 3 upgrade. `@clerk/react` also replaces the old `<SignedIn>`/`<SignedOut>` control components with a single `<Show when="signed-in" | "signed-out">`.
- **JSON APIs return 401, not a redirect.** `@clerk/express`'s built-in `requireAuth()` middleware redirects (302) unauthenticated requests to a sign-in page — it's designed for server-rendered browser apps, not a JSON API. `application-server` uses its own guard (`clerkMiddleware()` + a custom check via `getAuth(req)`) that returns `401 Unauthorized` JSON instead, matching sequence 6 in `docs/OVERVIEW.md`.
- **Load `clerk-js` from your own Frontend API domain, not a generic CDN.** `homepage-server` has no bundler, so it loads Clerk's browser script via a `<script>` tag. Pointing that at a third-party CDN (e.g. jsdelivr) loads a build that fails with `"Clerk was not loaded with Ui components"` as soon as you call `mountUserButton()` or open a modal. It has to be served from `https://<your-frontend-api>/npm/@clerk/clerk-js@latest/dist/clerk.browser.js` — `public/app.js` derives that host client-side from the publishable key (`base64("<frontend-api>$")`).
- **No self-hosted user database (yet).** Clerk is the system of record for identity and credentials. Application-specific data that Clerk doesn't natively model (e.g. custom user preferences) is expected to live in `application-server`'s own storage, added when that need arises — not designed yet.

## Open questions

- **Should there be a dedicated "auth failed" / "unauthorized" page?** Since `application-server` returns a JSON 401 rather than redirecting, there's no server-driven redirect target today. If `webapp-client` later has protected routes and a session expires or fails client-side, it will need *some* UI response (e.g. bounce to the login screen with a message, vs. a dedicated error page) — not yet decided. Leaning toward: redirect to the existing login screen with an inline "please sign in again" message, rather than a separate page, to keep this starter minimal — but open for discussion once `webapp-client` has real protected routes to test against.
