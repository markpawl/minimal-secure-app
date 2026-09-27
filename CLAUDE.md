# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

This is a monorepo containing three independently-run components plus a docs-only folder — see [`docs/OVERVIEW.md`](docs/OVERVIEW.md) for their purpose and how they interact:

- `webapp-client/` — React + Vite + TypeScript SPA (the starter webapp client)
- `homepage-server/` — Node.js + Express static site + registration server
- `application-server/` — Node.js + Express API server
- `auth-server/` — no code; documentation and design decisions for this project's use of Clerk (see [`auth-server/README.md`](auth-server/README.md))

Each runnable component has its own `package.json`, dependencies, and commands — there is no root-level `package.json`. Run commands from inside the relevant subfolder.

## Commands

### `webapp-client/`

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) then build for production
- `npm run preview` — serve the production build locally
- `npm run lint` — run oxlint
- `npm run lint:eslint` — run ESLint
- `npm test` — run Vitest in watch mode
- `npx vitest run` — run the full test suite once (non-watch)
- `npx vitest run <path>` — run a single test file, e.g. `npx vitest run src/App.test.tsx`
- `npx vitest run -t "<name>"` — run tests matching a name pattern

### `homepage-server/` and `application-server/`

- `npm run dev` — start the server with hot reload (`tsx watch`)
- `npm run build` — type-check and compile to `dist/`
- `npm start` — run the compiled server
- `npm test` — run the test suite (Vitest + Supertest)
- `npx vitest run <path>` — run a single test file, e.g. `npx vitest run src/app.test.ts`

## Architecture

### webapp-client

Vite + React + TypeScript SPA. `src/main.tsx` wraps `<App />` in `<ClerkProvider>` (publishable key from `VITE_CLERK_PUBLISHABLE_KEY`, resolved/validated in `src/clerkPublishableKey.ts` — kept out of `main.tsx` itself so the entry file has no non-JSX top-level exports, which otherwise trips the `react-refresh/only-export-components` ESLint rule) and `<BrowserRouter>`. `App.tsx` uses `@clerk/react`'s `<Show when="signed-out">` / `<Show when="signed-in">` (not the older `<SignedIn>`/`<SignedOut>` — see below) to gate the login screen (`<SignIn />`) vs. the authenticated shell (nav + `<UserButton />` + routed page content).

- **Use `@clerk/react`, not `@clerk/clerk-react`** — the latter is deprecated (Clerk's Core 3 upgrade). `@clerk/react` also renamed the `SignedIn`/`SignedOut` control components to a single `<Show when="signed-in" | "signed-out">`.
- **Pages** (`src/pages/`): `HomePage`, `PreferencesPage`. "Account" isn't a custom page — it's Clerk's own `<UserProfile routing="path" path="/account" />`, mounted at `/account/*` (the wildcard is required; `UserProfile` renders its own nested `<Routes>` for its Profile/Security tabs). This covers both "account settings" and "profile" from a single prebuilt component rather than two custom ones.
- **Preferences** (`src/pages/PreferencesPage.tsx`) are stored in `user.unsafeMetadata` via `@clerk/react`'s `useUser()` hook — not a database. This was a deliberate choice (see `auth-server/README.md`) to avoid standing up persistence for a starter template; revisit if an app built on this needs richer per-user data than small key-value settings.
- Tests mock `@clerk/react` entirely (see `src/App.test.tsx`) rather than exercising real Clerk auth state — `Show` mocks render both branches unconditionally, `useUser` returns a fixed mock user, since gating/auth behavior is Clerk's own responsibility, not this app's. Route content is tested with `MemoryRouter` + `initialEntries`, not `BrowserRouter`.
- TypeScript project uses composite references: `tsconfig.json` points to `tsconfig.app.json` (app/browser code, `src/`) and `tsconfig.node.json` (Node-side config files like `vite.config.ts`). Use the right `tsc` project when reasoning about type errors in config files vs. app code.
- Vitest is configured inside `vite.config.ts` (not a separate config file), using `jsdom` and `globals: true`. Test setup (`@testing-library/jest-dom`) is loaded via `src/setupTests.ts`. Tests live alongside source files as `*.test.tsx`.
- Module resolution is `bundler` mode with `verbatimModuleSyntax` enabled — type-only imports must use `import type`.
- **Dev server + Dropbox**: `npm run dev` can fail with `EBUSY` because this repo lives inside a Dropbox-synced folder — see [`docs/DROPBOX_SYNC.md`](docs/DROPBOX_SYNC.md) for the symptom and fix.

### application-server

Express app split into `src/app.ts` (app factory, `createApp()`, imported directly by tests) and `src/index.ts` (process entry point that calls `.listen()`). Auth uses `@clerk/express`'s `clerkMiddleware()` plus a custom `requireAuth` guard in `app.ts` that returns `401` JSON — not the package's own `requireAuth()`, which redirects to a sign-in page and is meant for browser apps, not a JSON API.

- **CORS**: `webapp-client` calls this API cross-origin with a Bearer JWT (no cookies), so `app.use(cors({ origin: allowedOrigins }))` is required near the top of `createApp()` — without it, every browser request fails at the CORS preflight regardless of the JWT being valid. Allowed origins come from `CORS_ORIGIN` (comma-separated).
- **Splash images** (`src/splashImages.ts` + `assets/splash-images/`, routes in `app.ts`): a manifest maps `id` → asset file; `GET /api/splash-images` lists `{id, name}`, `GET /api/splash-images/:id` streams the file with the right `Content-Type` or `404`s. Assets live outside `src/` (same reasoning as `homepage-server`'s `public/` — data, not source `tsc` should touch) but path-resolve correctly from both `tsx` (dev, `__dirname` = `src/`) and the compiled build (`dist/index.js`, `__dirname` = `dist/`) since both sit one level below the project root.
- **Testing Clerk-protected routes**: `src/app.test.ts` fully mocks `@clerk/express` (a fake `clerkMiddleware` that reads a `x-test-auth` header instead of verifying a real JWT) rather than relying on the dummy Clerk keys in `src/setupTests.ts` — that gets full route-logic coverage (200/401/404 paths) without a network call to Clerk. `setupTests.ts` remains as Vitest's `setupFiles` fallback for any test file that doesn't mock `@clerk/express` itself.

### homepage-server

Express app split the same way (`src/app.ts` / `src/index.ts`). Serves the static homepage from `public/` and exposes only the Clerk *publishable* key to the browser via `GET /config.json` — the secret key never leaves the server.

Client-side auth (`public/app.js`) is plain JS + Clerk's hosted script, not `@clerk/react` — there's no bundler here, unlike `webapp-client`. Key points:

- The Clerk script **must** be loaded from your own Clerk Frontend API domain (`https://<frontend-api>/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`), not a generic CDN like jsdelivr — loading `clerk.browser.js` from jsdelivr fails with `"Clerk was not loaded with Ui components"` when you call `mountUserButton`/open the modals. `app.js` derives the frontend API host client-side from the publishable key itself (`base64("<frontend-api>$")`, stripped of the `pk_test_`/`pk_live_` prefix and trailing `$`) — the same trick Clerk's own SDKs use internally.
- Login/register/logout/password-reset are all Clerk's own modals (`openSignIn()`/`openSignUp()`) and `mountUserButton()` (which includes sign-out) — no custom forms.
- **Build hygiene**: both `application-server/tsconfig.json` and `homepage-server/tsconfig.json` `exclude` `src/**/*.test.ts` — without it, `tsc` compiles test files into `dist/`, and Vitest picks those up too (alongside the `src/` originals), silently double-running every test. Keep this exclusion if you touch either tsconfig.

## Notes for future work

- The project root and its git/GitHub repo are currently named `secure-app-starter`. There's a plan to rename both to `secure-app-starter` — that requires manual steps outside of file edits (renaming the GitHub repo, updating the local remote URL, etc.), not yet done.
- No orchestration (e.g. Docker Compose) exists yet to run all three components together for local dev — see "Future enhancements" in [`docs/OVERVIEW.md`](docs/OVERVIEW.md).
