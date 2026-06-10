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

```bash
pnpm --filter storybook dev
pnpm --filter storybook build
pnpm --filter storybook preview:static
pnpm --filter storybook typecheck
pnpm --filter storybook check
pnpm --filter storybook check:build
pnpm --filter storybook check:metadata-ui-browser-smoke
pnpm --filter storybook test:stories
pnpm --filter storybook test:visual
pnpm --filter storybook test:visual:update
pnpm --filter storybook generate:compose-stories
pnpm --filter storybook scorecard
```

## Automation

| Script | Purpose |
| --- | --- |
| `check:build` | Static production build (CI gate for compile/bundle health) |
| `scorecard` | Informational story/play/chunk metrics after build |
| `check:metadata-ui-browser-smoke` | Playwright smoke against the metadata-ui integration fixture |
| `test:stories` | Starts Storybook CI dev server and runs test-runner with axe checks |
| `test:visual` | Playwright screenshot golden set (`tests/visual/__screenshots__`) |
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
| `a11y.test: 'error'` | Introduction, Metadata UI (all), UI Primitives (all), Compose Registry, manifest-priority compose galleries (batch 1) | `test:stories` fails on axe violations |
| `a11y.test: 'todo'` | Remaining compose galleries | Logged in Storybook UI; not enforced in CI yet |

Manifest-priority compose batch 1 (`button`, `checkbox`, `field`, `dropdown-menu`, `card`, `tabs`, `empty`, `skeleton`) gates at `error` after fixes land in `@repo/ui`. Local audit against a running dev server:

```bash
pnpm exec storybook dev --ci -p 6010
$env:A11Y_AUDIT_PREFIX="UI/Compose"; tsx scripts/audit-story-a11y.mts
```

## Configuration highlights

- `@storybook/addon-a11y` for axe-powered accessibility review in the UI
- `@storybook/addon-docs` for MDX overview pages and autodocs
- Scoped `react-docgen-typescript` on story wrapper components in `apps/storybook/stories`
- `@repo/metadata-ui/fixtures` for manifest-aligned visual review data
- Vite `optimizeDeps` and monorepo `server.fs.allow` tuning for faster dev startup
- Tailwind `@source` scanning for `packages/ui` compose + primitives (not broad metadata-ui scan)

## Score targets

| Metric | Target |
| --- | --- |
| Largest compose category chunk | &lt; 500 KB (no monolithic compose gallery chunk) |
| `play` functions | 6+ high-value interaction smokes |
| CI `test:stories` | `storybook.yml` + root `ci:metadata-ui` |
| Compose `a11y: error` (batch 1) | 8 manifest-priority galleries |
