---
name: afenda-css-tailwind-stylelint
description: >-
  Afenda CSS pipeline — Tailwind v4, OKLCH tokens, utility-first styling, and
  Stylelint enforcement. Merges tailwindcss-v4, tailwind-validator, and
  css-architecture for this monorepo. Use when editing CSS, globals.css,
  preview.css, @theme/@utility/@source, design tokens, or fixing lint:stylelint.
---

# Afenda CSS + Tailwind v4 + Stylelint

Merged guidance from **tailwindcss-v4**, **tailwind-validator**, and **css-architecture**, scoped to `afenda-Xforge`.

## When to apply

- Editing `packages/ui/src/styles/**/*.css` or `apps/storybook/.storybook/preview.css`
- Adding design tokens, `@utility`, `@theme inline`, or `@source` scopes
- Choosing utilities vs custom CSS in components
- Fixing `pnpm lint:stylelint` or Storybook `check:stylelint`
- Auditing for Tailwind v3 regressions (`@tailwind`, `tailwind.config.js`, `hsl(var(--*))`)

## Architecture (four steps)

1. **`:root` / `.dark`** at stylesheet root — semantic tokens in `oklch()`, `var()`, `calc()`, or `color-mix()` (never hex/rgb/hsl literals on token sources).
2. **`@theme inline`** maps tokens to Tailwind utilities via `var(--token)` only (no raw color literals in `--color-*` / `--shadow-*`).
3. **`@layer base`** applies semantic utilities — never nest `:root` or `.dark` inside `@layer base`.
4. **Storybook `preview.css`** extends globals — never duplicates `@import "tailwindcss"`.

Canonical entry: `packages/ui/src/styles/globals.css`

### ERP visual lane tokens (tenant branding)

Lane accents are **module identity** — separate from `--primary` (tenant preset) and status tones:

| Token family | Examples | Use |
|--------------|----------|-----|
| Per-lane sources | `--lane-money`, `--lane-people`, … | Catalog defaults in `:root` / `.dark` |
| Active lane (runtime) | `--lane-active`, `--lane-active-muted`, `--lane-active-border` | Set by `FeatureLaneScope` or Storybook `activeFeatureId` |
| Tailwind utilities | `text-lane-active`, `bg-lane-active-muted`, `border-lane-active-border` | Nav, badges (`variant="lane"`), chart accents |

Stylelint `REQUIRED_THEME_INLINE_MAPPINGS` includes `--color-lane-active-*` → `var(--lane-active-*)`. Do not use lane tokens for primary CTAs or operational status.

```css
@import "tailwindcss";

@source "../components/**/*.{ts,tsx}";
@custom-variant dark (&:where(.dark, .dark *));

:root { --background: oklch(...); /* token sources */ }
.dark { --background: oklch(...); }

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

## Tailwind v4 rules (reject v3)

| v3 (ban) | v4 (use) |
|----------|----------|
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `tailwind.config.js` theme.extend | `@theme` / `@theme inline` in CSS |
| `@layer utilities { .foo {} }` for new utilities | `@utility foo { ... }` |
| `bg-opacity-50`, `flex-grow-*` | `bg-black/50`, `grow-*` |
| `shadow-sm` (old scale) | check v4 renamed scale (`shadow-xs`, etc.) |
| `hsl(var(--primary))` | `var(--primary)` or `bg-primary` utility |
| `rgb()`, `hsl()`, hex in declarations | `oklch()` + semantic tokens |
| `@screen` / `@variants` / `@responsive` | `@custom-variant`, `@variant` |

**Directives:**

- `@utility name { declarations }` — registered utilities (required body; no empty blocks)
- `@source "path"` — tighten class scanning (Storybook: `../stories/**/*.{ts,tsx}`)
- `@plugin "..."` — v4 plugin import (not `require()` in JS config)

## Utility-first (css-architecture)

Prefer composing Tailwind utilities in TSX over bespoke CSS.

**Do:**

- Parent `gap-*` instead of child margins (`mb-4` chains)
- Semantic utilities (`bg-background`, `text-muted-foreground`) from tokens
- `cn()` / `tailwind-merge` for `className` composition
- Register repeated patterns as `@utility` when used across stories/features

**Avoid:**

- BEM/SMACSS class systems in this repo (utility-first + tokens)
- Arbitrary values in TSX when an `@utility` or token exists
- Duplicating token definitions in app-level CSS

## Stylelint pipeline

```bash
pnpm lint:stylelint          # from repo root
pnpm lint:stylelint:fix      # auto-fix where supported
```

Config: `stylelint.config.mjs` — extends `stylelint-config-standard`, `@dreamsicle.io/stylelint-config-tailwindcss`, custom `afenda/*` plugins in `tools/stylelint/afenda-css-plugin.mjs`.

### Custom `afenda/*` rules

| Rule | Enforces |
|------|----------|
| `afenda/no-root-in-layer-base` | `:root` / `.dark` not inside `@layer base` |
| `afenda/no-dark-nested-theme` | No `@theme` inside `.dark` |
| `afenda/no-hsl-var-wrap` | No `hsl(var(--*))` double-wrap |
| `afenda/theme-inline-uses-var` | `@theme inline` color/shadow maps use `var(--token)` |
| `afenda/token-sources-use-oklch-or-var` | Token sources use oklch/var/calc/color-mix |
| `afenda/preview-css-pipeline` | Storybook preview.css imports globals only + `@source` + intro utility |
| `afenda/utility-uses-declarations` | `@utility` blocks must contain declarations |

### Other enforced rules

- `function-disallowed-list`: `rgb`, `hsl`, `hsla` in declarations
- `color-no-hex`: true
- `at-rule-disallowed-list`: `screen`, `variants`, `responsive`

## Storybook `preview.css` checklist

Must:

- `@import` `@repo/ui/styles/globals.css` (single pipeline)
- `@source ../stories/**/*.{ts,tsx}`
- `@utility sb-intro-grid-bg` for intro backgrounds

Must **not**:

- `@import "tailwindcss"` (inherits from globals)

## Pre-flight validation

Before large CSS changes, run:

```bash
pnpm lint:stylelint
python .agents/skills/tailwind-validator/scripts/validate.py --root . --suggest-fixes
```

Flag any `tailwind.config.*`, `@tailwind` directives, or v3 PostCSS plugins.

## Fix workflow

1. Read the Stylelint error — map to table above.
2. Fix at token source (`:root` / `.dark`) if color-related.
3. Map through `@theme inline` if utility missing.
4. Use `@utility` for reusable non-token patterns.
5. Re-run `pnpm lint:stylelint`.

## Source skills (installed separately)

| Skill | Path | Focus |
|-------|------|-------|
| tailwindcss-v4 | `.agents/skills/tailwindcss-v4` | v4 directives, `@theme` namespaces, migration |
| tailwind-validator | `.agents/skills/tailwind-validator` | v3 detection, validate.py |
| css-architecture | `.agents/skills/css-architecture` | utility-first, CSS variables references |
| tailwind-utility-classes | `.agents/skills/tailwind-utility-classes` | class composition catalog |
| frontend-tailwind-best-practices | `.agents/skills/frontend-tailwind-best-practices` | layout stacks, gaps, responsive patterns |
