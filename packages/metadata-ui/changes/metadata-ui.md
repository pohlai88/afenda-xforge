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

## Entry template

- Date:
- Change:
- Public impact:
- Snapshot updated:
- Follow-up:
