/**
 * Tailwind v4 + shadcn CSS lint pipeline.
 *
 * Architecture enforced (tailwind-v4-shadcn / tailwind-design-system):
 * 1. :root / .dark semantic tokens at stylesheet root (oklch or var())
 * 2. @theme inline maps tokens to Tailwind utilities via var(--token)
 * 3. @layer base applies semantic utilities — no hsl(var(--*)) double-wrap
 * 4. Storybook preview.css extends globals — never duplicates @import tailwindcss
 */
import configTailwindcss from "@dreamsicle.io/stylelint-config-tailwindcss/dist/stylelint.config.mjs";
import afendaCssPlugins from "./tools/stylelint/afenda-css-plugin.mjs";

/** @type {import('stylelint').Config} */
export default {
  extends: [
    "stylelint-config-standard",
    "@dreamsicle.io/stylelint-config-tailwindcss",
  ],
  plugins: [...afendaCssPlugins],
  languageOptions: {
    ...configTailwindcss.languageOptions,
    syntax: {
      ...configTailwindcss.languageOptions.syntax,
      types: {
        ...configTailwindcss.languageOptions.syntax.types,
      },
      properties: {
        ...configTailwindcss.languageOptions.syntax.properties,
      },
      atRules: {
        ...configTailwindcss.languageOptions.syntax.atRules,
      },
    },
  },
  rules: {
    ...configTailwindcss.rules,

    // Tailwind v4 + OKLCH token stack — disable rules that fight oklch()/var() tokens
    "alpha-value-notation": null,
    "color-function-notation": null,
    "color-hex-length": null,
    "color-named": null,
    "hue-degree-notation": null,
    "import-notation": null,
    "lightness-notation": null,
    "no-descending-specificity": null,
    "selector-class-pattern": null,
    "value-keyword-case": null,

    // Afenda token + Tailwind v4 names (--text-sm--line-height, --color-lane-*); covered by afenda/* rules
    "custom-property-pattern": null,

    // Ban legacy color functions in declarations (token sources use oklch via custom rule)
    "function-disallowed-list": ["rgb", "hsl", "hsla"],
    "color-no-hex": true,

    // Prefer registered @utility over deprecated v3 @layer utilities patterns in new CSS
    "at-rule-disallowed-list": [["screen", "variants", "responsive"]],

    // Afenda architecture rules (MUI-VIS-015 CSS surface)
    "afenda/no-root-in-layer-base": true,
    "afenda/no-dark-nested-theme": true,
    "afenda/no-hsl-var-wrap": true,
    "afenda/theme-inline-uses-var": true,
    "afenda/token-sources-use-oklch-or-var": true,
    "afenda/preview-css-pipeline": true,
    "afenda/utility-uses-declarations": true,
    "afenda/require-custom-variant-dark": true,
    "afenda/require-top-level-root-dark": true,
    "afenda/require-theme-inline": true,
    "afenda/require-theme-inline-mappings": true,
    "afenda/tailwind-import-only-in-globals": true,
    "afenda/prefer-neutral-ring": true,
  },
  ignoreFiles: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/storybook-static/**",
  ],
};
