# Workspace Audit Evidence — Phase 1 (Docked Panels)

Contextual audit inspector for site-content workspaces. Operators open **parallel docked compartments** from the site topbar — IDE-style — without modal overlays or losing main-surface context.

## Architecture requirements

### Layer ownership

| Concern | Owner | Path |
| --- | --- | --- |
| Docked panel layout, scope state, fetch wiring | App workspace wiring | `apps/app/app/_components/workspace/audit-evidence/` |
| Topbar panel toggles | App workspace wiring | `workspace-topbar-controls.tsx` |
| Provider + layout mount | App workspace wiring | `workspace-frame.tsx`, `site-content-sidebar-shell.tsx` |
| Theme Studio scope sync | Theme Studio preview | `theme-studio-audit-scope-sync.tsx` |
| Authenticated scope sync | Authenticated shell | `authenticated-audit-scope-sync.tsx` |
| Audit event contract & persistence | `@repo/audit` | `packages/audit/` |
| HTTP surface | App API route | `apps/app/app/api/audit/` |
| Resizable primitives | `@repo/ui` shadcn | `components/ui/resizable` |
| Workspace compose framework | Human-owned | `packages/ui/.../workspace/**` — **do not edit** |

### Panel layout (IDE model)

```
┌──────┬─────────────────────────┬─────────────┐
│ site │      main content       │ right panel │  ← 7W1H detail (collapsible)
│ nav  │                         │  (resizable)│
├──────┴─────────────────────────┴─────────────┤
│           bottom panel (resizable)           │  ← activity stream
└──────────────────────────────────────────────┘
```

- **Bottom + right panels are parallel** — both can stay open while editing/reviewing the main surface.
- **Collapse, not unmount** — panel content and scroll state survive collapse via `react-resizable-panels` `collapsible` + `panelRef.expand/collapse`.
- **Resize handles** — drag to adjust compartment size; layout persisted via `autoSaveId`.
- **Open state persisted** — `localStorage` keys mirror sidebar behavior persistence.

### Dependency direction

```
Site topbar icons
  → useWorkspaceAuditEvidence (React context)
    → WorkspaceAuditEvidenceDockedLayout (in-flow resizable panels)
      → fetchWorkspaceAuditEvidence (client)
        → GET /api/audit
          → listAuditEventsForTenant (@repo/audit)
```

### 7W1H alignment

| Panel | Questions answered |
| --- | --- |
| Bottom (activity stream) | **When**, **Who**, **What**, **Outcome**, change count |
| Right (detail) | Full 7W1H sections + `diff[]` field changes |

North star: `packages/audit/7w1h.md`.

## Definition of Done (Phase 1)

1. `WorkspaceAuditEvidenceShell` provides context when `siteContentSidebar` is set.
2. `WorkspaceAuditEvidenceDockedLayout` wraps main site content in-flow (not overlay).
3. Topbar icons toggle bottom/right compartments with `aria-pressed` / `aria-expanded`.
4. Both panels can be open concurrently; main surface reflows.
5. Collapse preserves mounted panel state; resize handles persist layout.
6. Bottom lists scoped events; row click opens detail in right compartment.
7. Empty, loading, error (403), retry states handled.
8. Theme Studio + authenticated scope sync wired.
9. Unit tests + `pnpm --filter app typecheck` pass.

## Acceptance matrix

| ID | Scenario | Expected |
| --- | --- | --- |
| A1 | Open Theme Studio site content | Bottom + right panel icons in topbar |
| A2 | Toggle bottom icon | Bottom compartment expands/collapses in-flow |
| A3 | Toggle right icon | Right compartment expands/collapses in-flow |
| A4 | Open both panels | Main surface shrinks; both compartments visible |
| A5 | Click stream row | Right panel shows 7W1H; bottom stays open |
| A6 | Collapse via header button | Panel collapses; toggle state syncs |
| A7 | Drag resize handle | Panel size changes; layout auto-saved |
| A8 | Reload page | Panel open state restored from localStorage |
| A9 | Switch HR feature | Scope updates; data refreshes when panels open |
| A10 | No `audit.read` | Error + retry in bottom panel |
| A11 | Link "Open full audit" | Navigates to `/audit` |

## File map

```
audit-evidence/
  workspace-audit-evidence.contract.ts
  workspace-audit-evidence.query.ts
  workspace-audit-evidence.client.ts
  workspace-audit-evidence-scope.ts
  workspace-audit-evidence-context.tsx
  workspace-audit-evidence-panel.constants.ts
  workspace-audit-evidence-panel-chrome.tsx
  workspace-audit-evidence-docked-layout.tsx      ← in-flow parallel panels
  workspace-audit-evidence-bottom-panel.tsx
  workspace-audit-evidence-right-panel.tsx
  workspace-audit-evidence-stream-table.tsx
  workspace-audit-evidence-7w1h.tsx
  workspace-audit-evidence-shell.tsx
  authenticated-audit-scope-sync.tsx
  workspace-audit-evidence.phase1.md
```

## Out of scope (Phase 2+)

- Global `MetadataTable` replacement
- Real-time audit subscriptions
- Export from contextual panels
- Editing `packages/ui` workspace compose
- Mock audit seed in Theme Studio
