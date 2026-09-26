# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

This is a monorepo containing three independently-run components — see [`docs/OVERVIEW.md`](docs/OVERVIEW.md) for their purpose and how they interact:

- `minimal-secure-app/` — React + Vite + TypeScript SPA (the starter webapp client)
- `application-server/` — Node.js + Express API server
- `saas-homepage-shell/` — Node.js + Express static site + registration server

Each has its own `package.json`, dependencies, and commands — there is no root-level `package.json`. Run commands from inside the relevant subfolder.

## Commands

### `minimal-secure-app/`

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) then build for production
- `npm run preview` — serve the production build locally
- `npm run lint` — run oxlint
- `npm run lint:eslint` — run ESLint
- `npm test` — run Vitest in watch mode
- `npx vitest run` — run the full test suite once (non-watch)
- `npx vitest run <path>` — run a single test file, e.g. `npx vitest run src/App.test.tsx`
- `npx vitest run -t "<name>"` — run tests matching a name pattern

### `application-server/` and `saas-homepage-shell/`

- `npm run dev` — start the server with hot reload (`tsx watch`)
- `npm run build` — type-check and compile to `dist/`
- `npm start` — run the compiled server
- `npm test` — run the test suite (Vitest + Supertest)

## Architecture

### minimal-secure-app

Standard Vite + React + TypeScript SPA, currently a fresh scaffold (single `App` component in `src/App.tsx`, entry point `src/main.tsx`).

- TypeScript project uses composite references: `tsconfig.json` points to `tsconfig.app.json` (app/browser code, `src/`) and `tsconfig.node.json` (Node-side config files like `vite.config.ts`). Use the right `tsc` project when reasoning about type errors in config files vs. app code.
- Vitest is configured inside `vite.config.ts` (not a separate config file), using `jsdom` and `globals: true`. Test setup (`@testing-library/jest-dom`) is loaded via `src/setupTests.ts`. Tests live alongside source files as `*.test.tsx`.
- Module resolution is `bundler` mode with `verbatimModuleSyntax` enabled — type-only imports must use `import type`.

### application-server

Express app split into `src/app.ts` (app factory, `createApp()`, imported directly by tests) and `src/index.ts` (process entry point that calls `.listen()`). Auth uses `@clerk/express`'s `clerkMiddleware()` plus a custom `requireAuth` guard in `app.ts` that returns `401` JSON — not the package's own `requireAuth()`, which redirects to a sign-in page and is meant for browser apps, not a JSON API. Tests set dummy Clerk keys via `src/setupTests.ts` (configured as Vitest's `setupFiles` in `vitest.config.ts`) so `clerkMiddleware()` can initialize without a real Clerk project.

### saas-homepage-shell

Express app split the same way (`src/app.ts` / `src/index.ts`). Serves the static homepage from `public/` and exposes only the Clerk *publishable* key to the browser via `GET /config.json` — the secret key never leaves the server.
