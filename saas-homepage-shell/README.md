# saas-homepage-shell

Marketing/registration site where users sign up for the SaaS service. Serves a static homepage and exposes the Clerk publishable key to the client for sign-up/sign-in.

See [`../docs/OVERVIEW.md`](../docs/OVERVIEW.md) for this component's role and interaction sequences.

## Commands

- `npm run dev` — start the server with hot reload (`tsx watch`)
- `npm run build` — type-check and compile to `dist/`
- `npm start` — run the compiled server (`dist/index.js`)
- `npm test` — run the test suite (Vitest + Supertest)

## Configuration

Copy `.env.example` to `.env` and fill in:

- `PORT` — port to listen on (defaults to `3000`)
- `CLERK_PUBLISHABLE_KEY` — from your Clerk project; safe to expose to the browser

## Structure

- `public/` — static homepage (title bar with Login/Register)
- `src/app.ts` — Express app factory (`createApp`), used directly by tests
- `src/index.ts` — process entry point, starts the HTTP listener
