# Afenda Contract Agent Guide

This directory is the canonical Afenda design-system governance branch.

When instructions conflict with older root contracts or legacy migration
surfaces, update the work to follow Afenda authority. Do not bend Afenda to fit
legacy naming or compatibility layers.

## Authority Order

Use this order when deciding where new code belongs:

```txt
1. design-system.contract.ts
2. runtime-reference.contract.ts
3. rules/*.rules.ts
4. runtime/*.contract.ts
5. gates/*.contract.ts
6. forms/*.contract.ts
7. registries/*.registry.ts
8. adapters/*.adapter.ts
9. legacy/deprecated.ts
```

## Naming Convention

File names must communicate authority level.

| Suffix | Meaning | Use for |
| --- | --- | --- |
| `.contract.ts` | Primary authority, protocol, or enforcement boundary | Design-system authority, runtime evaluation, violation, remediation, agent governance, quality gates, adapter protocol, form framework obligations |
| `.rules.ts` | Governance policy | Requirements, forbidden patterns, severity, rationale, remediation, references, enforcement mode |
| `.registry.ts` | Selectable values or implementation data | Theme presets, token sets, variant names, status vocabularies |
| `.catalog.ts` | Mapping table | Module-to-lane maps, feature-to-family maps, route grouping |
| `.schema.ts` | Validation mirror | Zod validation for a contract or registry |
| `.manifest.ts` | Public metadata | Export subpath, canonical status, replacement/deprecation metadata |
| `.adapter.ts` | Migration boundary | Legacy or external input to canonical Afenda output |
| `.md` | Human governance documentation | Audits, evaluations, roadmaps, migration decisions |

## Hard Rules

| Rule | Requirement |
| --- | --- |
| Contract means authority | Do not name selectable data `*.contract.ts`. Use `*.registry.ts`. |
| Rules do not own data | Do not move registry values into `*.rules.ts`. Rules govern; registries store selectable values. |
| No aliases by default | Do not add compatibility aliases for old names unless explicitly approved as a temporary migration exception. Prefer violation-driven migration. |
| No half-old/half-new state | Old root contract values must migrate to canonical Afenda values or be treated as violations. |
| No legacy runtime authority | Adapters and legacy files are migration inputs only. They must not override Afenda contracts, rules, runtime, or gates. |
| Public exports are explicit | Add directory `index.ts` files and package exports only when tests prove they resolve. |
| Tests freeze authority | Any new public Afenda surface needs public export coverage and contract/gate tests. |

## Theme Preset Governance

Theme presets are secondary selectable data. They must not be named as a primary
contract.

Correct target:

```txt
registries/theme-preset.registry.ts
```

Do not create:

```txt
theme-preset.contract.ts
```

Canonical Afenda theme preset names:

```txt
afenda
vercel-geist
```

Legacy/root names are violations:

```txt
xforge
vercel
teal
indigo
emerald
amber
rose
```

Required migration direction:

```txt
xforge -> afenda
vercel -> vercel-geist
```

Unsupported optional presets must be removed or later promoted through Afenda
governance. Do not preserve them through aliases.

## Current Directory Intent

Recommended structure:

```txt
afenda/
  design-system.contract.ts
  design-system.schema.ts
  design-system.manifest.ts
  runtime-reference.contract.ts

  registries/
    index.ts
    theme-preset.registry.ts

  rules/
    index.ts
    *.rules.ts

  runtime/
    index.ts
    *.contract.ts

  gates/
    index.ts
    quality-gate.contract.ts

  forms/
    index.ts
    *.contract.ts

  adapters/
    index.ts
    adapter.contract.ts
    *.adapter.ts

  legacy/
    index.ts
    deprecated.ts
```

## Migration Discipline

Before migrating a root contract:

1. Write or update the focused evaluation markdown.
2. Decide whether the source is authority, registry data, catalog data, adapter input, or violation.
3. Add the canonical Afenda target.
4. Update consumers in focused batches.
5. Run `pnpm typecheck` and `pnpm test`.
6. Delete or deprecate the old source only after consumers pass.

Do not perform broad cleanup across `packages/design-system` while evaluating a
single Afenda migration surface.
