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

## Structure

- `src/app.ts` — Express app factory (`createApp`), used directly by tests
- `src/index.ts` — process entry point, starts the HTTP listener
