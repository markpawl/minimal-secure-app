# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) then build for production
- `npm run preview` — serve the production build locally
- `npm run lint` — run oxlint
- `npm test` — run Vitest in watch mode
- `npx vitest run` — run the full test suite once (non-watch)
- `npx vitest run <path>` — run a single test file, e.g. `npx vitest run src/App.test.tsx`
- `npx vitest run -t "<name>"` — run tests matching a name pattern

## Architecture

Standard Vite + React + TypeScript SPA, currently a fresh scaffold (single `App` component in `src/App.tsx`, entry point `src/main.tsx`).

- TypeScript project uses composite references: `tsconfig.json` points to `tsconfig.app.json` (app/browser code, `src/`) and `tsconfig.node.json` (Node-side config files like `vite.config.ts`). Use the right `tsc` project when reasoning about type errors in config files vs. app code.
- Vitest is configured inside `vite.config.ts` (not a separate config file), using `jsdom` and `globals: true`. Test setup (`@testing-library/jest-dom`) is loaded via `src/setupTests.ts`. Tests live alongside source files as `*.test.tsx`.
- Module resolution is `bundler` mode with `verbatimModuleSyntax` enabled — type-only imports must use `import type`.
