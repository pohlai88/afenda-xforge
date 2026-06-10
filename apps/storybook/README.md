# Storybook

Visual workspace for `@repo/ui` and `@repo/metadata-ui` public surfaces.

## Scope

- `Introduction`: orientation and system-level guidance
- `Metadata UI / Overview`: MDX map from manifest keys to Storybook paths
- `UI / Compose`: compose pattern galleries split by Form, Data, Navigation, Feedback
- `UI / Compose Registry`: metadata-facing compose group reference table
- `UI / Primitives`: shadcn primitive families (actions, form, overlay, navigation, feedback, data)
- `Metadata UI`: renderer matrices, field visual states, and integration smoke fixtures

## Commands

Hosted review: [https://pohlai88.github.io/afenda-xforge/](https://pohlai88.github.io/afenda-xforge/) (GitHub Pages, `main` deploy via `.github/workflows/storybook-pages.yml`).

```bash
pnpm --filter storybook dev
pnpm --filter storybook build
pnpm --filter storybook build:pages   # set STORYBOOK_BASE_PATH=/afenda-xforge/ for local Pages preview
pnpm --filter storybook preview:static
pnpm --filter storybook typecheck
pnpm --filter storybook check
pnpm --filter storybook check:build
pnpm --filter storybook check:theme-css
pnpm --filter storybook check:stylelint
pnpm --filter storybook check:intro-layout
pnpm --filter storybook check:storybook-visual-tokens
pnpm --filter storybook check:metadata-ui-browser-smoke
pnpm --filter storybook test:stories
pnpm --filter storybook test:visual:intro
pnpm --filter storybook test:visual
pnpm --filter storybook test:visual:update
pnpm --filter storybook test:visual:intro:update
pnpm --filter storybook generate:compose-stories
pnpm --filter storybook scorecard
pnpm run lint:stylelint
```

## Automation

| Script | Purpose |
| --- | --- |
| `check:theme-css` | Cross-file theme integration gate (preview.tsx import boundary + Badge surface contrast) |
| `check:stylelint` | Tailwind v4 + shadcn CSS architecture lint (`@dreamsicle.io/stylelint-config-tailwindcss` + afenda token rules on `globals.css` + `preview.css`) |
| `check:intro-layout` | Orbit stage structure, overflow, and CSS utility gate (MUI-VIS-013) |
| `check:storybook-visual-tokens` | Story className hygiene — semantic tokens, no `bg-size-[`, lucide imports (MUI-VIS-015) |
| `check:build` | Static production build (CI gate for compile/bundle health) |
| `scorecard` | Informational story/play/chunk metrics and guard gate status after build |
| `check:metadata-ui-browser-smoke` | Playwright smoke against the metadata-ui integration fixture |
| `test:stories` | Starts Storybook CI dev server and runs test-runner with axe checks |
| `test:visual:intro` | PR-blocking Playwright screenshots for intro stories only |
| `test:visual` | Full Playwright screenshot golden set (`tests/visual/__screenshots__`) |
| `pretest:stories` | Ensures metadata-ui generated artifacts are current and Chromium is installed |

Run story tests locally (dev server not required):

```bash
pnpm --filter storybook test:stories
```

### Test-runner note

`@storybook/test-runner` remains the interaction + a11y gate. Evaluate `@storybook/addon-vitest` when test-runner maintenance cost exceeds ~40% runtime savings; defer full migration until story count stabilizes after compose chunk split.

## Accessibility gates

| Tier | Stories | CI behavior |
| --- | --- | --- |
| `a11y.test: 'error'` | Introduction, Metadata UI (all), UI Primitives (all), Compose Registry, all 40 compose galleries | `test:stories` fails on axe violations |
| `a11y.test: 'todo'` | None (compose batches 1–3 complete) | — |

All compose registry galleries gate at `error` in `test:stories` (lazy-loaded galleries wait before axe). Bootstrap visual baselines with `test:visual:update` before the first `test:visual` run. Local audit against a running dev server:

```bash
pnpm exec storybook dev --ci -p 6010
$env:A11Y_AUDIT_PREFIX="UI/Compose"; tsx scripts/audit-story-a11y.mts
```

## Configuration highlights

- Tailwind v4 token pipeline: `.storybook/preview.css` imports `@repo/ui/styles/globals.css` (single CSS entry; `preview.tsx` imports only `preview.css`)
- `check:stylelint` CI gate validates the four-step shadcn/Tailwind v4 token architecture via Stylelint (`@dreamsicle.io/stylelint-config-tailwindcss` + [`tools/stylelint/afenda-css-plugin.mjs`](../../tools/stylelint/afenda-css-plugin.mjs))
- `@storybook/addon-a11y` for axe-powered accessibility review in the UI
- `@storybook/addon-docs` for MDX overview pages and autodocs
- Scoped `react-docgen-typescript` on story wrapper components in `apps/storybook/stories`
- `@repo/metadata-ui/fixtures` for manifest-aligned visual review data
- Vite `optimizeDeps` and monorepo `server.fs.allow` tuning for faster dev startup
- Storybook `@source` extends globals.css scan with `stories/**` and `metadata-ui/src/**`

## Score targets

| Metric | Target |
| --- | --- |
| Largest compose category chunk | &lt; 500 KB (no monolithic compose gallery chunk) |
| `play` functions | 6+ high-value interaction smokes |
| CI `test:stories` | `storybook.yml` + root `ci:metadata-ui` |
| Compose `a11y: error` (batch 1) | 8 manifest-priority galleries |
