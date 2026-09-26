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

This repo lives inside a Dropbox-synced folder, which caused `npm run dev` to fail repeatedly with `EBUSY` while Vite's dependency optimizer renamed `node_modules/.vite/deps_temp_*` into place (Dropbox locks the folder mid-sync). Fixed by marking `node_modules/` and `dist/` as Dropbox-ignored — see the note in `../CLAUDE.md` for the exact command (Windows vs. Mac) and why this needs reapplying after a clean `node_modules` reinstall. If `dev` starts looping on `EBUSY` again, that's the first thing to check; `npm run build && npm run preview` is a reliable fallback in the meantime.
