# Metadata UI Architecture — Production Enterprise 9.5

## Business Definition

**Metadata UI Architecture is the XForge package capability that converts declarative metadata into rendered React UI through governed adapters, registries, renderers, diagnostics, and state-boundary components without taking ownership of server-side authority or metadata source contracts.**

---

## Production Positioning

Metadata UI is a governed **rendering runtime**, not a metadata authority or business-logic layer. It converts approved metadata into React UI through explicit adapters, registries, renderers, diagnostics, and state boundaries.

It must remain a rendering package only. It must not become the owner of metadata contracts, customization governance, server authority, feature business logic, persistence, or route data fetching.

---

## Rendering Pipeline

Metadata-driven UI in XForge follows a single resolution path. Feature code must not bypass this pipeline with local kind-to-component maps.

```txt
EntityMetadata / SectionMetadata / FieldMetadata / ActionMetadata
  → createMetadataRenderContext()          [contracts/render-context.defaults.ts]
  → optional customization resolution      [components/metadata-table.tsx only today]
  → renderMetadata{Field|Section|Action|State}()   [adapters/ui-*-adapter.tsx]
  → resolveMetadata*Renderer()             [adapters/metadata-renderer-resolvers.tsx]
  → evaluateMetadataGovernance()           [policy/governance.ts]
  → Renderer component                     [renderers/{fields,actions,sections,states}/]
  → MetadataRenderAdapterResult            [adapters/adapter-result.ts]
  → diagnostics[] + optional telemetry     [adapters/diagnostics.ts, adapters/telemetry.ts]
  → composed surface                       [components/metadata-{form,table,section-stack,state-boundary}.tsx]
```

### Pipeline Invariants

| Invariant | Rule |
| --- | --- |
| Registry resolution | Every field, action, and section kind resolves through a typed registry, never a feature-local `switch (kind)`. |
| Adapter result shape | All adapter entry points return `{ element, diagnostics }`. Components must surface diagnostics when `diagnosticsEnabled` is true. |
| Governance before render | Permission, capability, feature-flag, and readonly checks run before the renderer is invoked. |
| Fallback before throw | Missing renderer, governance denial, and renderer errors produce safe UI states — never unhandled exceptions at the page boundary. |
| Action boundary | Renderers invoke `onAction` callbacks supplied by the consumer. The package must not execute server actions, mutations, or persistence. |
| Data boundary | Renderers receive `value` props; they do not fetch route data or entity records. |

### Primary Entry Points

| Consumer surface | Orchestrator | Adapter calls |
| --- | --- | --- |
| Entity list / panel | `MetadataTable`, `MetadataPanel` | Table cells (partial registry), toolbar actions |
| Metadata form | `MetadataForm` | `renderMetadataField`, `renderMetadataAction`, state shortcut |
| Section layout | `MetadataSectionStack` | `renderMetadataSection` per section |
| Async / permission states | `MetadataStateBoundary` | `renderMetadataState` |

Manifest source of truth: [`metadata-ui.manifest.ts`](./metadata-ui.manifest.ts) — 26 registry entries (3 action, 10 field, 13 section).

---

## Render Context Model

Every adapter call requires a `MetadataRenderContext` created via `createMetadataRenderContext()`.

| Category | Fields | Purpose |
| --- | --- | --- |
| Actor | `actorId`, `actorType?`, `actorRole?` | Identity hints for governance evaluation |
| Tenant | `tenantId`, `companyId?`, `organizationId?`, `workspaceId?` | Scoped rendering context |
| Authorization hints | `permissions`, `capabilities`, `featureFlags` | UI-only hints — **not permission finality** |
| Tracing | `correlationId` | Auto-generated UUID; bound to every diagnostic and telemetry event |
| Surface identity | `featureId?`, `moduleId?`, `routeId?`, `surfaceId?` | Renderer and telemetry attribution |
| Rendering mode | `mode`, `state`, `readonly`, `density` | Create/read/review/update and UI state (`loading`, `ready`, `forbidden`, `invalid`, `degraded`, `partial`, etc.) |
| Localization | `locale`, `timezone` | **Value formatting implemented (MUI-VIS-007); label i18n remains MUI-016** |
| Observability | `diagnosticsEnabled`, `telemetry?` | Opt-in diagnostic surfacing and telemetry sink |

Contract: [`src/contracts/render-context.contract.ts`](./src/contracts/render-context.contract.ts)

---

## Governance And Permission Model

Governance evaluates metadata targets (field, action, section) against the render context before rendering.

| Decision effect | UI behavior | Server authority |
| --- | --- | --- |
| `hide` | `element: null` | Server may still enforce on mutation |
| `disable` | Render with `disabled: true` | Server remains final |
| `readonly` | Render with readonly context | Server remains final |
| `forbidden` | `ForbiddenState` renderer | Server remains final |

Implementation: [`src/policy/governance.ts`](./src/policy/governance.ts)

**Critical boundary:** Metadata UI may hide, disable, or mark readonly based on context hints. It must never be treated as the authorization layer. All mutation paths require server-side policy enforcement outside this package.

---

## Renderer Taxonomy

| Family | Registry | Count | Resolution |
| --- | --- | ---: | --- |
| Field | `defaultFieldRegistry` | 10 | Generated from manifest |
| Action | `defaultActionRegistry` | 3 | Generated from manifest |
| Section | `defaultSectionRegistry` | 13 | Generated from manifest |
| State | `defaultStateRegistry` | 10 | Generated from manifest |

State renderers (`loading`, `empty`, `error`, `forbidden`, `ready`, `invalid`, `degraded`, `partial`, `readonly`, `maintenance`) are manifest-backed and verified through `check:generated`, `check:renderer-registry`, and `tests/generated/renderer-smoke.generated.test.tsx`.

Table column cell rendering routes through `renderMetadataTableCellResult` and the field registry — see [`ui-table-cell-adapter.tsx`](./src/adapters/ui-table-cell-adapter.tsx).

---

## Customization Integration Scope

`@repo/customization` is integrated **only at the entity table surface**:

- `MetadataTable`, `MetadataPanel`, `EntityMetadataTable`, `EntityMetadataPanel`
- Resolution via `resolveCustomizedEntityMetadata()` or `resolveLayeredCustomizedEntityMetadata()`
- Applied as a **pre-render metadata transform** before table composition

**Not integrated today:** `MetadataForm`, `MetadataSectionStack`, field/section/action adapters.

Customization governance contracts remain owned by `@repo/customization`. Metadata UI consumes resolved output; it does not own overlay rules or persistence.

---

## Extension Points For Consumers

| Mechanism | API | Use case |
| --- | --- | --- |
| Registry override | `renderMetadataField({ registry })` etc. | Inject or replace renderers per call |
| Immutable registration | `defaultFieldRegistry.register({ key, renderer, version })` | Extend default registry at startup |
| Render context | `createMetadataRenderContext({ permissions, telemetry, ... })` | Pass actor, tenant, and observability context |
| Action callback | `onAction` on action renderers / form props | Wire consumer-owned execution |
| Customization layers | `customization` / `customizationLayers` on table props | Apply entity metadata overlays |

**Not yet available:** layout registry, composition walker, plugin manifest, schema-version negotiation.

---

## Skills Reference — Visualization Requirements

Metadata UI must specify **how metadata maps to visible, accessible, trustworthy UI** — not implement a separate design system. The following skills inform requirement definition, review gates, and acceptance criteria. Use them when authoring or auditing visualization requirements in this document.

| Skill | Role in this document | What it specifies (not implements) |
| --- | --- | --- |
| `frontend-design-review` | Quality pillars and review checklist | Primary action clarity, state completeness, design-system compliance, trustworthy error/loading copy |
| `web-design-guidelines` | Vercel Web Interface Guidelines | Focus states, form labeling, animation safety, typography, empty/long content, destructive confirmation, locale formatting |
| `web-accessibility` | WCAG 2.1 / ARIA minimums | Keyboard paths, contrast, field-error association, dialog patterns, screen-reader announcements |
| `tailwind-design-system` | Token and density discipline | Semantic tokens via `@repo/ui`, density modes, theme-safe rendering, no hardcoded visual values in renderers |
| `shadcn-ui` | Compose-group mapping | Manifest `composeGroup` → `@repo/ui` primitive families; component state variants |
| `react-aria-components` | Accessible interaction states | `focus-visible`, `disabled`, `pressed`, keyboard-equivalent behavior for interactive renderers |
| `technical-writing` | Requirement document structure | Separates runtime requirements (MUI-*) from visualization requirements (MUI-VIS-*), evidence, and verification gates |
| `playwright-best-practices` | Visual/a11y verification | axe-core audits, state screenshots, responsive checks in CI |

### Visualization ownership boundary

| Owns | Package |
| --- | --- |
| Primitive visuals, tokens, themes, component variants | `@repo/ui` |
| Which primitive family a metadata kind maps to (`composeGroup`) | `@repo/metadata-ui` manifest |
| Visible states, copy tone, hierarchy, and interaction affordances for metadata surfaces | `@repo/metadata-ui` renderers (specified here) |
| Brand theming and product visual direction | App / design system consumers |

---

## Visualization And Interaction Requirements

These requirements define **what users see and experience** when metadata is rendered. They complement runtime requirements (MUI-001–MUI-018) and are verifiable through review checklists, renderer contracts, and automated a11y gates — not only through implementation code.

Derived from: `frontend-design-review` quality pillars, Vercel Web Interface Guidelines, WCAG 2.1 AA minimums, and manifest `composeGroup` contracts.

### Quality pillars (review lens)

Every metadata surface must pass three review pillars before 9.5 sign-off:

| Pillar | Metadata UI interpretation | Applies to |
| --- | --- | --- |
| **Frictionless insight → action** | Primary action obvious on forms/toolbars; table rows link to detail when metadata declares navigation; cancel/back paths visible on destructive flows | Forms, tables, actions, workflow sections |
| **Quality craft** | All renderers compose `@repo/ui` primitives; density from render context respected; every state has intentional visual treatment | All renderer families |
| **Trustworthy building** | Loading/empty/error/forbidden/degraded states use honest copy; destructive actions require confirmation; diagnostics visible when enabled | State renderers, action renderers, fallbacks |

### Functional visualization requirements (MUI-VIS)

| Code | Requirement | Skill source | Verification |
| --- | --- | --- | --- |
| **MUI-VIS-001** | Every renderer shall map to a manifest `composeGroup` backed by a registered `@repo/ui` primitive family. | shadcn-ui, manifest | `check:generated`, compatibility report |
| **MUI-VIS-002** | Field renderers shall expose visual states: default, disabled, readonly, error, and focus-visible — using design tokens, not hardcoded colors. | tailwind-design-system, web-design-guidelines | Renderer review + token lint |
| **MUI-VIS-003** | State renderers shall each have a distinct visual tone, iconography or skeleton pattern, and actionable copy. | frontend-design-review | State snapshot matrix (below) |
| **MUI-VIS-004** | Action renderers shall visually distinguish primary, destructive, and menu actions; destructive actions shall require explicit confirmation before `onAction`. | web-design-guidelines, frontend-design-review | Action renderer tests + review |
| **MUI-VIS-005** | Form fields shall associate labels, controls, and inline errors (`htmlFor`, `aria-describedby`, `role="alert"` on errors). | web-accessibility, web-design-guidelines | a11y audit per field renderer |
| **MUI-VIS-006** | Interactive renderers shall be fully keyboard-operable with visible focus indicators; no `outline-none` without replacement. | web-accessibility, react-aria-components | Keyboard + focus review |
| **MUI-VIS-007** | Numeric, date, and currency fields shall format display values via `Intl.*` using render context `locale` and `timezone`. | web-design-guidelines | Locale propagation tests (blocked on MUI-016) |
| **MUI-VIS-008** | Render context `density` (`compact` \| `comfortable` \| `default`) shall affect spacing and control sizing in field, section, and toolbar renderers. | tailwind-design-system | Density variant tests |
| **MUI-VIS-009** | Long labels, values, and table cell content shall truncate or wrap safely; empty strings shall not produce broken layout. | web-design-guidelines | Content-length fixture renders |
| **MUI-VIS-010** | Animations in metadata surfaces shall honor `prefers-reduced-motion` and animate only `transform`/`opacity`. | web-design-guidelines | Motion review |
| **MUI-VIS-011** | Surface kinds (`form`, `list`, `detail`, `dashboard`, `workflow`) shall declare expected visual hierarchy: title → description → primary content → secondary actions. | frontend-design-review, surface.contract | Surface contract implementation (MUI-015) |
| **MUI-VIS-012** | Fallback and diagnostic UI shall be visually distinct from normal content and include correlation ID when `diagnosticsEnabled` is true. | frontend-design-review (trustworthy) | Diagnostics visibility tests |
| **MUI-VIS-013** | Complex layouts (orbital, radial, stacked stages) shall use deterministic sizing, pin-based positioning, resolvable relative imports, and shared layout math — no inline `transform` combined with hover motion on the same node. | layout-composition-contract, orbit-layout | `check:layout-composition-visual`, Storybook `check:intro-layout`, visual golden stories |
| **MUI-VIS-014** | Production metadata-ui surfaces (`renderers`, `components`, `adapters`) shall use semantic design tokens and `@repo/ui` primitives — no raw palette utilities, inline color literals, or raw form controls. | visual-token-contract, tailwind-design-system | `check:renderer-visual-tokens`, `check:field-visual-tokens` |
| **MUI-VIS-015** | Storybook stories and shared story primitives shall use semantic tokens, registered `@utility` classes for non-standard CSS, and shared orbit layout primitives — no unreliable Tailwind arbitrary utilities or lucide imports without dependency declaration. | storybook-visual-token-contract, layout-composition-contract | Storybook `check:storybook-visual-tokens`, `check:intro-layout`, `check:stylelint`, Biome storybook import override |

### Visual state matrix

Required visual treatment per metadata UI state. State renderers in [`src/renderers/states/`](./src/renderers/states/) are the reference implementation.

| State | Visual tone | Primary element | Copy pattern | User action |
| --- | --- | --- | --- | --- |
| `loading` | Neutral / info | Skeleton or spinner | `"Loading…"` + context description | Wait |
| `empty` | Muted | Empty-state illustration or icon | Explain why empty + suggested next step | Optional CTA |
| `error` | Destructive / alert | Alert panel | Problem + fix/next step | Retry or navigate away |
| `forbidden` | Warning | Lock or shield icon | Explain lack of permission | Contact admin / go back |
| `ready` | Default | Full content | — | Normal interaction |
| `invalid` | Destructive / alert | Alert panel | Contract validation failure detail | Fix metadata or report |
| `degraded` | Warning | Partial content + banner | Explain degraded mode | Continue with caution |
| `partial` | Warning | Partial layout | Identify missing sections | Refresh or retry |
| `readonly` | Muted | Content with disabled inputs | Indicate view-only mode | None |
| `maintenance` | Info | Banner | Maintenance window message | Wait or return later |

Implementation reference: [`StatePanel`](./src/components/state-panel.tsx), [`LoadingState`](./src/renderers/states/loading-state.renderer.tsx).

### Compose group visual contract

Each manifest entry declares a `composeGroup` mapping metadata kinds to `@repo/ui` primitive families.

| Compose group | UI primitive family | Metadata kinds (examples) | Visual expectation |
| --- | --- | --- | --- |
| `button` | Button | action:`button` | Primary/secondary affordance |
| `alert-dialog` | Alert dialog | action:`destructive`, section:`approval` | Confirmation before irreversible action |
| `dropdown-menu` | Dropdown menu | action:`menu` | Overflow actions, keyboard navigable |
| `field` | Form field | field:`text`, `textarea`, `switch` | Label + control + optional hint |
| `input-group` | Input group | field:`email`, `money` | Formatted input with prefix/suffix |
| `number-field` | Number field | field:`number` | Tabular nums, stepper optional |
| `combobox` | Combobox | field:`select` | Searchable selection |
| `checkbox` | Checkbox | field:`checkbox` | Single hit target for label + control |
| `date-selector` | Date picker | field:`date` | Locale-aware date display |
| `badge` | Badge | field:`status` | Status semantic — not color-only |
| `card` | Card | section:`card`, `details`, `stat`, `evidence`, `chart` | Titled container with structured body |
| `data-grid` | Data grid / table | section:`table`, `list` | Sortable columns, row hover, truncation |
| `timeline` | Timeline | section:`activity`, `timeline` | Chronological visual flow |
| `stepper` | Stepper | section:`workflow` | Step progress indicator |
| `statistic-card` | Stat card | section:`dashboard`, `stat` | Metric emphasis, tabular nums |
| `kanban` | Kanban board | section:`kanban` | Column layout, drag affordance |
| `frame` | Frame / section shell | section:`section` | Generic titled region |

Source: [`metadata-ui.manifest.ts`](./metadata-ui.manifest.ts), [`README.md`](./README.md) renderer catalog.

### Surface kind visual hierarchy

From [`surface.contract.ts`](./src/contracts/surface.contract.ts) — implemented via `surface-visual-contract` and surface region markers (MUI-VIS-011):

| Surface kind | Visual hierarchy | Primary user task |
| --- | --- | --- |
| `list` | Toolbar → filters → data grid → pagination | Find and select records |
| `detail` | Header → metadata sections → related actions | Review entity |
| `form` | Title → field groups → validation → submit/cancel | Create or edit |
| `dashboard` | KPI cards → charts → activity feed | Monitor at a glance |
| `workflow` | Stepper → current step content → next/back | Complete multi-step process |

### Visualization acceptance criteria

| No. | Criterion |
| --: | --- |
| 1 | Every manifest renderer has a documented `composeGroup` with a registered `@repo/ui` primitive family. |
| 2 | All ten UI states have distinct, review-approved visual treatments matching the state matrix. |
| 3 | Field renderers pass WCAG AA keyboard and labeling checks. |
| 4 | Destructive actions require confirmation; never fire immediately. |
| 5 | Density mode changes visible spacing/sizing when `context.density` is set. |
| 6 | Dates, numbers, and currency respect `locale` / `timezone` from render context. |
| 7 | Empty, error, and fallback surfaces include actionable copy — not generic placeholders. |
| 8 | No renderer uses hardcoded color, spacing, or font values outside design tokens. |
| 9 | Diagnostics panel is visually distinct when `diagnosticsEnabled` is true. |
| 10 | Visualization requirements are reviewable independently of runtime/code requirements. |

### Visualization requirement coverage

| Requirement | Status | Evidence |
| --- | --- | --- |
| MUI-VIS-001 | **Implemented** | [`metadata-ui.manifest.ts`](./metadata-ui.manifest.ts), [`scripts/check-compose-groups.mts`](./scripts/check-compose-groups.mts), `check:generated`, compatibility report — 38 manifest renderers (incl. 10 state) |
| MUI-VIS-002 | **Implemented** | [`field-visual-state.ts`](./src/renderers/fields/field-visual-state.ts), [`metadata-field-shell.tsx`](./src/renderers/fields/metadata-field-shell.tsx), all field renderers, [`scripts/check-field-visual-tokens.mts`](./scripts/check-field-visual-tokens.mts), [`tests/field-visual-states.test.tsx`](./tests/field-visual-states.test.tsx) |
| MUI-VIS-003 | **Implemented** | [`state-visual-matrix.ts`](./src/renderers/states/state-visual-matrix.ts), [`metadata-state-shell.tsx`](./src/renderers/states/metadata-state-shell.tsx), all 10 state renderers, [`scripts/check-visual-states.mts`](./scripts/check-visual-states.mts), [`tests/state-visual-states.test.tsx`](./tests/state-visual-states.test.tsx) |
| MUI-VIS-004 | **Implemented** | [`action-visual-matrix.ts`](./src/renderers/actions/action-visual-matrix.ts), [`base-action.renderer.tsx`](./src/renderers/actions/base-action.renderer.tsx), `@repo/ui` AlertDialog confirmation, [`scripts/check-action-visual-states.mts`](./scripts/check-action-visual-states.mts), [`tests/action-visual-states.test.tsx`](./tests/action-visual-states.test.tsx) |
| MUI-VIS-005 | **Implemented** | [`field-visual-state.ts`](./src/renderers/fields/field-visual-state.ts), [`metadata-field-shell.tsx`](./src/renderers/fields/metadata-field-shell.tsx), all field renderers (`htmlFor`, `aria-describedby`, `role="alert"` via `FieldError`), [`scripts/check-field-a11y.mts`](./scripts/check-field-a11y.mts), [`tests/field-a11y-states.test.tsx`](./tests/field-a11y-states.test.tsx) |
| MUI-VIS-006 | **Implemented** | [`keyboard-focus-contract.ts`](./src/interaction/keyboard-focus-contract.ts), [`activity-table.tsx`](./src/components/activity-table.tsx), [`metadata-cell-renderers.tsx`](./src/components/metadata-cell-renderers.tsx), [`state-panel.tsx`](./src/components/state-panel.tsx), field/action renderers via `@repo/ui`, [`scripts/check-keyboard-focus.mts`](./scripts/check-keyboard-focus.mts), [`tests/keyboard-focus-states.test.tsx`](./tests/keyboard-focus-states.test.tsx) |
| **MUI-VIS-007** | **Implemented** | [`metadata-value-formatter.ts`](./src/formatting/metadata-value-formatter.ts), number/money/date field renderers, [`metadata-cell-renderers.tsx`](./src/components/metadata-cell-renderers.tsx), [`activity-table.tsx`](./src/components/activity-table.tsx), [`scripts/check-locale-formatting.mts`](./scripts/check-locale-formatting.mts), [`tests/locale-formatting.test.tsx`](./tests/locale-formatting.test.tsx) |
| MUI-VIS-008 | **Implemented** | [`density-visual-contract.ts`](./src/visualization/density-visual-contract.ts), field renderers + [`metadata-field-shell.tsx`](./src/renderers/fields/metadata-field-shell.tsx), [`metadata-toolbar.tsx`](./src/components/metadata-toolbar.tsx), section/form/stack surfaces, [`activity-table.tsx`](./src/components/activity-table.tsx), [`scripts/check-density-visual.mts`](./scripts/check-density-visual.mts), [`tests/density-visual-states.test.tsx`](./tests/density-visual-states.test.tsx) |
| MUI-VIS-009 | **Implemented** | [`content-length-visual-contract.ts`](./src/visualization/content-length-visual-contract.ts), [`metadata-field-shell.tsx`](./src/renderers/fields/metadata-field-shell.tsx), [`metadata-toolbar.tsx`](./src/components/metadata-toolbar.tsx), [`metadata-form.tsx`](./src/components/metadata-form.tsx), [`activity-table.tsx`](./src/components/activity-table.tsx), [`metadata-cell-renderers.tsx`](./src/components/metadata-cell-renderers.tsx), [`scripts/check-content-length.mts`](./scripts/check-content-length.mts), [`tests/content-length-visual-states.test.tsx`](./tests/content-length-visual-states.test.tsx) |
| MUI-VIS-010 | **Implemented** | [`motion-visual-contract.ts`](./src/interaction/motion-visual-contract.ts), [`metadata-motion-skeleton.tsx`](./src/components/metadata-motion-skeleton.tsx), [`state-visual-icons.tsx`](./src/renderers/states/state-visual-icons.tsx), [`loading-state.renderer.tsx`](./src/renderers/states/loading-state.renderer.tsx), [`activity-table.tsx`](./src/components/activity-table.tsx), [`base-action.renderer.tsx`](./src/renderers/actions/base-action.renderer.tsx), [`scripts/check-reduced-motion.mts`](./scripts/check-reduced-motion.mts), [`tests/motion-visual-states.test.tsx`](./tests/motion-visual-states.test.tsx) |
| MUI-VIS-011 | **Implemented** | [`surface-visual-contract.ts`](./src/visualization/surface-visual-contract.ts), [`metadata-surface-region.tsx`](./src/components/metadata-surface-region.tsx), [`metadata-surface.tsx`](./src/components/metadata-surface.tsx), [`metadata-toolbar.tsx`](./src/components/metadata-toolbar.tsx), [`metadata-form.tsx`](./src/components/metadata-form.tsx), [`metadata-table.tsx`](./src/components/metadata-table.tsx), [`activity-table.tsx`](./src/components/activity-table.tsx), [`metadata-section-stack.tsx`](./src/components/metadata-section-stack.tsx), [`metadata-section.renderer.tsx`](./src/renderers/sections/metadata-section.renderer.tsx), [`scripts/check-surface-visual.mts`](./scripts/check-surface-visual.mts), [`tests/surface-visual-states.test.tsx`](./tests/surface-visual-states.test.tsx) |
| MUI-VIS-012 | **Implemented** | [`diagnostics-visual-contract.ts`](./src/visualization/diagnostics-visual-contract.ts), [`metadata-diagnostics-panel.tsx`](./src/components/metadata-diagnostics-panel.tsx), [`compose-metadata-with-diagnostics.tsx`](./src/components/compose-metadata-with-diagnostics.tsx), [`error-state.renderer.tsx`](./src/renderers/states/error-state.renderer.tsx), [`fallbacks.tsx`](./src/adapters/fallbacks.tsx), [`metadata-form.tsx`](./src/components/metadata-form.tsx), [`metadata-table.tsx`](./src/components/metadata-table.tsx), [`ui-state-adapter.tsx`](./src/adapters/ui-state-adapter.tsx), [`scripts/check-diagnostics-visual.mts`](./scripts/check-diagnostics-visual.mts), [`tests/diagnostics-visual-states.test.tsx`](./tests/diagnostics-visual-states.test.tsx) |
| MUI-VIS-013 | **Implemented** | [`layout-composition-contract.ts`](./src/visualization/layout-composition-contract.ts), [`orbit-layout.ts`](./src/visualization/orbit-layout.ts), [`scripts/check-layout-composition-visual.mts`](./scripts/check-layout-composition-visual.mts), [`tests/orbit-layout.test.ts`](./tests/orbit-layout.test.ts), Storybook [`metadata-orbit-layout.tsx`](../apps/storybook/stories/metadata-orbit-layout.tsx), [`scripts/check-intro-layout.mts`](../apps/storybook/scripts/check-intro-layout.mts) |
| MUI-VIS-014 | **Implemented** | [`visual-token-contract.ts`](./src/visualization/visual-token-contract.ts), [`scripts/visual-token-rules.mts`](./scripts/visual-token-rules.mts), [`scripts/check-renderer-visual-tokens.mts`](./scripts/check-renderer-visual-tokens.mts), [`scripts/check-field-visual-tokens.mts`](./scripts/check-field-visual-tokens.mts) |
| MUI-VIS-015 | **Implemented** | [`storybook-visual-token-contract.ts`](../apps/storybook/stories/storybook-visual-token-contract.ts), [`scripts/check-storybook-visual-tokens.mts`](../apps/storybook/scripts/check-storybook-visual-tokens.mts), [`scripts/check-intro-layout.mts`](../apps/storybook/scripts/check-intro-layout.mts), [`scripts/check-theme-css.mts`](../apps/storybook/scripts/check-theme-css.mts), root [`stylelint.config.mjs`](../stylelint.config.mjs), [`tools/stylelint/afenda-css-plugin.mjs`](../tools/stylelint/afenda-css-plugin.mjs), [`tools/stylelint/afenda-css-plugin.test.mjs`](../tools/stylelint/afenda-css-plugin.test.mjs) |

### Visualization verification gates

Visualization requirements are verified through **review + automated checks**, not code alone:

```bash
# Design-system and compose-group compliance (existing)
pnpm --filter @repo/metadata-ui check:generated
pnpm --filter @repo/metadata-ui check:quality-score

# Recommended additions for 9.5 visualization sign-off
pnpm --filter @repo/metadata-ui test:render
pnpm --filter @repo/metadata-ui check:field-a11y      # field label/control/error association (MUI-VIS-005)
pnpm --filter @repo/metadata-ui check:keyboard-focus # keyboard/focus contract (MUI-VIS-006)
pnpm --filter @repo/metadata-ui check:locale-formatting # Intl value formatting (MUI-VIS-007)
pnpm --filter @repo/metadata-ui check:density-visual     # Density spacing/sizing (MUI-VIS-008)
pnpm --filter @repo/metadata-ui check:content-length   # Long content + empty display (MUI-VIS-009)
pnpm --filter @repo/metadata-ui check:diagnostics-visual # diagnostics panel visibility (MUI-VIS-012)
pnpm --filter @repo/metadata-ui check:surface-visual    # surface hierarchy audit (MUI-VIS-011)
pnpm --filter @repo/metadata-ui check:reduced-motion    # prefers-reduced-motion audit (MUI-VIS-010)
pnpm --filter @repo/metadata-ui check:layout-composition-visual # orbital/stack layout safety (MUI-VIS-013)
pnpm --filter @repo/metadata-ui check:renderer-visual-tokens   # package-wide semantic tokens (MUI-VIS-014)
# pnpm --filter @repo/metadata-ui check:a11y          # optional axe audit per renderer family

# Storybook visual audit (`apps/storybook`) — renderer matrices, compose galleries, axe gates
pnpm --filter storybook dev
pnpm --filter storybook test:stories
pnpm --filter storybook check:theme-css    # cross-file theme integration (preview.tsx + badge TSX)
pnpm --filter storybook check:stylelint    # Tailwind v4 + shadcn CSS architecture (dreamsicle + afenda rules)
pnpm run test:stylelint                      # unit tests for afenda Stylelint plugin rules
pnpm --filter storybook check:intro-layout # intro orbit layout + CSS utility gate (MUI-VIS-013)
pnpm --filter storybook check:storybook-visual-tokens # story className hygiene (MUI-VIS-015)
pnpm --filter storybook test:visual:intro  # PR-blocking intro story screenshots
pnpm --filter storybook test:visual   # full golden screenshots; baselines in tests/visual/__screenshots__
# Hosted Storybook: https://pohlai88.github.io/afenda-xforge/ (GH Pages, storybook-pages.yml)
```

### Stylelint rule map (MUI-VIS-015 CSS)

CSS structural invariants for Tailwind v4 + shadcn live in [`stylelint.config.mjs`](../stylelint.config.mjs) and [`tools/stylelint/afenda-css-plugin.mjs`](../tools/stylelint/afenda-css-plugin.mjs). Cross-file Storybook integration checks remain in [`check-theme-css.mts`](../apps/storybook/scripts/check-theme-css.mts).

| tailwind-v4-shadcn / tailwind-design-system rule | Stylelint rule | Gate |
| --- | --- | --- |
| Never put `:root` / `.dark` inside `@layer base` | `afenda/no-root-in-layer-base` | `lint:stylelint` |
| Never use `.dark { @theme { } }` | `afenda/no-dark-nested-theme` | `lint:stylelint` |
| Never double-wrap tokens as `hsl(var(--*))` | `afenda/no-hsl-var-wrap` | `lint:stylelint` |
| Step 2: `@theme inline` maps utilities via `var(--token)` | `afenda/theme-inline-uses-var`, `afenda/require-theme-inline`, `afenda/require-theme-inline-mappings` | `lint:stylelint` |
| Step 1: `:root` / `.dark` at stylesheet root with OKLCH tokens | `afenda/require-top-level-root-dark`, `afenda/token-sources-use-oklch-or-var` | `lint:stylelint` |
| v4 dark mode: `@custom-variant dark (&:where(.dark, .dark *))` | `afenda/require-custom-variant-dark` | `lint:stylelint` |
| Step 4: Storybook extends globals — no duplicate `@import tailwindcss` | `afenda/preview-css-pipeline`, `afenda/tailwind-import-only-in-globals` | `lint:stylelint` |
| Register non-standard CSS as `@utility`, not arbitrary TSX utilities | `afenda/utility-uses-declarations` | `lint:stylelint` |
| preview.tsx imports only preview.css (not globals directly) | — | `check:theme-css` |
| Badge outline/light variants use `*-muted-foreground` on surfaces | — | `check:theme-css` |
| No legacy `@screen` / `@variants` / `@responsive` | `at-rule-disallowed-list` | `lint:stylelint` |
| No raw hex / rgb / hsl in CSS declarations | `color-no-hex`, `function-disallowed-list` | `lint:stylelint` |

Manual review checklist (from `frontend-design-review` + `web-design-guidelines`):

1. Primary action obvious on form and toolbar surfaces.
2. All key states present: hover, focus-visible, disabled, loading, error, empty.
3. Design tokens used — no hardcoded hex/spacing in renderers.
4. Destructive actions confirmed before execution.
5. Error messages include fix/next step.
6. Loading copy ends with `…` (ellipsis character).
7. Tables use `tabular-nums` for numeric columns.
8. Mobile reflow verified for form and table surfaces.

---

## Enterprise 9.5 Principles

| Principle | Requirement |
| --- | --- |
| Boundary-first | No renderer may own business rules, permission finality, or persistence. |
| Registry-first | All renderers must be resolved through typed registries, not feature-local mappings. |
| Fallback-safe | Unknown, invalid, forbidden, degraded, or unsupported metadata must render safe states. |
| Observable by default | Rendering decisions must emit diagnostics and optional telemetry. |
| Public API stable | All consumer imports must use explicit package subpaths (`@repo/metadata-ui/<domain>`). Root barrel remains for backward compatibility only. |
| Server authority preserved | UI may hide or disable actions, but server-side policy remains final. |
| Generator-safe | Generation may create declarations, registries, fixtures, and docs, but not runtime logic. |
| Test-enforced | Public API, renderer resolution, compatibility, and declaration drift must be tested. |
| Context-threaded | Every render path receives a typed `MetadataRenderContext`; no implicit global state. |
| Pipeline-complete | No surface may bypass adapter → registry → renderer resolution. |

---

## Production Runtime Guarantees

| Guarantee | Required Behavior | Current Status |
| --- | --- | --- |
| Invalid metadata | Render invalid/degraded state, never crash the page. | **Implemented** — adapter-entry validation emits `invalid-contract` and renders `InvalidState` |
| Missing renderer | Render fallback renderer with diagnostics event. | **Implemented** |
| Forbidden action | Hide or disable affordance based on context, but never treat UI as final permission. | **Implemented** |
| Unknown section kind | Render unsupported section state with correlation ID. | **Implemented** |
| Registry conflict | Fail verification when duplicate renderer keys or incompatible versions exist. | **Implemented** — duplicate keys fail at build; version constraints enforced at resolve time |
| Telemetry failure | Rendering must continue even if telemetry sink fails. | **Implemented** (`telemetry-resilience.test.ts`) |
| Partial metadata | Render available sections and mark incomplete areas as partial/degraded. | **Implemented** — `section-completeness` wraps `PartialState`/`DegradedState` on all section render paths |
| Client/server split | Server-only concerns must never enter client bundle. | **Implemented** — `./server` / `./client` exports + `check:client-server-boundaries` |
| Pipeline completeness | All kind resolution goes through registries. | **Implemented** — table cells and state renderers route through adapter/registry pipeline |

---

## Critical Gap Analysis

Gaps identified from code audit against production metadata-driven UI expectations.

### P0 — Blocks trustworthy production use

| Gap | Impact | Evidence | Target Requirement |
| --- | --- | --- | --- |
| No controlled field binding | ~~Forms cannot participate in consumer form state~~ **Resolved:** controlled/uncontrolled binding via `onChange` / `onFieldChange`. | [`field-value-binding.ts`](./src/renderers/fields/field-value-binding.ts) | MUI-013 ✓ |
| Table cells bypass field registry | ~~Column kinds resolved by hardcoded switch~~ **Resolved:** table cells route through `renderMetadataTableCellResult` → `renderMetadataField` with `surfaceRole: "table-cell"`. | [`ui-table-cell-adapter.tsx`](./src/adapters/ui-table-cell-adapter.tsx), [`field-table-cell-display.tsx`](./src/renderers/fields/field-table-cell-display.tsx) | MUI-018 ✓ |
| `invalid-contract` diagnostic unused | ~~Invalid metadata shapes are not validated at adapter entry~~ **Resolved:** deep adapter-entry validation for field/action/section contracts. | [`contract-validation.ts`](./src/adapters/contract-validation.ts) | MUI-014 ✓ |
| Consumer fixture test excluded from `pnpm test` | ~~External import safety not verified in default test run~~ **Resolved:** `pnpm test` runs vitest consumer fixture. | [`package.json`](./package.json) | MUI-012 ✓ |

### P1 — Weakens enterprise operability

| Gap | Impact | Evidence | Target Requirement |
| --- | --- | --- | --- |
| Layout/composition contracts unimplemented | Types exist with no adapters, registries, or renderers — dead contract surface. | [`layout.contract.ts`](./src/contracts/layout.contract.ts), [`composition.contract.ts`](./src/contracts/composition.contract.ts), [`surface.contract.ts`](./src/contracts/surface.contract.ts) | MUI-015 |
| Locale on context unused | i18n cannot propagate through renderers; labels come directly from metadata strings. | [`render-context.contract.ts`](./src/contracts/render-context.contract.ts) | **Partial** — value formatting via `locale`/`timezone` (MUI-VIS-007); label resolution remains MUI-016 |
| Customization limited to tables | Forms and section stacks cannot consume customization overlays. | [`metadata-table.tsx`](./src/components/metadata-table.tsx) | MUI-017 |
| State renderers outside manifest | ~~State family inconsistent with field/action/section generation~~ **Resolved:** manifest-backed state registry + `check:renderer-registry`. | [`metadata-ui.manifest.ts`](./metadata-ui.manifest.ts) | MUI-007 **Partial** (version negotiation remains) |
| No `./server` / `./client` entry points | ~~Client bundle boundary not enforceable at import level~~ **Resolved:** explicit subpaths plus `check:client-server-boundaries`. | [`package.json`](./package.json), [`check-client-server-boundaries.mts`](./scripts/check-client-server-boundaries.mts) | MUI-008 ✓ |
| Registry `version` ignored at resolve | Deprecation and version negotiation declared but not enforced. | [`create-renderer-registry.ts`](./src/registry/create-renderer-registry.ts) | MUI-007 |

### P2 — Quality and compliance debt

| Gap | Impact | Evidence | Target Requirement |
| --- | --- | --- | --- |
| Field a11y incomplete on toggle/status surfaces | Checkbox/switch duplicated labels; status badge lacked control id linkage. | [`checkbox-field.renderer.tsx`](./src/renderers/fields/checkbox-field.renderer.tsx), [`text-field.renderer.tsx`](./src/renderers/fields/text-field.renderer.tsx) | **Resolved** — label/control/error association (MUI-VIS-005) |
| Table row/sort keyboard gaps | Raw sort buttons and mouse-only clickable rows broke keyboard operability. | [`activity-table.tsx`](./src/components/activity-table.tsx) | **Resolved** — `@repo/ui` Button sort controls + keyboard-activatable rows (MUI-VIS-006) |
| Density and locale on context unused | Visual formatting and spacing ignore render context. | [`render-context.contract.ts`](./src/contracts/render-context.contract.ts) | **Partial** — locale/timezone value formatting (MUI-VIS-007); density (MUI-VIS-008 **resolved**); label i18n (MUI-016) |
| Destructive confirm uses `window.confirm` | Not accessible, not themeable, breaks trustworthy-building pillar. | [`base-action.renderer.tsx`](./src/renderers/actions/base-action.renderer.tsx) | **Resolved** — AlertDialog confirmation (MUI-VIS-004) |
| No visualization verification gates | Visual/a11y requirements not enforced in CI. | [`package.json`](./package.json) | `check:field-a11y`, `check:keyboard-focus`, `check:locale-formatting`, `check:density-visual`, `check:content-length`, `check:reduced-motion` **implemented**; optional axe audit remains |
| No telemetry sink failure test | ~~Resilience code exists but unverified~~ **Resolved:** `tests/telemetry-resilience.test.ts`. | [`adapters/telemetry.ts`](./src/adapters/telemetry.ts) | MUI-004 ✓ |
| `check:renderer-registry` script missing | ~~9.5 gate documented but not in `package.json`~~ **Resolved:** dedicated gate chains `check:generated` + compose-groups + registry parity tests. | [`scripts/check-renderer-registry.mts`](./scripts/check-renderer-registry.mts) | MUI-007 **Partial** |

---

## Metadata UI Architecture Includes

| Area | What It Covers |
| --- | --- |
| **Adapter Pipeline** | Metadata-to-UI adapters, fallback behavior, diagnostics, governance rules, and telemetry plumbing |
| **Registry And Renderer Surface** | Default renderer registries plus field, action, section, and state renderer implementations |
| **Rendered Components** | Metadata forms, tables, toolbars, state boundaries, section stacks, and status panels |
| **Compatibility And Generation** | Compatibility checks, generated registries, manifest support, consumer fixtures, and declaration snapshots |
| **Public Package Exports** | Explicit subpaths for adapters, components, compatibility, contracts, policy, registry, and renderers |

---

## Metadata UI Architecture Does Not Include

| Excluded Area | Owned By |
| --- | --- |
| Declarative metadata source contracts | `@repo/metadata` |
| Presentational primitive ownership | `@repo/ui` |
| Customization contract ownership | `@repo/customization` |
| Permission finality and server-side execution | Auth, permissions, and execution layers |
| App route ownership and data fetching | App and feature layers |
| Form state management / validation engines | Consumer app or dedicated form layer |
| Layout orchestration beyond section stacks | Future layout registry or app shell |

---

## Source of Truth Ownership

| Data / Business Object | Source of Truth | Notes |
| --- | --- | --- |
| Metadata contracts | `@repo/metadata` | Metadata UI consumes metadata; it does not define the canonical metadata model. |
| Customization overlay contracts | `@repo/customization` | Metadata UI may render resolved output but must not own customization governance contracts. |
| Presentational primitives | `@repo/ui` | Metadata UI composes package-owned UI components but does not replace them as the primitive owner. |
| Renderer composition and diagnostics | `@repo/metadata-ui` | This package owns adapter, registry, fallback, telemetry, and renderer composition concerns. |
| Renderer manifest | `@repo/metadata-ui` | [`metadata-ui.manifest.ts`](./metadata-ui.manifest.ts) drives generated registries. |

---

## Boundary Rules

| Rule | Requirement |
| --- | --- |
| Permission boundary | The package may hide or disable UI affordances, but permission finality remains server-side. |
| API boundary | The package must not call direct server actions or own route-level business logic. |
| Metadata boundary | The package must render metadata contracts, not redefine metadata source semantics. |
| Customization boundary | The package may consume resolved customized metadata, but customization governance remains outside this package. |
| Package boundary | Dependencies are limited to `@repo/metadata`, `@repo/customization`, `@repo/ui`, and package-local runtime/test tooling. |
| Pipeline boundary | No feature or internal surface may resolve renderer kinds outside adapter + registry paths. |
| Action execution boundary | Action renderers emit `onAction` callbacks only; no mutation, fetch, or server-action invocation inside the package. |

---

## Required Package Subpaths

### Implemented today

```txt
@repo/metadata-ui
@repo/metadata-ui/adapters
@repo/metadata-ui/client
@repo/metadata-ui/components
@repo/metadata-ui/contracts
@repo/metadata-ui/compatibility
@repo/metadata-ui/fixtures
@repo/metadata-ui/policy
@repo/metadata-ui/registry
@repo/metadata-ui/renderers
@repo/metadata-ui/server
```

Notes:

- `@repo/metadata-ui/fixtures` is for Storybook, smoke tests, and verification fixtures — not production app imports.
- `@repo/metadata-ui/server` exposes contracts, policy, and compatibility helpers without client renderer barrels.
- `@repo/metadata-ui/client` exposes adapters, components, registries, and renderers for interactive UI surfaces.

---

## Production File Ownership

### Actual layout (as implemented)

```txt
src/
  adapters/           ← pipeline, fallbacks, diagnostics helpers, telemetry emitter, resolvers, state map
  components/         ← forms, tables, panels, section stacks, state boundary, cell renderers
  compatibility/      ← quality assessment and compose compatibility
  contracts/          ← render context, renderer contracts, diagnostics/telemetry types, layout/surface/composition (types only)
  policy/             ← governance evaluation
  registry/           ← create-renderer-registry, default registries
  renderers/
    actions/
    fields/
    sections/
    states/
  generated/          ← manifest-driven registry snapshots, exports, fixtures, compatibility map
tests/
scripts/
snapshots/
metadata-ui.manifest.ts
```

### Embedded modules (not separate top-level folders)

| Concern | Location |
| --- | --- |
| Diagnostics | `src/adapters/diagnostics.ts` + `src/contracts/diagnostics.contract.ts` |
| Telemetry | `src/adapters/telemetry.ts` + `src/contracts/telemetry.contract.ts` |
| Runtime orchestration | `src/adapters/*`, `src/components/*`, `src/adapters/state-renderers.tsx` |

Extracting `diagnostics/`, `runtime/`, and `telemetry/` into top-level folders is optional refactor work — not required for 9.5 if embedded modules remain test-covered.

---

## Enterprise Functional Requirements

### Core requirements (MUI-001 – MUI-005)

| Code | Requirement |
| --- | --- |
| **MUI-001** | System shall expose explicit package exports for metadata UI adapters, components, contracts, registries, policy helpers, compatibility helpers, and renderers. |
| **MUI-002** | System shall render metadata contracts into UI through governed adapter and registry pipelines rather than feature-local ad hoc mappings. |
| **MUI-003** | System shall support state-boundary rendering for loading, empty, error, forbidden, and ready surfaces. |
| **MUI-004** | System shall emit diagnostics, compatibility checks, and telemetry contracts for metadata UI rendering quality. |
| **MUI-005** | System shall preserve package boundaries between metadata source contracts, customization governance, and presentational primitive ownership. |

### Production runtime requirements (MUI-006 – MUI-012)

| Code | Requirement |
| --- | --- |
| **MUI-006** | System shall provide safe fallback rendering for unsupported, invalid, partial, and degraded metadata. |
| **MUI-007** | System shall prevent duplicate renderer keys, unsupported renderer versions, and public API drift during verification. |
| **MUI-008** | System shall preserve client/server boundaries through explicit entry points and package checks. |
| **MUI-009** | System shall expose diagnostics with correlation ID, renderer key, section kind, state, and fallback reason. |
| **MUI-010** | System shall support generated registry artifacts without generating runtime business behavior. |
| **MUI-011** | System shall maintain declaration snapshots for public contracts and renderer exports. |
| **MUI-012** | System shall provide consumer fixture tests proving external packages can import and render safely. |

### Critical gap requirements (MUI-013 – MUI-018)

| Code | Requirement |
| --- | --- |
| **MUI-013** | System shall define a field value binding contract supporting controlled and uncontrolled modes with consumer-supplied `onChange` handlers. |
| **MUI-014** | System shall validate metadata contract shape at adapter entry and emit `invalid-contract` diagnostics for structurally invalid input. |
| **MUI-015** | System shall implement layout and composition renderer pipelines matching existing layout/surface/composition contracts, or remove those contracts from the public surface. |
| **MUI-016** | System shall resolve display labels through render context locale before falling back to metadata-supplied strings. |
| **MUI-017** | System shall expose a universal customization resolution hook applicable to forms, sections, and tables — not only entity table surfaces. |
| **MUI-018** | System shall resolve table column cell kinds through the field registry rather than hardcoded kind switches. |

---

## Diagnostic Code Coverage

| Code | Declared | Runtime emission | Verification |
| --- | --- | --- | --- |
| `missing-renderer` | Yes | Yes | Tested |
| `renderer-error` | Yes | Yes | Tested |
| `missing-permission` | Yes | Yes | Tested |
| `capability-mismatch` | Yes | Yes | Tested |
| `feature-flag-disabled` | Yes | Yes | Tested |
| `readonly-mode` | Yes | Yes | Tested |
| `disabled-renderer` | Yes | Yes | Tested |
| `invalid-contract` | Yes | Yes | Tested (`check:diagnostic-coverage`, adapter entry validation) |
| `deprecated-renderer` | Yes | Yes | Tested (`check:diagnostic-coverage`, resolver deprecation warnings) |
| `duplicate-renderer` | Yes | Yes (manifest/build) | Tested (`check:diagnostic-coverage`, manifest duplicate collector) |
| `unsupported-state` | Yes | Yes | Tested (`check:diagnostic-coverage`, state adapter guard) |

---

## Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | --- |
| 1 | Consumers can import metadata UI capabilities through explicit package subpaths. |
| 2 | Metadata forms, tables, sections, actions, and state surfaces render through package-owned adapter and registry flows. |
| 3 | Loading, empty, error, forbidden, and ready state renderers are package-owned and reusable. |
| 4 | Diagnostics, compatibility, and generated registry checks exist to prevent drift in the public rendering surface. |
| 5 | The package does not take ownership of metadata source contracts, customization contracts, or server-side permission authority. | **Implemented** — package-owned renderer contracts, `src/customization/` facade, UI-only governance hints, `check:authority-boundary` |
| 6 | Invalid, partial, unsupported, or degraded metadata renders safe fallback UI without crashing the page. | **Implemented** — `InvalidState` for invalid contracts, `PartialState`/`DegradedState` section wrapping, unsupported renderer `ErrorState`, `check:fallback-runtime` |
| 7 | Registry conflicts, public API drift, and declaration snapshot mismatches fail verification gates. | **Implemented** — `check:verification-governance`, `check:public-api`, `check:declaration-snapshot`, `check:generated`, `check:compatibility`, `check:renderer-registry`, `validate-manifest` |
| 8 | Client/server entry points are enforced and server-only concerns do not enter the client bundle. |
| 9 | Diagnostics expose correlation ID, renderer key, section kind, state, and fallback reason for every fallback path. |
| 10 | Consumer fixture tests prove real external packages can import and render safely. |
| 11 | Field renderers support controlled value binding for form integration. |
| 12 | Table column rendering uses the same registry pipeline as standalone field rendering. |
| 13 | Layout/composition contracts are either implemented or removed from the public API. |

---

## Requirement Coverage

| Requirement | Status | Evidence |
| --- | --- | --- |
| MUI-001 | **Implemented** | [`package.json`](./package.json), [`scripts/check-public-api.mts`](./scripts/check-public-api.mts), [`scripts/check-package-subpaths.mts`](./scripts/check-package-subpaths.mts), [`tests/package-subpaths.test.ts`](./tests/package-subpaths.test.ts) |
| MUI-002 | **Implemented** | Forms, sections, actions, state boundaries, and table cells route through adapters/registries — [`src/adapters`](./src/adapters), [`check:adapter-pipeline`](./scripts/check-adapter-pipeline.mts), [`adapter-pipeline-surfaces.test.tsx`](./tests/adapter-pipeline-surfaces.test.tsx) |
| MUI-003 | **Implemented** | [`src/renderers/states`](./src/renderers/states), [`MetadataStateBoundary`](./src/components/metadata-state-boundary.tsx), [`MetadataTableLoadingSkeleton`](./src/renderers/states/table-loading-skeleton.tsx), [`check:state-renderer-ownership`](./scripts/check-state-renderer-ownership.mts), [`tests/state-boundary.test.tsx`](./tests/state-boundary.test.tsx), app consumers via `@repo/metadata-ui/components` |
| MUI-004 | **Implemented** | [`src/adapters/diagnostics.ts`](./src/adapters/diagnostics.ts), [`scripts/check-telemetry-schema.mts`](./scripts/check-telemetry-schema.mts), [`scripts/check-diagnostic-coverage.mts`](./scripts/check-diagnostic-coverage.mts), [`tests/telemetry-resilience.test.ts`](./tests/telemetry-resilience.test.ts) |
| MUI-005 | **Implemented** | Package-owned contracts, customization facade, UI-only governance — [`src/policy/governance.ts`](./src/policy/governance.ts), [`src/customization/`](./src/customization/), [`scripts/check-boundaries.mts`](./scripts/check-boundaries.mts), [`scripts/check-authority-boundary.mts`](./scripts/check-authority-boundary.mts), [`tests/authority-boundary.test.ts`](./tests/authority-boundary.test.ts) |
| MUI-006 | **Implemented** | Section completeness wraps `PartialState` / `DegradedState` — [`section-completeness.ts`](./src/adapters/section-completeness.ts), [`ui-section-adapter.tsx`](./src/adapters/ui-section-adapter.tsx), [`label-i18n-and-section-completeness.test.tsx`](./tests/label-i18n-and-section-completeness.test.tsx) |
| MUI-007 | **Implemented** | Version constraints enforced at resolve via `rendererVersionConstraints` — [`renderer-version.ts`](./src/registry/renderer-version.ts), [`metadata-renderer-resolvers.tsx`](./src/adapters/metadata-renderer-resolvers.tsx), [`renderer-version-resolution.test.tsx`](./tests/renderer-version-resolution.test.tsx) |
| MUI-008 | **Implemented** | `./server` / `./client` subpaths + `check:client-server-boundaries` — [`src/server.ts`](./src/server.ts), [`src/client.ts`](./src/client.ts) |
| MUI-009 | **Implemented** | Correlation ID + renderer target asserted on fallback paths — [`tests/fallback-diagnostic-fields.test.tsx`](./tests/fallback-diagnostic-fields.test.tsx), [`tests/governance-diagnostic-coverage.test.tsx`](./tests/governance-diagnostic-coverage.test.tsx), [`scripts/check-diagnostic-coverage.mts`](./scripts/check-diagnostic-coverage.mts) |
| MUI-010 | **Implemented** | [`src/generated`](./src/generated), [`scripts/generate-registry.mts`](./scripts/generate-registry.mts), [`pnpm check:generated`](./package.json) |
| MUI-011 | **Implemented** | [`scripts/check-declaration-snapshot.mts`](./scripts/check-declaration-snapshot.mts), [`snapshots/declaration-snapshot.json`](./snapshots/declaration-snapshot.json) |
| MUI-012 | **Implemented** | Consumer fixture in default `pnpm test` + `check:consumer-fixture-integration` — [`tests/public-api-consumer.render.test.tsx`](./tests/public-api-consumer.render.test.tsx) |
| MUI-013 | **Implemented** | Controlled/uncontrolled field binding — [`field-value-binding.ts`](./src/renderers/fields/field-value-binding.ts) |
| MUI-014 | **Implemented** | Deep adapter-entry contract validation + `check:contract-validation` — [`contract-validation.ts`](./src/adapters/contract-validation.ts) |
| MUI-015 | **Implemented** | Layout/composition adapter pipeline — [`ui-layout-adapter.tsx`](./src/adapters/ui-layout-adapter.tsx), [`ui-composition-adapter.tsx`](./src/adapters/ui-composition-adapter.tsx), [`default-layout-registry.ts`](./src/registry/default-layout-registry.ts), [`check:layout-composition`](./scripts/check-layout-composition.mts) |
| MUI-016 | **Implemented** | Label i18n via `labelCatalog` / `labels` / `labelKey` — [`resolve-metadata-label.ts`](./src/localization/resolve-metadata-label.ts), localized field/action/section adapters, [`check:label-i18n`](./scripts/check-label-i18n.mts) |
| MUI-017 | **Implemented** | Universal customization hook on table, form, and section stack — [`resolve-metadata-customization.ts`](./src/customization/resolve-metadata-customization.ts), [`metadata-form.tsx`](./src/components/metadata-form.tsx), [`metadata-section-stack.tsx`](./src/components/metadata-section-stack.tsx) |
| MUI-018 | **Implemented** | Table column kinds resolve through field registry via `renderMetadataTableCellResult` — [`ui-table-cell-adapter.tsx`](./src/adapters/ui-table-cell-adapter.tsx), [`field-table-cell-display.tsx`](./src/renderers/fields/field-table-cell-display.tsx) |

---

## Production Verification Gates

### Required 9.5 gate set

```bash
pnpm --filter @repo/metadata-ui lint
pnpm --filter @repo/metadata-ui typecheck
pnpm --filter @repo/metadata-ui build
pnpm --filter @repo/metadata-ui test
pnpm --filter @repo/metadata-ui verify
pnpm --filter @repo/metadata-ui check:public-api
pnpm --filter @repo/metadata-ui check:boundaries
pnpm --filter @repo/metadata-ui check:declaration-snapshot
pnpm --filter @repo/metadata-ui check:compatibility
pnpm --filter @repo/metadata-ui check:renderer-registry
pnpm --filter @repo/metadata-ui check:diagnostic-coverage
pnpm --filter @repo/metadata-ui check:telemetry-schema
pnpm --filter @repo/metadata-ui check:consumer-fixture    # includes vitest consumer render test
```

### Gate status

| Gate | Exists | Notes |
| --- | --- | --- |
| `lint` | Yes | Biome |
| `typecheck` | Yes | tsc |
| `build` | Yes | tsc build |
| `test` | Yes | tsx + vitest consumer fixture |
| `verify` | Yes | Full chain including generate + all checks |
| `check:public-api` | Yes | Export targets + `.d.ts` existence |
| `check:boundaries` | Yes | Forbidden deep imports; contract decoupling |
| `check:declaration-snapshot` | Yes | vs `snapshots/declaration-snapshot.json` |
| `check:telemetry-schema` | Yes | vs `snapshots/telemetry-events.json` |
| `check:consumer-fixture` | Yes | Script + vitest — should be part of default `test` |
| `check:generated` | Yes | Manifest validation + registry drift |
| `check:compatibility` | Yes | Runtime compatibility report (Enterprise AC #4) |
| `check:renderer-registry` | Yes | Generated drift + compose-groups + registry parity tests |
| `check:diagnostic-coverage` | Yes | Diagnostic code + governance + telemetry resilience tests |
| `check:verification-governance` | Yes | Enterprise AC #7 — registry/public API/snapshot gate wiring |
| `check:change-note` | Yes | In `verify`, not in 9.5 gate list |
| `check:quality-score` | Yes | In `verify`, threshold 90 |

---

## 9.5 Definition of Done

The package reaches production-enterprise 9.5 only when:

1. All public imports are explicit and tested.
2. Renderer resolution is registry-driven for **all** surfaces including table cells and states.
3. Invalid metadata cannot crash the page; `invalid-contract` diagnostics emitted at adapter entry.
4. Missing renderer paths produce safe fallback UI with correlation ID.
5. Diagnostics identify renderer, metadata kind, fallback reason, and correlation ID on every fallback path.
6. Client/server entry points (`./server`, `./client`) are exported and boundary-tested.
7. Server authority remains outside Metadata UI.
8. Declaration snapshots prevent accidental public contract drift.
9. Consumer fixture tests run in default `pnpm test`.
10. Generator output is limited to registries, exports, docs, fixtures, and snapshots.
11. Field renderers support controlled value binding (MUI-013).
12. Layout/composition contracts are implemented or removed from public API (MUI-015).
13. Customization resolution is available beyond table surfaces (MUI-017).
14. Dedicated `check:renderer-registry` gate passes in CI.
15. Visualization requirements MUI-VIS-001–MUI-VIS-012 pass review and automated a11y gates.
16. All ten UI states match the visual state matrix.
17. Field renderers expose error, focus-visible, and disabled visual states (MUI-VIS-002, MUI-VIS-005).

---

## Risk Register

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Uncontrolled fields break form integration | High | MUI-013 — add `value`/`onChange` contract to field renderers |
| Table cell pipeline bypass causes inconsistent fallbacks | ~~High~~ **Mitigated** | MUI-018 — cells route through field registry + `check:adapter-pipeline` |
| Invalid metadata reaches renderers silently | High | MUI-014 — adapter-entry validation |
| Client bundle pulls server concerns | Medium | MUI-008 — explicit entry points |
| Customization inconsistency across surfaces | Medium | MUI-017 — universal resolution hook |
| Dead public contracts confuse consumers | Medium | MUI-015 — implement or remove layout/surface/composition |
| Consumer safety not in default test run | Medium | Include vitest fixture in `pnpm test` |
| State renderers drift from manifest pipeline | Low | Add states to manifest or document as intentional exception |

---

## Final Production Decision

Metadata UI is approved as a production rendering-runtime package only if it stays inside this boundary:

```txt
metadata contracts → resolved metadata → adapter → registry → renderer → diagnostics
```

It must not cross into:

```txt
business rules
server actions
permission finality
database access
route ownership
customization governance ownership
metadata source ownership
form state ownership
layout orchestration (until MUI-015 is implemented)
```

---

## Implementation Status

**Status:** Implemented core runtime — **9.5 upgrade in progress**

**Last audited:** 2026-06-10

MUI-001 through MUI-018 are implemented. Enterprise AC #1–#7 and AC #8–#13 are implemented; AC #9–#10 remain tracked through diagnostics and verification gates.

| Area | Status | Evidence |
| --- | --- | --- |
| Adapter pipeline | Implemented | [`src/adapters`](./src/adapters) |
| Registry + manifest generation | Implemented | [`metadata-ui.manifest.ts`](./metadata-ui.manifest.ts), [`src/generated`](./src/generated) |
| Governance evaluation | Implemented | [`src/policy/governance.ts`](./src/policy/governance.ts) |
| Fallback + diagnostics runtime | Implemented | [`invalid-contract-fallback.tsx`](./src/adapters/invalid-contract-fallback.tsx), [`section-completeness.tsx`](./src/adapters/section-completeness.tsx), [`check-fallback-runtime`](./scripts/check-fallback-runtime.mts) |
| State boundary rendering | Implemented | [`src/adapters/state-renderers.tsx`](./src/adapters/state-renderers.tsx), [`metadata-state-boundary.tsx`](./src/components/metadata-state-boundary.tsx) |
| Table customization | Implemented | [`metadata-table.tsx`](./src/components/metadata-table.tsx), [`resolve-metadata-customization.ts`](./src/customization/resolve-metadata-customization.ts) |
| Field value binding | Implemented | [`field-value-binding.ts`](./src/renderers/fields/field-value-binding.ts) |
| Layout/composition pipeline | Implemented | [`ui-layout-adapter.tsx`](./src/adapters/ui-layout-adapter.tsx), [`ui-composition-adapter.tsx`](./src/adapters/ui-composition-adapter.tsx) |
| Client/server entry points | Implemented | [`package.json`](./package.json), [`check-client-server-boundaries.mts`](./scripts/check-client-server-boundaries.mts) |
| Verification gates | **Implemented** | `check:verification-governance`, `check:compatibility`, `check:renderer-registry`, `check:public-api`, `check:declaration-snapshot`, `check:generated`, `validate-manifest` |

### Planning Mark

- `Implemented: MUI-001, MUI-002, MUI-003, MUI-004, MUI-005, MUI-008, MUI-009, MUI-010, MUI-011, MUI-012, MUI-013, MUI-014, MUI-018`
- `Partial: MUI-006, MUI-007, MUI-017`
- `Not started: MUI-015, MUI-016`
- `Visualization: MUI-VIS-001 through MUI-VIS-012 implemented`
- `P0 next slices: MUI-015, MUI-016`
- `Feature status: production-capable for read-only/list/form surfaces; remaining gaps are layout contracts and bundle graph enforcement`

---

## Element-by-Element Code Evaluation

| Element | Status | Code Evidence | Next Action |
| --- | --- | --- | --- |
| Adapter Pipeline | Implemented | [`src/adapters`](./src/adapters) | Contract validation at adapter entry (MUI-014) |
| Registry + Manifest | Implemented | [`src/registry`](./src/registry), [`metadata-ui.manifest.ts`](./metadata-ui.manifest.ts) | Add `check:renderer-registry`; include states in manifest |
| Fallback Runtime | Implemented | [`invalid-contract-fallback.tsx`](./src/adapters/invalid-contract-fallback.tsx), [`fallback-runtime.test.tsx`](./tests/fallback-runtime.test.tsx) | Keep `check:fallback-runtime` aligned with adapter fallback paths |
| Field Renderers | Implemented | [`src/renderers/fields/`](./src/renderers/fields/) | Controlled binding via `field-value-binding.ts` (MUI-013) |
| Table Cell Rendering | Implemented | [`ui-table-cell-adapter.tsx`](./src/adapters/ui-table-cell-adapter.tsx) | Field registry pipeline via `renderMetadataTableCellResult` (MUI-018 / AC #12) |
| Layout/Composition | Not started | [`layout.contract.ts`](./src/contracts/layout.contract.ts) | Implement or remove from public API (MUI-015) |
| Customization | Partial | [`metadata-table.tsx`](./src/components/metadata-table.tsx) | Universal resolution hook (MUI-017) |
| Verification Tooling | Implemented | [`scripts/`](./scripts) | P0 gates for MUI-008/012/013/014 wired into `pnpm verify` |

---

## Consumer Integration Pattern

Recommended usage for feature teams:

```tsx
import { createMetadataRenderContext } from "@repo/metadata-ui/contracts";
import { MetadataForm, MetadataSectionStack } from "@repo/metadata-ui/components";

const context = createMetadataRenderContext({
  actorId: session.userId,
  tenantId: session.tenantId,
  permissions: resolvedHints.permissions,   // hints only — server enforces finality
  correlationId: requestId,
  mode: "update",
  state: "ready",
  diagnosticsEnabled: process.env.NODE_ENV === "development",
  telemetry: appTelemetrySink,
});

<MetadataForm
  metadata={entityMetadata.form}
  context={context}
  values={formValues}
  onAction={handleAction}                   // consumer-owned execution
/>
```

Rules:
- Always pass an explicit `MetadataRenderContext`.
- Never treat `permissions` or `capabilities` as authorization finality.
- Own form state and mutation execution in the feature layer.
- Apply customization before passing metadata to non-table surfaces once MUI-017 lands.

---

## Audience

Engineers working on metadata rendering, renderer registries, adapter pipelines, metadata UI compatibility, and feature integration.

---

## Decision Enabled

Use this document to decide whether a concern belongs in `@repo/metadata-ui`, `@repo/metadata`, `@repo/ui`, or `@repo/customization`.

Quick routing:

| Concern | Package |
| --- | --- |
| Entity/field/section metadata schema | `@repo/metadata` |
| Customization overlay rules | `@repo/customization` |
| Button, input, table primitives | `@repo/ui` |
| How metadata becomes React UI | `@repo/metadata-ui` |
| Form state, server actions, data fetching | Feature / app layer |

---

## Source Of Truth References

- [`../../skills/reference/architecture.md`](../../skills/reference/architecture.md)
- [`../../skills/reference/packages.md`](../../skills/reference/packages.md)
- [`README.md`](./README.md) — renderer catalog and ownership rules
