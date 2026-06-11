# Metadata-UI → App UI/UX Wiring Development Plan

**Package:** `@repo/metadata-ui`  
**Target:** `apps/app` authenticated surfaces  
**Primitives:** `@repo/ui` (shadcn/Radix) + `@repo/design-system` tokens  
**Status:** Package **9.5** — app adoption is the bottleneck  
**Last updated:** 2026-06-11

---

## 1. Readiness Summary

| Dimension | Score | Gate |
|-----------|------:|------|
| Runtime (MUI-001–018) | 10/10 | `pnpm --filter @repo/metadata-ui verify` |
| Visualization (MUI-VIS-001–016) | 9.5/10 | `check:visualization-signoff` |
| Renderer catalog | 9.5/10 | `check:renderer-catalog` (≥95) |
| Per-renderer axe | 38/38 pass | `check:renderer-axe-audit` |
| **App adoption** | **8/10** | `check:metadata-ui-smoke` (dashboard, audit, HR list/detail/upload, hub, assistant) |

**Conclusion:** Wire modules now. Package capability changes only when a migrating route is blocked.

---

## 2. Layer Ownership (do not blur)

| Concern | Owner | App rule |
|---------|--------|----------|
| Entity/field/section schema | `@repo/metadata` | Define metadata before JSX |
| Rendering pipeline | `@repo/metadata-ui` | Orchestrators only — no kind switches |
| Primitives (Button, Table, Dialog) | `@repo/ui` | Never raw `<button>` / `<input>` in routes |
| Tenant brand + lane CSS vars | `@repo/design-system` | `TenantBrandingStyles`, `FeatureLaneScope` |
| Data fetch, auth finality, mutations | `apps/app` route/feature layer | RSC fetch → pass rows/permissions down |
| Form field values, `onAction` | App client components | metadata-ui invokes callbacks; app executes |

---

## 3. Architecture Boundaries (React 19 + App Router)

### Server vs client split

```txt
page.tsx (RSC)
  → load session, tenant, permissions, rows
  → createAppMetadataContext() on server OR pass serializable context inputs
  → pass metadata + discriminated state union to *View client component

*-view.tsx (client only when needed)
  → EntityMetadataPanel / MetadataForm / MetadataSectionStack
  → onAction → server action or route handler
  → onFieldChange → local useState / useReducer (consumer-owned)
```

**Rules (block merge if violated):**

| Rule | Why |
|------|-----|
| No `useEffect` to copy server props into local list state | Server/async data is source of truth — pass props through |
| No derived state in `useEffect` | Compute during render |
| `useFormStatus` only in **child** of `<form>`, never in form parent | React 19 — pending always false on form component |
| Promises for `use()` created in RSC, passed as props — never in render | Avoid infinite re-fetch loops |
| Discriminated unions for route state (`ready` \| `error` \| `forbidden`) | Match dashboard pattern — exhaustive handling |
| Explicit props interfaces — no `React.FC`, no `any` | TypeScript safety at integration boundary |

### Reference pattern (dashboard — keep this shape)

[`dashboard-view.tsx`](../../apps/app/app/(authenticated)/dashboard/dashboard-view.tsx):

- `DashboardSectionState` discriminated union
- `EntityMetadataPanel` for forbidden / error / ready branches
- `AuthenticatedFeatureScope` per module lane
- Server page owns fetch; view owns composition only

---

## 4. Non-Negotiable Wiring Rules

1. **Imports:** `@repo/metadata-ui/components`, `/contracts` — never root barrel ([`check:metadata-ui-imports`](../../apps/app/scripts/check-metadata-ui-imports.mts)).
2. **Context:** Every surface gets `createAppMetadataContext({ tenantId, featureId, actorId, permissions hints, locale })`.
3. **Lanes:** Wrap feature content in `AuthenticatedFeatureScope` (already used on audit, HR, branding).
4. **States:** `MetadataStateBoundary` for loading / empty / error / forbidden — no bespoke empty `<div>`.
5. **Tables:** `EntityMetadataPanel` or `MetadataTable` — delete `ActivityTable` after last consumer migrates.
6. **Forms:** `MetadataForm` + consumer-owned `values` / `onFieldChange` / `onAction`.
7. **Display logic:** Field `kind` in metadata (`status`, `date`, `email`) — no `resolve*Tone()` switches in app.
8. **Authority:** metadata-ui `permissions` are UI hints; server enforces on every mutation.

---

## 5. Visual System (shadcn + Tailwind v4)

Route and view code must not invent styling. metadata-ui renderers already enforce semantic tokens (MUI-VIS-014).

### Token discipline (Tailwind v4)

| Do | Don't |
|----|-------|
| `bg-card`, `text-muted-foreground`, `border-border`, `text-lane-active` | Raw `gray-*`, `slate-*`, hex literals |
| Spacing from one density (`gap-6`/`p-6` comfortable or `gap-4`/`p-4` compact) | Mixed arbitrary spacing per route |
| Lane accents via `AuthenticatedFeatureScope` / `--lane-active-*` | Ad-hoc accent colors per module |
| `@theme inline` tokens from [`globals.css`](../../packages/ui/src/styles/globals.css) | Inline `style={{ color: "#..." }}` |

### shadcn composition recipes (app shell around metadata-ui)

Use these when building **page chrome** metadata-ui does not own:

| Surface | Composition | metadata-ui orchestrator |
|---------|-------------|--------------------------|
| Entity list | header + filter toolbar + panel | `EntityMetadataPanel` |
| CRUD list + row actions | `Table` surface + overflow menu actions | `EntityMetadataPanel` + `MenuActionRenderer` |
| Detail page | header + `Badge` + `Separator` + sections | `MetadataSectionStack` |
| Create/edit record | `Card` + form fields | `MetadataForm` |
| Destructive row action | — (handled in metadata-ui) | `DestructiveActionRenderer` → `AlertDialog` |
| Settings (branding) | `Tabs` + `Card` + design-system forms | `MetadataStateBoundary` only |
| Loading / empty / error | — | `MetadataStateBoundary` |

**Anti-patterns (review blockers):**

- Raw HTML form controls where `@repo/ui` + metadata-ui field renderers exist
- Nested `Card` > `Card` > `Card` page layouts
- `Dialog` for delete confirmation (metadata-ui uses `AlertDialog` — don't duplicate)
- Custom table sort/format helpers when field registry handles cells

---

## 6. Shared App Infrastructure (Sprint 0)

| Artifact | Location | Notes |
|----------|----------|-------|
| `createAppMetadataContext()` | `apps/app/app/_lib/metadata-context.ts` | Pure function — safe on server or client |
| `MetadataFeatureShell` | `apps/app/app/_components/metadata-feature-shell.tsx` | `AuthenticatedFeatureScope` + optional `MetadataStateBoundary` wrapper |
| Smoke registry | `apps/app/scripts/check-metadata-ui-smoke.mts` | One assertion per migrated route |

```tsx
// apps/app/app/_lib/metadata-context.ts
import { createMetadataRenderContext } from "@repo/metadata-ui/contracts";
import type { MetadataRenderContext } from "@repo/metadata-ui/contracts";

export type AppMetadataContextInput = {
  tenantId: string;
  featureId: string;
  userId: string;
  permissions?: readonly string[];
  locale?: string;
  mode?: MetadataRenderContext["mode"];
  state?: MetadataRenderContext["state"];
};

export function createAppMetadataContext(
  input: AppMetadataContextInput
): MetadataRenderContext {
  return createMetadataRenderContext(
    {
      actorId: input.userId,
      tenantId: input.tenantId,
      permissions: input.permissions ?? [],
      featureId: input.featureId,
      locale: input.locale ?? "en-US",
      diagnosticsEnabled: process.env.NODE_ENV === "development",
    },
    {
      mode: input.mode ?? "read",
      state: input.state ?? "ready",
      surfaceId: input.featureId,
      routeId: `app/${input.featureId}`,
    }
  );
}
```

**Sprint 0 exit criteria:**

- [x] Dashboard smoke still green
- [x] Pilot route (Audit) uses `createAppMetadataContext`
- [x] No new raw `<button>` / table markup in migrated files
- [x] Delete path documented for `ActivityTable` (removed from `apps/app`)

---

## 7. Rollout Phases

Dependencies: **Sprint 0 → Phase 1 → Phase 2** (metadata authoring gates Phase 2 JSX).

### Phase 1 — Foundation (Week 1)

| ID | Task | Effort | Done when |
|----|------|--------|-----------|
| P1.1 | `createAppMetadataContext` + `MetadataFeatureShell` | S | Done |
| P1.2 | Replace `ActivityTable` consumers | M | Done — app `ActivityTable` deleted |
| P1.3 | Dashboard KPIs → `MetadataSectionStack` `stat` sections | S | Done |
| P1.4 | Extend `check:metadata-ui-smoke` | S | Done — audit registered |

### Phase 2 — List surfaces (Week 2)

**Gate:** EntityMetadata committed before view PR.

| ID | Module | Metadata entity | Orchestrator |
|----|--------|-----------------|--------------|
| P2.1 | Audit | `audit.event` | `EntityMetadataPanel` — **done** |
| P2.2 | HR documents index | `hr.document` | `EntityMetadataPanel` |
| P2.3 | Activity feed | reuse audit/customer metadata | `MetadataSectionStack` + `list` |

**Metadata checklist (per entity):**

- [ ] `entity`, `id`, `labels`, `title`
- [ ] `table.columns[]` — `key`, `label`, `kind` (`status` \| `date` \| `email` \| …)
- [ ] `table.defaultSort`
- [ ] `featureId` matches `module-lane.catalog`
- [ ] Optional `customization` scopes for tenant overlays

### Phase 3 — Detail & forms (Week 3)

| ID | Module | Pattern |
|----|--------|---------|
| P3.1 | HR document detail | RSC fetch → `MetadataSectionStack` (`details`, `timeline`) |
| P3.2 | Document upload | `MetadataForm` + server action in `onAction`; submit button in child for `useFormStatus` if native form wrapper used |
| P3.3 | Read-only settings panels | `MetadataForm` with `readonly` context |

**Branding / appearance:** Keep `@repo/design-system` forms (`BrandingSettingsView`). metadata-ui = state shells only.

### Phase 4 — Section-rich UX (Week 4)

| ID | Surface | Section kinds |
|----|---------|---------------|
| P4.1 | Dashboard 2.0 | `stat`, `table`, `activity` |
| P4.2 | HR workspace | `list`, `timeline`, `form` |
| P4.3 | Workflow previews | `workflow`, `approval` |

### Phase 5 — Customization (Week 5+)

- `customizationLayers` on `EntityMetadataPanel`
- Company-scoped overlays via `@repo/customization`
- Lane validation through existing `AuthenticatedFeatureScope`

---

## 8. Module Playbooks

### 8.1 HR Documents (highest bespoke debt)

**Current:** [`document-summary-list.tsx`](../../apps/app/app/(authenticated)/hr/documents/_components/document-summary-list.tsx) — local tone maps, manual dates, raw links styled as buttons.

**Migration sequence:**

1. Add `hrDocumentEntityMetadata` to `@repo/metadata` (or feature package).
2. RSC page fetches rows; passes metadata + `DashboardSectionState`-style union to view.
3. Replace list with `EntityMetadataPanel` inside `AuthenticatedFeatureScope featureId="hr-suite.employee-management.documents-management"`.
4. **Delete** `resolveDocumentStatusTone`, custom `StatusBadge` mapping, and `document-summary-list.tsx`.
5. Add Storybook story under `metadata-ui-*` mirroring columns.

### 8.2 Audit (pilot — smallest delta after dashboard)

**Current:** [`audit/page.tsx`](../../apps/app/app/(authenticated)/audit/page.tsx) — large client page; `MetadataStateBoundary` only.

**Target:**

- Extract `audit-view.tsx` (client) if interactivity required; keep fetch in RSC `page.tsx`.
- Columns: timestamp (`date`), actor (`text`), action (`text`), resource (`text`), status (`status`).
- Sort via metadata `defaultSort` — no local `compareValues`.

### 8.3 ActivityTable deprecation

**Current:** [`activity-table.tsx`](../../apps/app/app/(authenticated)/_components/activity-table.tsx).

**Target:** Remove file. If a thin adapter is needed temporarily, it must delegate to `MetadataTable` with zero local cell formatting.

---

## 9. PR Review Checklist (per migrated route)

### Critical (block merge)

- [ ] No `@repo/metadata-ui` root barrel import
- [ ] No feature-local `switch (kind)` or tone resolver for display fields
- [ ] No server data copied into `useState` via `useEffect`
- [ ] Forbidden/error/empty use `MetadataStateBoundary` or panel state props — not custom markup
- [ ] Mutations go through server actions / API — not metadata-ui internals

### High

- [ ] `DashboardSectionState`-style discriminated union for async sections
- [ ] `featureId` constant at module top (match lane catalog)
- [ ] Semantic Tailwind tokens only in view chrome
- [ ] Storybook or integration test added

### Style / architecture

- [ ] View component < 300 lines — split header / sections if larger
- [ ] State colocated with usage
- [ ] Unused bespoke components deleted in same PR (no `_deprecated` files)

---

## 10. Verification Matrix

| Layer | Command |
|-------|---------|
| Package full verify | `pnpm --filter @repo/metadata-ui verify` |
| Visualization sign-off | `pnpm --filter @repo/metadata-ui check:visualization-signoff` |
| Renderer axe | `pnpm --filter @repo/metadata-ui check:renderer-axe-audit` |
| App import boundary | `pnpm --filter app check:metadata-ui-imports` |
| App integration smoke | `pnpm --filter app check:metadata-ui-smoke` |
| Storybook browser smoke | `pnpm --filter storybook check:metadata-ui-browser-smoke` |
| Monorepo CI | `pnpm ci:metadata-ui` |
| Visual golden (PR optional) | `pnpm --filter storybook test:visual` |
| Storybook token/layout | `pnpm --filter storybook check:storybook-visual-tokens` |

---

## 11. Anti-Patterns → Replacements

| Anti-pattern | Replacement |
|--------------|-------------|
| `ActivityTable` + `formatCellValue` | `EntityMetadataPanel` + field registry |
| `StatusBadge` + `resolve*Tone()` | metadata field `kind: "status"` |
| Custom empty `<div>` + CTA link styled as raw anchor button | `MetadataStateBoundary` + `@repo/ui` `Button asChild` |
| `useEffect(() => setRows(data), [data])` | Pass `rows` prop from RSC parent |
| Inline hex / gray Tailwind in views | Semantic tokens + lane scope |
| Duplicate delete `window.confirm` | `DestructiveActionRenderer` (already in package) |
| Menu overflow as direct ghost click | `MenuActionRenderer` (`DropdownMenu`) |

---

## 12. Definition of Done (per route)

1. RSC owns fetch; client view owns composition and callbacks only.
2. `createAppMetadataContext` with catalog `featureId`.
3. `AuthenticatedFeatureScope` wraps feature content.
4. Data surfaces use metadata-ui orchestrators.
5. Bespoke list/form/table code **removed** (not commented out).
6. Storybook story or route integration test.
7. Entry in `check:metadata-ui-smoke.mts`.
8. PR passes `ci:metadata-ui`.

---

## 13. Risk Register

| Risk | Mitigation |
|------|------------|
| Metadata not authored before JSX work | Phase 2 PR blocked until `@repo/metadata` entity lands |
| Audit page size / client complexity | Split RSC `page.tsx` + thin `audit-view.tsx` |
| Menu overflow UX change | Document in PR; matches MUI-VIS-004/016 |
| Branding pages vs MetadataForm | design-system owns branding forms |
| Large tables | Server pagination in RSC; `pageSize` on panel |
| Stale closure in table search | Prefer panel built-ins; avoid parallel client table state |

---

## 14. Immediate Next Actions

1. **Phase 2 HR documents** — land `hr.document` metadata → `documents-view.tsx` → `EntityMetadataPanel` → smoke/tests.
2. **Phase 3** — document detail `MetadataSectionStack`; upload `MetadataForm` hybrid.
3. **Phase 4** — native stat KPI renderer; dashboard 2.0 + HR hub sections.
4. **Phase 5** — `customizationLayers` on audit/HR/dashboard entity panels.

Package 9.5 gates (`check:renderer-axe-audit`, `check:renderer-catalog`, `check:visualization-signoff`) are already in `pnpm verify`.

---

## Related Documents

- [`architecture-and-feature-requirement.md`](../architecture-and-feature-requirement.md) — pipeline, MUI-VIS gates
- [`README.md`](../README.md) — ownership rules
- [`changes/metadata-ui.md`](../changes/metadata-ui.md) — changelog (MUI-VIS-016, menu DropdownMenu)
- [`globals.css`](../../packages/ui/src/styles/globals.css) — Tailwind v4 `@theme inline` source of truth
