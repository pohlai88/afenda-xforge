# Metadata-UI Change Notes

Use this file for package-local public API notes when the repo does not require a broader release-note system.

## 2026-06-09

- Date: 2026-06-09
- Change: Added verification-facing consumer fixture contract exports and tightened telemetry manifest governance fields for metadata-ui CI enforcement.
- Public impact: Downstream consumers keep the same runtime API; repo verification now expects fixture matrix coverage and the exported consumer scenario types are available for typed test helpers.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Keep future public fixture or telemetry schema changes paired with snapshot and change-note updates in the same PR.

## 2026-06-10

- Date: 2026-06-10
- Change: Added a manifest-driven metadata-ui generator for renderer registries, renderer exports, compatibility mappings, fixture coverage, and the README renderer catalog while keeping the existing public registry names stable.
- Public impact: Downstream consumers keep the same package entrypoints and runtime behavior, but renderer exports and registry inventory are now generated from `metadata-ui.manifest.ts` and the public fixture surface now exposes generated coverage helpers.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Keep future renderer inventory changes paired with manifest updates, regenerated outputs, and snapshot/change-note refreshes in the same change set.

## 2026-06-10 (MUI-VIS-001)

- Date: 2026-06-10
- Change: Implemented MUI-VIS-001 compose-group compliance end to end: state renderers added to manifest, generated state registry and compatibility map, compose-group validation at manifest generation time, orphan renderer detection, and `check:compose-groups` / `check:renderer-registry` verification gates.
- Public impact: New public state renderer exports (`*StateRenderer`), `defaultStateRegistry`, and `MetadataStateKind` contract types. State resolution remains backward compatible; all 38 manifest renderers now declare metadata-ready `@repo/ui` compose groups.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:compose-groups` when adding renderers or changing compose groups.

## 2026-06-10 (MUI-VIS-002)

- Date: 2026-06-10
- Change: Implemented MUI-VIS-002 field visual states end to end: shared `resolveFieldVisualState` + `MetadataFieldShell` (token-backed `@repo/ui` Field primitives), refactored all eight field renderers for default/disabled/readonly/error/focus-visible states, fixed governance readonly fallback routing in `renderMetadataField`, and added `check:field-visual-tokens` lint plus `field-visual-states` tests.
- Public impact: Field renderers now expose consistent visual state semantics (readonly vs disabled separation for text inputs; locked controls for toggles/select). Governance `fallback: "readonly"` preserves `readOnly` on controls instead of disabling them. New verification gate `check:field-visual-tokens` runs in `pnpm verify`.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json` (if public exports changed).
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:field-visual-tokens` when adding or modifying field renderers.

## 2026-06-10 (MUI-VIS-003)

- Date: 2026-06-10
- Change: Implemented MUI-VIS-003 state visual matrix end to end: `STATE_VISUAL_MATRIX`, `MetadataStateShell`, distinct iconography and actionable copy for all ten UI states, refactored invalid/degraded/partial/readonly/maintenance away from error/forbidden/ready delegation, and added `check:visual-states` plus matrix tests.
- Public impact: State renderers now expose distinct tones (info/muted/warning/danger), SVG iconography, skeleton/banner/panel patterns, and optional CTAs per the architecture matrix. New exports: `MetadataStateShell`, `STATE_VISUAL_MATRIX`, `InvalidState`, `DegradedState`, `PartialState`, `ReadonlyState`, `MaintenanceState`. Contract adds optional `onAction` and `actionLabel`.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:visual-states` when adding or modifying state renderers.

## 2026-06-10 (MUI-VIS-004)

- Date: 2026-06-10
- Change: Implemented MUI-VIS-004 action visual contract end to end: `ACTION_VISUAL_MATRIX` for button/destructive/menu surfaces, accessible `@repo/ui` AlertDialog confirmation (replacing `window.confirm`), `data-action-surface` markers, and `check:action-visual-states` lint plus action visual tests.
- Public impact: Destructive actions always require explicit AlertDialog confirmation before `onAction`. Button, destructive, and menu renderers expose distinct token-backed variants. New exports: `ACTION_VISUAL_MATRIX`, `requiresActionConfirmation`, `resolveActionConfirmationCopy`.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:action-visual-states` when modifying action renderers.

## 2026-06-10 (MUI-VIS-005)

- Date: 2026-06-10
- Change: Implemented MUI-VIS-005 field accessibility contract end to end: centralized `controlId`/`helpId`/`errorId`/`describedBy` wiring in `resolveFieldVisualState` + `MetadataFieldShell` (`htmlFor`, `FieldDescription` id, `FieldError` with `role="alert"`), fixed status badge and toggle duplicate-label gaps, and added `check:field-a11y` lint plus `field-a11y-states` tests.
- Public impact: All eight field renderers now associate labels, controls, help text, and inline errors for assistive technologies. Checkbox and switch rely on `FieldLabel htmlFor` instead of duplicate `aria-label`. Status fields link badge surfaces to shell labels and error/help ids.
- Snapshot updated: No public API export changes.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:field-a11y` when adding or modifying field renderers.

## 2026-06-10 (MUI-VIS-006)

- Date: 2026-06-10
- Change: Implemented MUI-VIS-006 keyboard/focus contract end to end: shared `keyboard-focus-contract` focus-visible tokens, keyboard-activatable table rows and `@repo/ui` Button sort controls in `ActivityTable`, token-backed mailto link focus in cell renderers, disabled link focus handling in `StatePanel`, and `check:keyboard-focus` lint plus keyboard/focus tests.
- Public impact: Interactive metadata-ui surfaces remain keyboard-operable with visible focus indicators. Table sorting and row activation support Enter/Space; disabled link actions use `tabIndex={-1}` instead of `pointer-events-none`.
- Snapshot updated: No public API export changes.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:keyboard-focus` when adding interactive components or custom controls.

## 2026-06-10 (MUI-VIS-007)

- Date: 2026-06-10
- Change: Implemented MUI-VIS-007 locale-aware value formatting end to end: `metadata-value-formatter` (`Intl.NumberFormat` / `Intl.DateTimeFormat` with render context `locale` and `timezone`), number/money/date field read-mode display formatting, table cell + ActivityTable fallback formatting, and `check:locale-formatting` with locale propagation tests.
- Public impact: Numeric, money, and date surfaces format display values from render context locale/timezone. Edit-mode inputs keep parseable raw values; read/readonly/disabled modes show Intl-formatted display strings. Table money/date/number columns no longer emit missing-renderer diagnostics.
- Snapshot updated: No public API export changes.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:locale-formatting` when changing numeric/date/currency formatters or locale-aware renderers. Label i18n remains MUI-016.

## 2026-06-10 (MUI-VIS-008)

- Date: 2026-06-10
- Change: Implemented MUI-VIS-008 density visual contract end to end: `density-visual-contract` matrix + surface helpers, `context.density` wired through field shells/controls, toolbar/section/form/stack spacing, ActivityTable row/control density, and `check:density-visual` with density variant tests.
- Public impact: Render context `density` (`compact` | `comfortable` | `default`) now affects spacing and control sizing across field, section, toolbar, form, and table surfaces via `@repo/ui` density tokens (`data-density`, `control-density`, `row-density`).
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:density-visual` when adding surfaces or modifying density-sensitive layout.

## 2026-06-10 (MUI-VIS-009)

- Date: 2026-06-10
- Change: Implemented MUI-VIS-009 content-length visual contract end to end: shared empty display placeholder (`—`), truncation/clamp classes for table cells, headers, field labels/help, toolbar/form titles, long-content fixtures, and `check:content-length` with content-length tests.
- Public impact: Long labels, values, and table cell content truncate or wrap safely; null/undefined/blank values render a consistent empty placeholder instead of breaking layout.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:content-length` when adding surfaces or display formatters.

## 2026-06-10 (MUI-VIS-010)

- Date: 2026-06-10
- Change: Implemented MUI-VIS-010 reduced-motion visual contract end to end: `motion-visual-contract` token classes, `MetadataMotionSkeleton` wrapper, loader/spinner and destructive dialog motion wiring, and `check:reduced-motion` with motion safety tests.
- Public impact: Metadata-ui animations honor `prefers-reduced-motion` via explicit `motion-reduce:*` classes; package-local lint forbids unsafe transition properties (`transition-all`, `transition-colors`, etc.).
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:reduced-motion` when adding animated surfaces or custom transitions.

## 2026-06-10 (MUI-VIS-011)

- Date: 2026-06-10
- Change: Implemented MUI-VIS-011 surface visual hierarchy end to end: `surface-visual-contract` matrix for all five surface kinds, `MetadataSurfaceRegion` + `MetadataSurface` renderer shell, hierarchy wiring in toolbar/form/panel/table/section stack/section renderer, and `check:surface-visual` with surface hierarchy tests.
- Public impact: Metadata surfaces declare `data-surface-kind` and `data-surface-region` markers enforcing title → description → primary content → secondary actions. New exports: `MetadataSurface`, `MetadataSurfaceRegion`, optional `surfaceKind` on `MetadataToolbar`.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:surface-visual` when adding surfaces or changing layout hierarchy. Full layout/composition renderer pipelines remain MUI-015.

## 2026-06-10 (MUI-VIS-012)

- Date: 2026-06-10
- Change: Implemented MUI-VIS-012 diagnostics visibility end to end: `diagnostics-visual-contract`, `MetadataDiagnosticsPanel`, `composeMetadataWithDiagnostics`, fallback correlation footers on `ErrorState`, orchestrator wiring in form/table/panel/state adapter, and `check:diagnostics-visual` with diagnostics visibility tests.
- Public impact: When `diagnosticsEnabled` is true, metadata surfaces render a visually distinct diagnostics panel with correlation ID and UI-visible warning/error entries; fallback error surfaces expose dashed diagnostic styling and correlation footers.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:diagnostics-visual` when changing fallback or diagnostics surfacing behavior.

## 2026-06-10 (Diagnostic code coverage)

- Date: 2026-06-10
- Change: Closed diagnostic code coverage gaps for `invalid-contract`, `deprecated-renderer`, `duplicate-renderer`, and `unsupported-state` with adapter/resolver emission, `contract-validation.ts`, `check:diagnostic-coverage`, and diagnostic code coverage tests.
- Public impact: New adapter exports for contract validation helpers and diagnostic factories. Invalid field/action/section contracts, deprecated renderer registrations, duplicate manifest keys, and unsupported runtime states now emit typed diagnostics instead of failing silently.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:diagnostic-coverage` when adding diagnostic codes or changing adapter entry validation.

## 2026-06-10 (MUI-001 / AC #1)

- Date: 2026-06-10
- Change: Closed Enterprise Acceptance Criteria #1 gaps with `./server` and `./client` subpaths, `check:package-subpaths`, subpath import tests, and consumer fixture imports through explicit export map paths.
- Public impact: Consumers should import via `@repo/metadata-ui/adapters`, `/components`, `/contracts`, `/server`, `/client`, etc. Root barrel remains for backward compatibility.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:package-subpaths` when adding or renaming public subpaths.

## 2026-06-10 (MUI-002 / AC #2)

- Date: 2026-06-10
- Change: Implemented MUI-002 adapter/registry pipeline end to end for all metadata surfaces: new `renderMetadataTableCellResult` routes table cells through `renderMetadataField` with `surfaceRole: "table-cell"`, field renderers gained compact table-cell display mode, `ActivityTable` async states route through `renderMetadataStateBoundaryResult`, and `check:adapter-pipeline` plus `adapter-pipeline-surfaces.test.tsx` enforce the contract.
- Public impact: New adapter exports `renderMetadataTableCell` / `renderMetadataTableCellResult` on `@repo/metadata-ui/adapters`. `MetadataRenderContext` adds optional `surfaceRole`. Component re-exports in `metadata-cell-renderers.tsx` remain for visual tests but delegate to adapters.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Run `pnpm --filter @repo/metadata-ui check:adapter-pipeline` when changing surface orchestrators or table cell rendering.

## 2026-06-10 (MUI-008 / MUI-012 / MUI-013 / MUI-014)

- Date: 2026-06-10
- Change: Closed remaining P0 runtime gaps: `check:client-server-boundaries` for `./server`/`./client` split, consumer fixture integrated into default `pnpm test`, controlled field binding via `field-value-binding.ts` + `onFieldChange`, and deep adapter-entry contract validation with `check:contract-validation` / `check:field-value-binding`.
- Public impact: `MetadataFieldRendererProps` adds optional `onChange`; `MetadataForm` adds optional `onFieldChange`; contracts export `metadataFieldKinds` and `metadataSectionKinds`; new verification gates wired into `pnpm verify`.
- Snapshot updated: Yes, `snapshots/declaration-snapshot.json`.
- Follow-up: Run the new MUI-008/012/013/014 gates when changing entry points, form binding, or contract validation rules.

## Entry template

- Date:
- Change:
- Public impact:
- Snapshot updated:
- Follow-up:
