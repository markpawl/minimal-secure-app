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

`npm run dev` can fail repeatedly with `EBUSY` because this repo lives inside a Dropbox-synced folder — see [`../docs/DROPBOX_SYNC.md`](../docs/DROPBOX_SYNC.md) for the symptom and fix. `npm run build && npm run preview` is a reliable fallback in the meantime.
