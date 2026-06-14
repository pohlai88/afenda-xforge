# Styles

`src/styles/globals.css` is the package-local Tailwind v4 token sheet for `@repo/ui`.

It is generated from `@repo/design-system` token contracts. Do not edit it manually — run:

```bash
pnpm --filter @repo/design-system globals:css
pnpm --filter @repo/design-system verify:globals-css
```

Pipeline authority: `packages/design-system/src/contracts/afenda/globals-css.contract.ts`.

It owns:
- `@import "tailwindcss"`, `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"`
- `@source` declarations for the UI source tree
- `@theme inline` token mapping
- light and dark semantic variables
- density modes
- status, surface, and sidebar color tokens
- neutral focus ring (`--ring`) separate from optional brand ring (`--ring-brand`)
- independent chart palette (`--chart-1` through `--chart-7`, not brand aliases)
- tenant hue collision validation via `validateTenantBrandingColors`
- base layer defaults
- compact typography scale (`type-read`, `type-head`, `type-caption`, `type-micro`, `type-label`) with Tailwind `text-sm` capped at 12px
- utilities such as `control-density`, `row-density`, `text-tabular`, `font-rlig`, and `font-calt`
- reduced-motion overrides
- radius scale and animation token exports used by the design-system globals CSS adapter

Keep this file focused on shared presentational tokens only.
