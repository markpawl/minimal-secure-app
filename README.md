# minimal-secure-app

Monorepo for a minimal, secure SaaS starter: a registration/login-enabled webapp client, a homepage/registration site, and a JWT-protected API server, all backed by Clerk for authentication.

See [`docs/OVERVIEW.md`](docs/OVERVIEW.md) for the full component breakdown and interaction flows, and [`CLAUDE.md`](CLAUDE.md) for commands and architecture notes.

## Components

- [`minimal-secure-app/`](minimal-secure-app) — the starter webapp client (React + Vite + TypeScript)
- [`saas-homepage-shell/`](saas-homepage-shell) — marketing/registration site (Node.js + Express)
- [`application-server/`](application-server) — JWT-protected API server (Node.js + Express)
