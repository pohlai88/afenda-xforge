# UI Architecture

`@repo/ui` is the application-facing presentational package.

Ownership:
- React primitives and shadcn-style controls
- app-facing exports consumed by features and Storybook

Non-ownership:
- database access
- auth and permissions
- business execution
- metadata adapters
- global app bootstrap

Internal layout:
- `src/components/ui-shadcn/*` for primitives
- `src/components/*` for higher-level shared controls
- `src/lib/*` for local utilities
- `src/types.ts` for package-local contracts

Public surface:
- root `@repo/ui`

Notes:
- Keep package-local imports relative.
- Keep design tokens and CSS utilities in `src/styles/globals.css`.
- Do not introduce runtime authority or data-layer dependencies here.
