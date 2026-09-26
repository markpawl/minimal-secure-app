# webapp-client

The end-user web app client: registration/login (via Clerk), account settings, user profile, and user preferences. Intended as a starter template that other apps extend.

See [`../docs/OVERVIEW.md`](../docs/OVERVIEW.md) for this component's role and interaction sequences, and [`../auth-server/README.md`](../auth-server/README.md) for how it integrates with Clerk.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) then build for production
- `npm run preview` — serve the production build locally
- `npm run lint` — run oxlint
- `npm run lint:eslint` — run ESLint
- `npm test` — run Vitest in watch mode

## Configuration

Copy `.env.example` to `.env` and fill in:

- `VITE_CLERK_PUBLISHABLE_KEY` — from your Clerk project; safe to expose to the browser

## Known issue: dev server + Dropbox

If this repo lives inside a Dropbox-synced folder, `npm run dev` can fail repeatedly with `EBUSY` errors while Vite's dependency optimizer tries to rename `node_modules/.vite/deps_temp_*` into place — Dropbox locks the folder mid-sync. If `dev` gets stuck in this loop, `npm run build && npm run preview` serves the production build instead (no dependency-optimizer step, so it isn't affected) and is a reliable way to check the app still works. The real fix is excluding `node_modules` (and ideally `dist`, `node_modules/.vite`) from Dropbox sync for this project.
