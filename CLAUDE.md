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

Vite + React + TypeScript SPA. `src/main.tsx` wraps `<App />` in `<ClerkProvider>` (publishable key from `VITE_CLERK_PUBLISHABLE_KEY`, resolved/validated in `src/clerkPublishableKey.ts` — kept out of `main.tsx` itself so the entry file has no non-JSX top-level exports, which otherwise trips the `react-refresh/only-export-components` ESLint rule). `App.tsx` uses `@clerk/react`'s `<Show when="signed-out">` / `<Show when="signed-in">` (not the older `<SignedIn>`/`<SignedOut>` — see below) to gate the login screen (`<SignIn />`) vs. the authenticated shell (`<UserButton />` + app content).

- **Use `@clerk/react`, not `@clerk/clerk-react`** — the latter is deprecated (Clerk's Core 3 upgrade). `@clerk/react` also renamed the `SignedIn`/`SignedOut` control components to a single `<Show when="signed-in" | "signed-out">`.
- Tests mock `@clerk/react` entirely (see `src/App.test.tsx`) rather than exercising real Clerk auth state — `Show` mocks render both branches unconditionally, since gating behavior is Clerk's own responsibility, not this app's.
- TypeScript project uses composite references: `tsconfig.json` points to `tsconfig.app.json` (app/browser code, `src/`) and `tsconfig.node.json` (Node-side config files like `vite.config.ts`). Use the right `tsc` project when reasoning about type errors in config files vs. app code.
- Vitest is configured inside `vite.config.ts` (not a separate config file), using `jsdom` and `globals: true`. Test setup (`@testing-library/jest-dom`) is loaded via `src/setupTests.ts`. Tests live alongside source files as `*.test.tsx`.
- Module resolution is `bundler` mode with `verbatimModuleSyntax` enabled — type-only imports must use `import type`.
- **Dev server + Dropbox**: `npm run dev` can fail with `EBUSY` because this repo lives inside a Dropbox-synced folder — see [`docs/DROPBOX_SYNC.md`](docs/DROPBOX_SYNC.md) for the symptom and fix.

### application-server

Express app split into `src/app.ts` (app factory, `createApp()`, imported directly by tests) and `src/index.ts` (process entry point that calls `.listen()`). Auth uses `@clerk/express`'s `clerkMiddleware()` plus a custom `requireAuth` guard in `app.ts` that returns `401` JSON — not the package's own `requireAuth()`, which redirects to a sign-in page and is meant for browser apps, not a JSON API. Tests set dummy Clerk keys via `src/setupTests.ts` (configured as Vitest's `setupFiles` in `vitest.config.ts`) so `clerkMiddleware()` can initialize without a real Clerk project.

### homepage-server

Express app split the same way (`src/app.ts` / `src/index.ts`). Serves the static homepage from `public/` and exposes only the Clerk *publishable* key to the browser via `GET /config.json` — the secret key never leaves the server.

## Notes for future work

- The project root and its git/GitHub repo are currently named `minimal-secure-app`. There's a plan to rename both to `secure-app-starter` — that requires manual steps outside of file edits (renaming the GitHub repo, updating the local remote URL, etc.), not yet done.
- No orchestration (e.g. Docker Compose) exists yet to run all three components together for local dev — see "Future enhancements" in [`docs/OVERVIEW.md`](docs/OVERVIEW.md).
