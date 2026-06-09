# Styles

`src/styles/globals.css` is the package-local Tailwind v4 token sheet for `@repo/ui`.

It owns:
- `@import "tailwindcss"`
- `@source` declarations for the UI source tree
- `@theme inline` token mapping
- light and dark semantic variables
- density modes
- status, surface, and sidebar color tokens
- base layer defaults
- utilities such as `control-density`, `row-density`, `text-tabular`, `font-rlig`, and `font-calt`
- reduced-motion overrides
- radius scale and animation token exports used by the design-system `type2.css` adapter

Keep this file focused on shared presentational tokens only.
