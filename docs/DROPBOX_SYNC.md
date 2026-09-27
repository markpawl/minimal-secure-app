# Dropbox sync vs. node_modules/dist

This repo lives inside a Dropbox-synced folder (`.../Dropbox/dev-dropbox/secure-app-starter`), which is used to keep the project in sync between a Mac and a Windows machine. Dropbox actively locks files while it syncs, and that conflicts with tools that do rapid renames inside `node_modules`/`dist` — most notably Vite's dependency optimizer.

## Symptom

`npm run dev` (in `webapp-client`) fails repeatedly with something like:

```
[vite] (client) error while updating dependencies:
Error: EBUSY: resource busy or locked, rename '...\node_modules\.vite\deps_temp_xxxxx' -> '...\node_modules\.vite\deps'
```

The same class of error (`EPERM`/`EBUSY`) can also show up from `npm run build` (renaming `dist/assets`) or even from git (`fatal: Unable to write new index file`) — all caused by Dropbox locking a file mid-operation.

## Fix: mark `node_modules/` and `dist/` as Dropbox-ignored

Dropbox has a feature for excluding specific folders from sync without removing them from the synced tree or turning them into online-only placeholders. It's not exposed in the right-click context menu — it's a hidden per-folder marker you set from the command line.

**Windows (PowerShell):**

```powershell
Set-Content -Path <path-to-folder> -Stream com.dropbox.ignored -Value 1
```

**Mac (Terminal):**

```sh
xattr -w com.dropbox.ignored 1 <path-to-folder>
```

Applied on the Windows machine (2026-09-26) to:

- `webapp-client/node_modules`, `webapp-client/dist`
- `application-server/node_modules`, `application-server/dist`
- `homepage-server/node_modules`, `homepage-server/dist`

## Caveats

- **This marks a specific folder instance, not a rule/pattern.** A clean `rm -rf node_modules && npm install` (or a first `npm install`/`npm run build` on a machine that hasn't had this applied yet — e.g. the Mac side) recreates the folder without the marker. It needs to be reapplied whenever that happens.
- If `npm run dev` starts looping on `EBUSY` again, re-running the command above on the affected folder is the first thing to check.
- In the meantime, `npm run build && npm run preview` is a reliable fallback — it doesn't hit Vite's dependency-optimizer step, so it isn't affected by this issue.

## Longer-term alternative

This wouldn't be a problem if `node_modules`/`dist` weren't inside the Dropbox-synced tree at all (they're already gitignored, so nothing is lost by excluding them from Dropbox too). If this keeps being friction, consider Dropbox's account-wide "Selective Sync" for these paths, or moving active development to a non-Dropbox-synced location and using Dropbox only for the tracked source files.
