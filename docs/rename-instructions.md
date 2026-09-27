1. Rename the GitHub repo

gh repo rename secure-app-starter --repo markpawl/secure-app-starter
Or via GitHub web UI: Settings → repository name. GitHub auto-redirects the old URL, but don't rely on that long-term.

2. Update the local git remote (on each machine)

git remote set-url origin https://github.com/markpawl/secure-app-starter.git
git remote -v   # verify

3. Rename the local folder — do this carefully with Dropbox

This is the trickiest step because two machines sync the same folder.

1. On one machine only: fully quit any dev servers (npm run dev etc.) and let Dropbox finish syncing (check the Dropbox tray icon shows "up to date").
2. Rename the folder: dev-dropbox/secure-app-starter → dev-dropbox/secure-app-starter.
3. Wait for Dropbox to fully propagate the rename (watch the sync icon) before touching anything on the other machine.
4. On the other machine, don't rename it yourself — let Dropbox sync the rename over. Renaming independently on both sides at once is how you get duplicate/conflicted folders.
5. Re-open any editor/IDE windows, terminal cds, or shell aliases pointing at the old path.

4. Update in-repo references

Found via grep — 5 files mention the old name:

┌────────────────────────────────────────┬──────────────────────────────────────────────────────┐
│                  File                  │                        Change                        │
├────────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ README.md:1                            │ # secure-app-starter → # secure-app-starter          │
├────────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ CLAUDE.md:73                           │ Update/remove the "planned rename" note (it'll be    │
│                                        │ done)                                                │
├────────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ docs/OVERVIEW.md:29                    │ Same — update/remove the planned-rename note         │
├────────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ docs/DROPBOX_SYNC.md:3                 │ Update the example path                              │
│                                        │ .../Dropbox/dev-dropbox/secure-app-starter           │
├────────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ homepage-server/public/index.html:5,14 │ <title> and visible <span> text                      │
└────────────────────────────────────────┴──────────────────────────────────────────────────────┘

5. Update this Claude Code project's path

Your Claude Code project (and this memory directory) is keyed to the old path (C--Users-markp-Dropbox-dev-dropbox-secure-app-starter). After the folder rename, the next session opened at the new path will start a new Claude Code project — it won't automatically inherit this history/memory. If you want continuity, you'd need to manually copy ~/.claude/projects/C--Users-markp-Dropbox-dev-dropbox-secure-app-starter/ contents over, or just accept a fresh start.

6. Anything else local

- IDE workspace files (.vscode/*.code-workspace if any) referencing the old absolute path.
- Any shell aliases/scripts (.bashrc, PowerShell profile) with hardcoded paths.

---

Want me to do step 4 (the in-repo text edits) now, or hold off until after you've done the GitHub rename and folder move? I can prep the file edits independently of the GitHub/folder steps since those are yours to do manually.
