# secure-app-starter

Monorepo for a minimal, secure SaaS starter: a registration/login-enabled webapp client, a homepage/registration site, and a JWT-protected API server, all backed by Clerk for authentication.

See [`docs/OVERVIEW.md`](docs/OVERVIEW.md) for the full component breakdown and interaction flows, and [`CLAUDE.md`](CLAUDE.md) for commands and architecture notes.

## Components

- [`webapp-client/`](webapp-client) — the starter webapp client (React + Vite + TypeScript)
- [`homepage-server/`](homepage-server) — marketing/registration site (Node.js + Express)
- [`application-server/`](application-server) — JWT-protected API server (Node.js + Express)
- [`auth-server/`](auth-server) — no code; documentation and design decisions for this project's use of [Clerk](https://clerk.com)

> **Note:** this repo is expected to be renamed to `secure-app-starter` (along with its GitHub repo) in a future step.
