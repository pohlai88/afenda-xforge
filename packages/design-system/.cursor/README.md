# Cursor skills (design-system workspace)

If you opened **`packages/design-system`** as the Cursor workspace root, skills must
be linked here — Cursor does not read parent `../../.cursor/skills/`.

From repo root:

```powershell
pwsh tools/sync-cursor-skills-workspace.ps1
```

Then **Developer: Reload Window**.

Verify: **Settings → Rules → Agent Decides** — look for `craft`, `ui-craft`, `afenda-ui-craft`.

In Agent chat, invoke with **`@craft`** or **`@ui-craft`**. Slash commands like
`/ui-craft:craft` are Claude Code only.

Alternatively, open the monorepo root `afenda-Xforge/` as the workspace folder.
