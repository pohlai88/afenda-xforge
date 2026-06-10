# Storybook

Visual workspace for `@repo/ui` and `@repo/metadata-ui` public surfaces.

## Scope

- `Introduction`: orientation and system-level guidance
- `UI / Compose`: compose pattern galleries (40 registry groups)
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
pnpm --filter storybook generate:compose-stories
```

## Automation

| Script | Purpose |
| --- | --- |
| `check:build` | Static production build (CI gate for compile/bundle health) |
| `check:metadata-ui-browser-smoke` | Playwright smoke against the metadata-ui integration fixture |
| `test:stories` | Starts Storybook CI dev server and runs test-runner with axe checks |
| `pretest:stories` | Ensures metadata-ui generated artifacts are current and Chromium is installed |

Run story tests locally (dev server not required):

```bash
pnpm --filter storybook test:stories
```

## Accessibility gates

| Tier | Stories | CI behavior |
| --- | --- | --- |
| `a11y.test: 'error'` | Introduction, Metadata UI (all), UI Primitives (all), Compose Registry | `test:stories` fails on axe violations |
| `a11y.test: 'todo'` | UI Compose galleries (40) | Logged in Storybook UI; not enforced in CI yet |

Promote stories to `error` after fixing violations in `@repo/ui` or `@repo/metadata-ui`. Local audit against a running dev server:

```bash
pnpm exec storybook dev --ci -p 6010
$env:A11Y_AUDIT_PREFIX="Metadata UI"; tsx scripts/audit-story-a11y.mts
```

## Configuration highlights

- `@storybook/addon-a11y` for axe-powered accessibility review in the UI
- `@repo/metadata-ui/fixtures` for manifest-aligned visual review data
- Vite `optimizeDeps` and monorepo `server.fs.allow` tuning for faster dev startup
- Tailwind `@source` scanning for `packages/ui` and `packages/metadata-ui`
