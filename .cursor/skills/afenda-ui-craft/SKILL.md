---
name: afenda-ui-craft
description: >-
  Afenda-scoped UI craft — composition, polish, and anti-slop for XForge surfaces.
  Wraps ui-craft with Afenda authority, layer order, and token governance. Use when
  building or refining app UI, Storybook, Theme Studio previews, or metadata-ui
  surfaces. Prefer ui-craft-dense-dashboard for workspace and dashboard work.
---

# Afenda UI Craft

Merged guidance from **ui-craft** (`.agents/skills/ui-craft/`), scoped to `afenda-Xforge`.

## When to apply

- Building or polishing UI in `apps/app`, `apps/storybook`, Theme Studio previews
- Entity surfaces in `@repo/metadata-ui`
- Dashboard, workspace, admin, or data-dense internal tools
- Pre-ship UI review (`/heuristic`, `/finalize`) on app-layer changes

## Read order (authority)

1. **Afenda contracts** — `packages/design-system/src/contracts/afenda/` (`design-system.contract.ts`, `token-ui.contract.ts`, registries)
2. **CSS + tokens** — `.cursor/skills/afenda-css-tailwind-stylelint/SKILL.md` and `packages/ui/src/styles/globals.css`
3. **Layer rules** — `.cursor/rules/agent-discipline.mdc` (app → metadata-ui → workspace compose)
4. **ui-craft** — `.agents/skills/ui-craft/SKILL.md` for composition, motion, polish, heuristics

ui-craft **must not** override Afenda preset names, contract authority, or lane/status token semantics.

## Layer boundaries

| Layer | Path | ui-craft OK? |
|-------|------|--------------|
| App wiring / previews | `apps/app/`, Theme Studio, Storybook | Yes — primary target |
| Entity surfaces | `@repo/metadata-ui` | Yes |
| Workspace compose | `packages/ui/.../compose/workspace/` | **No** — human-owned; ask first |
| Design-system authority | `packages/design-system/` contracts, registries | Read-only; propose contract changes separately |

Fix visual issues at the **lowest allowed layer** before touching shared compose.

## Variant selection

| Surface | Skill |
|---------|-------|
| Dashboard, workspace, ERP admin, analytics | `.agents/skills/ui-craft-dense-dashboard/SKILL.md` |
| Marketing / editorial landing | `.agents/skills/ui-craft-editorial/SKILL.md` |
| Minimal auth or settings | `.agents/skills/ui-craft-minimal/SKILL.md` |
| General UI | `.agents/skills/ui-craft/SKILL.md` |

Default knobs for XForge internal tools: **CRAFT=7, MOTION=3–5, DENSITY=8–9** (dense-dashboard variant locks these).

## Token and theme rules

- **Use existing OKLCH spine** — do not invent new preset names or ad-hoc hex/rgb/hsl literals
- **Canonical presets only:** `afenda`, `vercel-geist` (see `registries/theme-preset.registry.ts`)
- **Legacy names are violations:** `xforge`, `vercel`, `teal`, `indigo`, etc. — migrate, do not alias
- **Lane tokens** (`--lane-*`, `text-lane-active`) are module identity — not primary CTAs or status
- ui-craft `/tokens` and `themes.md` are **audit inputs** — output must align with Afenda contracts, not replace them

## Command routing

| Intent | Command / skill |
|--------|-----------------|
| New dashboard / workspace screen | `/shape` then `/craft dashboard` + dense-dashboard variant |
| Polish existing page | ui-craft polish pass + `afenda-css-tailwind-stylelint` gates |
| Token audit (read-only) | `/tokens` — compare against Afenda catalog, no new presets |
| Pre-merge UI gate | `/finalize` + `pnpm lint:stylelint` + `pnpm --filter app typecheck` |
| Scored critique (no code) | `/heuristic` |
| Accessibility | `/audit` + `.cursor/rules/web-interface-accessibility.mdc` |

## Verification gates

After UI changes touching `apps/app`:

```bash
pnpm --filter app typecheck
pnpm lint:stylelint
pnpm run lint:tailwind-v4
```

Optional anti-slop scan (non-blocking):

```bash
npx ui-craft-detect apps/app/app --json
```

## Source skills

| Skill | Path | Focus |
|-------|------|-------|
| ui-craft | `.agents/skills/ui-craft/` | Anti-slop, discovery, polish, recipes |
| ui-craft-dense-dashboard | `.agents/skills/ui-craft-dense-dashboard/` | ERP / admin / data-dense defaults |
| afenda-css-tailwind-stylelint | `.cursor/skills/afenda-css-tailwind-stylelint/` | OKLCH tokens, Tailwind v4, Stylelint |
| xforge-nextjs-vercel | `.cursor/skills/xforge-nextjs-vercel/` | Next.js 16+ app patterns |
