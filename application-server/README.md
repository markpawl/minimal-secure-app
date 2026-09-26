# application-server

Lightweight API server for the SaaS application services. Most endpoints require a JWT (issued by Clerk) for authentication/authorization. Meant to be built upon, in the same way as `webapp-client`.

See [`../docs/OVERVIEW.md`](../docs/OVERVIEW.md) for this component's role and interaction sequences.

## Commands

- `npm run dev` — start the server with hot reload (`tsx watch`)
- `npm run build` — type-check and compile to `dist/`
- `npm start` — run the compiled server (`dist/index.js`)
- `npm test` — run the test suite (Vitest + Supertest)

## Configuration

Copy `.env.example` to `.env` and fill in:

- `PORT` — port to listen on (defaults to `3001`)
- `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY` — from your Clerk project, used to verify incoming JWTs
- `CORS_ORIGIN` — comma-separated list of allowed browser origins (defaults to `webapp-client`'s dev server, `http://localhost:5173`). Needed because this API is called directly from the browser on a different origin; no cookies are involved (auth is a Bearer JWT), so `credentials: true` isn't needed.

## Endpoints

- `GET /health` — public
- `GET /api/me` — protected; returns the authenticated user's id
- `GET /api/splash-images` — protected; lists available splash images (`{ id, name }[]`)
- `GET /api/splash-images/:id` — protected; returns the image itself (binary, correct `Content-Type`), or `404` for an unknown id

## Structure

- `src/app.ts` — Express app factory (`createApp`), used directly by tests
- `src/index.ts` — process entry point, starts the HTTP listener
- `src/splashImages.ts` — manifest + path resolution for the splash-image asset set
- `assets/splash-images/` — the actual image files (not under `src/` — a data file, not something `tsc` should compile, same pattern as `homepage-server`'s `public/`)
