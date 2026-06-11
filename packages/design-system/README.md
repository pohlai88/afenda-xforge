# Design System Boundary

`@repo/design-system` owns typed design vocabulary only.

Published surface:
- `src/tokens/*`
- `src/tokens/index.ts`
- `src/contracts/*`
- `src/contracts/index.ts`
- `src/variants/*`
- `src/variants/index.ts`
- generated CSS for `@repo/ui` via the globals adapter

This package does not ship:
- React components
- theme providers
- runtime global CSS files
- shadcn or Radix primitives
- application or ERP logic

Runtime UI concerns live in `@repo/ui`.

Enterprise vocabulary currently includes:
- semantic color, status, chart, sidebar, and surface tokens
- radius, density, motion, shadow, and typography tokens
- approved font preset metadata without runtime font loading
- approved brand theme presets without React, Next.js, or CSS provider logic
- component variant contracts consumed by `@repo/ui`

Use `pnpm --filter @repo/design-system globals:css` to refresh `packages/ui/src/styles/globals.css`, and `globals:css:check` in CI to enforce drift-free sync.

Generated globals import `tailwindcss`, `tw-animate-css`, and `shadcn/tailwind.css`, then Afenda `:root` / `.dark` tokens and `@theme inline` mappings.

### Sidebar chrome policy

Sidebar / menu chrome uses a dedicated editorial frame (`sidebar-tokens.ts`):

- `--sidebar` — slightly deeper than `--background` (navigation rail)
- `--sidebar-accent` — restrained brand wash for hover/active (menu accent)
- `--sidebar-primary` → `--primary` (active nav marker)

Menu vocabulary maps to sidebar tokens (`bg-sidebar`, `bg-sidebar-accent`). Split surfaces only for floating sidebar or marketing shells — update `sidebar-tokens.ts` and `SIDEBAR_COLOR_TOKENS`.
