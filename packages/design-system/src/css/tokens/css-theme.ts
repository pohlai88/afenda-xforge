import {
  AFENDA_BASE_COLOR_TOKENS as BASE_COLOR_TOKENS,
  AFENDA_BRAND_COLOR_TOKENS as BRAND_COLOR_TOKENS,
  AFENDA_SIDEBAR_COLOR_TOKENS as SIDEBAR_COLOR_TOKENS,
  AFENDA_STATUS_COLOR_TOKENS as STATUS_COLOR_TOKENS,
} from "../../contracts/afenda/registries/color-token.registry";
import { AFENDA_THEME_PRESET_REGISTRY as THEME_PRESETS } from "../../contracts/afenda/registries/theme-preset.registry";
import {
  CHART_DARK_DECLARATIONS,
  CHART_LIGHT_DECLARATIONS,
  GLOBALS_CSS_ACTIVE_LANE_DECLARATIONS,
  GLOBALS_CSS_LANE_DARK_DECLARATIONS,
  GLOBALS_CSS_LANE_ROOT_DECLARATIONS,
  SIDEBAR_DARK_DECLARATIONS,
  SIDEBAR_LIGHT_DECLARATIONS,
  SIDEBAR_THEME_INLINE_DECLARATIONS,
  STATUS_DARK_DECLARATIONS,
  STATUS_LIGHT_DECLARATIONS,
  laneThemeInlineDeclarations,
  sidebarRootDeclarations,
} from "./css-declarations";
import type { CssDeclaration } from "./css-declaration.types";
export type { CssDeclaration } from "./css-declaration.types";
import { SURFACE_COLOR_TOKENS } from "./color-tokens";
import {
  ANIMATION_TOKENS,
  ORDER_TOKEN_SPECS,
  ORDER_TOKENS,
  RADIUS_TOKENS,
} from "./registry-token-specs";
import {
  FONT_FEATURE_TOKENS,
  TAILWIND_TEXT_SIZE_OVERRIDES,
  TEXT_UTILITY_TOKENS,
  TYPE_SCALE_DEFINITIONS,
  TYPE_SCALE_ROLES,
  TYPE_UTILITY_TOKENS,
} from "./typography-tokens";

const AFENDA_PRESET = THEME_PRESETS.find((preset) => preset.name === "afenda");

if (!AFENDA_PRESET) {
  throw new Error("afenda theme preset is required for globals CSS generation");
}

function tenantBrandVar(tenantName: string, fallback: string): string {
  return `var(${tenantName}, ${fallback})`;
}

export const GLOBALS_CSS_SOURCE_GLOBS = [
  "../components/**/*.{ts,tsx}",
  "../lib/**/*.{ts,tsx}",
  "../index.ts",
] as const;

/** shadcn CLI v4 multiplicative radius scale from `--radius`. */
export const GLOBALS_CSS_RADIUS_THEME_DECLARATIONS: readonly CssDeclaration[] =
  [
    ["--radius-sm", "calc(var(--radius) * 0.6)"],
    ["--radius-md", "calc(var(--radius) * 0.8)"],
    ["--radius-lg", "var(--radius)"],
    ["--radius-xl", "calc(var(--radius) * 1.4)"],
    ["--radius-2xl", "calc(var(--radius) * 1.8)"],
    ["--radius-3xl", "calc(var(--radius) * 2.2)"],
    ["--radius-4xl", "calc(var(--radius) * 2.6)"],
    ["--radius-control", "var(--radius-control)"],
    ["--radius-panel", "var(--radius-panel)"],
  ] as const;

function typeScaleRootDeclarations(): readonly CssDeclaration[] {
  return TYPE_SCALE_ROLES.flatMap((role) => {
    const definition = TYPE_SCALE_DEFINITIONS[role];

    return [
      [`${definition.cssVarPrefix}-size`, definition.fontSize],
      [`${definition.cssVarPrefix}-leading`, definition.lineHeight],
    ] as const;
  });
}

function typeScaleThemeDeclarations(): readonly CssDeclaration[] {
  const semantic = TYPE_SCALE_ROLES.flatMap((role) => {
    const definition = TYPE_SCALE_DEFINITIONS[role];

    return [
      [`--text-${role}`, `var(${definition.cssVarPrefix}-size)`],
      [
        `--text-${role}--line-height`,
        `var(${definition.cssVarPrefix}-leading)`,
      ],
    ] as const;
  });

  const tailwindOverrides = Object.entries(
    TAILWIND_TEXT_SIZE_OVERRIDES
  ).flatMap(
    ([step, value]) =>
      [
        [`--text-${step}`, value.size],
        [`--text-${step}--line-height`, value.lineHeight],
      ] as const
  );

  return [...semantic, ...tailwindOverrides];
}

function orderRootDeclarations(): readonly CssDeclaration[] {
  return ORDER_TOKEN_SPECS.tokens.map(
    (spec) => [spec.cssVariable, String(spec.value)] as const
  );
}

function renderTypeUtility(role: (typeof TYPE_SCALE_ROLES)[number]): string {
  const definition = TYPE_SCALE_DEFINITIONS[role];
  const lines = [
    `font-size: var(${definition.cssVarPrefix}-size);`,
    `line-height: var(${definition.cssVarPrefix}-leading);`,
  ];

  if (definition.fontWeight) {
    lines.push(`font-weight: ${definition.fontWeight};`);
  }

  if (definition.letterSpacing) {
    lines.push(`letter-spacing: ${definition.letterSpacing};`);
  }

  if (definition.textTransform) {
    lines.push(`text-transform: ${definition.textTransform};`);
  }

  return lines.join("\n  ");
}

export const GLOBALS_CSS_TYPE_ROOT_DECLARATIONS: readonly CssDeclaration[] =
  typeScaleRootDeclarations();

export const GLOBALS_CSS_ROOT_DECLARATIONS: readonly CssDeclaration[] = [
  [
    "--brand-primary",
    tenantBrandVar("--tenant-primary", AFENDA_PRESET.brand.light.primary),
  ],
  [
    "--brand-primary-foreground",
    tenantBrandVar(
      "--tenant-primary-foreground",
      AFENDA_PRESET.brand.light["primary-foreground"]
    ),
  ],
  [
    "--brand-secondary",
    tenantBrandVar("--tenant-secondary", AFENDA_PRESET.brand.light.secondary),
  ],
  [
    "--brand-secondary-foreground",
    tenantBrandVar(
      "--tenant-secondary-foreground",
      AFENDA_PRESET.brand.light["secondary-foreground"]
    ),
  ],
  [
    "--brand-accent",
    tenantBrandVar("--tenant-accent", AFENDA_PRESET.brand.light.accent),
  ],
  [
    "--brand-accent-foreground",
    tenantBrandVar(
      "--tenant-accent-foreground",
      AFENDA_PRESET.brand.light["accent-foreground"]
    ),
  ],
  ["--background", "oklch(0.985 0.003 258)"],
  ["--foreground", "oklch(0.20 0.015 258)"],
  ["--card", "oklch(0.995 0.002 258)"],
  ["--card-foreground", "oklch(0.20 0.015 258)"],
  ["--popover", "oklch(0.995 0.002 258)"],
  ["--popover-foreground", "oklch(0.20 0.015 258)"],
  ["--surface", "oklch(0.988 0.004 258)"],
  ["--surface-foreground", "oklch(0.22 0.016 258)"],
  ["--surface-muted", "oklch(0.965 0.006 258)"],
  ["--surface-accent", "oklch(0.948 0.012 198)"],
  ["--primary", "var(--brand-primary)"],
  ["--primary-foreground", "var(--brand-primary-foreground)"],
  ["--secondary", "oklch(0.955 0.008 258)"],
  ["--secondary-foreground", "oklch(0.28 0.018 258)"],
  ["--muted", "oklch(0.944 0.006 258)"],
  ["--muted-foreground", "oklch(0.45 0.020 258)"],
  ["--accent", "oklch(0.952 0.012 198)"],
  ["--accent-foreground", "oklch(0.22 0.025 198)"],
  ...STATUS_LIGHT_DECLARATIONS,
  ["--border", "oklch(0.905 0.010 258)"],
  ["--input", "oklch(0.905 0.010 258)"],
  ["--ring", "oklch(0.50 0.018 258)"],
  ["--ring-brand", "var(--brand-primary)"],
  ...CHART_LIGHT_DECLARATIONS,
  ["--radius", "0.625rem"],
  ["--radius-control", "0.5rem"],
  ["--radius-panel", "0.75rem"],
  ["--density-control-height", "2.25rem"],
  ["--density-table-row-height", "2.75rem"],
  ...orderRootDeclarations(),
  ["--elevation-xs", "0 1px 1px oklch(0.1 0.01 260 / 0.05)"],
  ["--elevation-sm", "0 1px 2px oklch(0.1 0.01 260 / 0.07)"],
  ["--elevation-md", "0 10px 28px oklch(0.1 0.01 260 / 0.08)"],
  ["--elevation-lane-active-glow", "0 0 16px var(--lane-active-glow)"],
  ...sidebarRootDeclarations(SIDEBAR_LIGHT_DECLARATIONS),
  ...GLOBALS_CSS_LANE_ROOT_DECLARATIONS,
  ...GLOBALS_CSS_ACTIVE_LANE_DECLARATIONS,
  ...GLOBALS_CSS_TYPE_ROOT_DECLARATIONS,
] as const;

export const GLOBALS_CSS_DARK_DECLARATIONS: readonly CssDeclaration[] = [
  [
    "--brand-primary",
    tenantBrandVar("--tenant-primary", AFENDA_PRESET.brand.dark.primary),
  ],
  [
    "--brand-primary-foreground",
    tenantBrandVar(
      "--tenant-primary-foreground",
      AFENDA_PRESET.brand.dark["primary-foreground"]
    ),
  ],
  [
    "--brand-secondary",
    tenantBrandVar("--tenant-secondary", AFENDA_PRESET.brand.dark.secondary),
  ],
  [
    "--brand-secondary-foreground",
    tenantBrandVar(
      "--tenant-secondary-foreground",
      AFENDA_PRESET.brand.dark["secondary-foreground"]
    ),
  ],
  [
    "--brand-accent",
    tenantBrandVar("--tenant-accent", AFENDA_PRESET.brand.dark.accent),
  ],
  [
    "--brand-accent-foreground",
    tenantBrandVar(
      "--tenant-accent-foreground",
      AFENDA_PRESET.brand.dark["accent-foreground"]
    ),
  ],
  ["--background", "oklch(0.155 0.012 258)"],
  ["--foreground", "oklch(0.935 0.006 258)"],
  ["--card", "oklch(0.195 0.013 258)"],
  ["--card-foreground", "oklch(0.935 0.006 258)"],
  ["--popover", "oklch(0.195 0.013 258)"],
  ["--popover-foreground", "oklch(0.935 0.006 258)"],
  ["--surface", "oklch(0.205 0.013 258)"],
  ["--surface-foreground", "oklch(0.92 0.006 258)"],
  ["--surface-muted", "oklch(0.255 0.013 258)"],
  ["--surface-accent", "oklch(0.28 0.022 198)"],
  ["--primary", "var(--brand-primary)"],
  ["--primary-foreground", "var(--brand-primary-foreground)"],
  ["--secondary", "oklch(0.26 0.014 258)"],
  ["--secondary-foreground", "oklch(0.935 0.006 258)"],
  ["--muted", "oklch(0.25 0.013 258)"],
  ["--muted-foreground", "oklch(0.77 0.012 258)"],
  ["--accent", "oklch(0.28 0.020 198)"],
  ["--accent-foreground", "oklch(0.935 0.006 258)"],
  ...STATUS_DARK_DECLARATIONS,
  ["--border", "oklch(0.30 0.014 258)"],
  ["--input", "oklch(0.30 0.014 258)"],
  ["--ring", "oklch(0.68 0.015 258)"],
  ["--ring-brand", "var(--brand-primary)"],
  ...CHART_DARK_DECLARATIONS,
  ["--elevation-xs", "0 1px 1px oklch(0 0 0 / 0.2)"],
  ["--elevation-sm", "0 1px 2px oklch(0 0 0 / 0.24)"],
  ["--elevation-md", "0 18px 48px oklch(0 0 0 / 0.26)"],
  ...sidebarRootDeclarations(SIDEBAR_DARK_DECLARATIONS),
  ...GLOBALS_CSS_LANE_DARK_DECLARATIONS,
] as const;

export const GLOBALS_CSS_COMPACT_DENSITY_DECLARATIONS: readonly CssDeclaration[] =
  [
    ["--density-control-height", "2rem"],
    ["--density-table-row-height", "2.375rem"],
    ["--radius-control", "0.375rem"],
  ] as const;

export const GLOBALS_CSS_COMFORTABLE_DENSITY_DECLARATIONS: readonly CssDeclaration[] =
  [
    ["--density-control-height", "2.75rem"],
    ["--density-table-row-height", "3.25rem"],
  ] as const;

function colorThemeInlineDeclarations(
  tokens: readonly string[]
): readonly CssDeclaration[] {
  return tokens.map(
    (token) => [`--color-${token}`, `var(--${token})`] as const
  );
}

export const GLOBALS_CSS_THEME_DECLARATIONS: readonly CssDeclaration[] = [
  ...colorThemeInlineDeclarations(BASE_COLOR_TOKENS),
  ...colorThemeInlineDeclarations(BRAND_COLOR_TOKENS),
  ...colorThemeInlineDeclarations(STATUS_COLOR_TOKENS),
  ...SIDEBAR_THEME_INLINE_DECLARATIONS,
  ["--font-sans", "ui-sans-serif, system-ui, sans-serif"],
  ["--font-heading", "ui-sans-serif, system-ui, sans-serif"],
  [
    "--font-mono",
    `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace`,
  ],
  ...typeScaleThemeDeclarations(),
  ["--color-chart-1", "var(--chart-1)"],
  ["--color-chart-2", "var(--chart-2)"],
  ["--color-chart-3", "var(--chart-3)"],
  ["--color-chart-4", "var(--chart-4)"],
  ["--color-chart-5", "var(--chart-5)"],
  ["--color-chart-6", "var(--chart-6)"],
  ["--color-chart-7", "var(--chart-7)"],
  ...GLOBALS_CSS_RADIUS_THEME_DECLARATIONS,
  ["--animate-shimmer", "shimmer 1.8s linear infinite"],
  ["--shadow-xs", "var(--elevation-xs)"],
  ["--shadow-sm", "var(--elevation-sm)"],
  ["--shadow-md", "var(--elevation-md)"],
  ["--shadow-lane-active-glow", "var(--elevation-lane-active-glow)"],
  ...laneThemeInlineDeclarations(),
] as const;

export const GLOBALS_CSS_KEYFRAMES = {
  shimmer: [
    "0% {",
    "  background-position: -200% 0;",
    "}",
    "",
    "100% {",
    "  background-position: 200% 0;",
    "}",
  ] as const,
} as const;

export const GLOBALS_CSS_UTILITY_DECLARATIONS = [
  ["text-tabular", "font-variant-numeric: tabular-nums;"],
  ["font-rlig", 'font-feature-settings: "rlig";'],
  ["font-calt", 'font-feature-settings: "calt";'],
  ...ORDER_TOKEN_SPECS.tokens.map((spec) => [
    `z-layer-${spec.token}`,
    `z-index: var(${spec.cssVariable});`,
  ] as const),
  ...TYPE_UTILITY_TOKENS.map((utility) => {
    const role = utility.replace(
      /^type-/,
      ""
    ) as (typeof TYPE_SCALE_ROLES)[number];

    return [utility, renderTypeUtility(role)] as const;
  }),
  ["control-density", "min-height: var(--density-control-height);"],
  ["row-density", "min-height: var(--density-table-row-height);"],
] as const;

function declarationNames(
  declarations: readonly CssDeclaration[]
): Set<string> {
  return new Set(declarations.map(([name]) => name));
}

function themeColorNames(declarations: readonly CssDeclaration[]): Set<string> {
  return new Set(
    declarations
      .map(([name]) => name)
      .filter((name) => name.startsWith("--color-"))
      .map((name) => name.replace(/^--color-/, ""))
  );
}

export function validateGlobalsCssTokens(): void {
  if (
    SURFACE_COLOR_TOKENS.length !== 4 ||
    !SURFACE_COLOR_TOKENS.includes("surface") ||
    ANIMATION_TOKENS[0] !== "shimmer" ||
    !FONT_FEATURE_TOKENS.includes("rlig") ||
    !FONT_FEATURE_TOKENS.includes("calt") ||
    !TEXT_UTILITY_TOKENS.includes("text-tabular") ||
    TYPE_SCALE_ROLES.length !== 5 ||
    TYPE_UTILITY_TOKENS.length !== 5
  ) {
    throw new Error(
      "globals CSS tokens do not match the design-system contract"
    );
  }

  const rootNames = declarationNames(GLOBALS_CSS_ROOT_DECLARATIONS);
  const darkNames = declarationNames(GLOBALS_CSS_DARK_DECLARATIONS);
  const themeNames = declarationNames(GLOBALS_CSS_THEME_DECLARATIONS);
  const themeColors = themeColorNames(GLOBALS_CSS_THEME_DECLARATIONS);

  const semanticColorTokens = [
    ...BASE_COLOR_TOKENS,
    ...BRAND_COLOR_TOKENS,
    ...STATUS_COLOR_TOKENS,
    ...SIDEBAR_COLOR_TOKENS,
  ];

  for (const token of semanticColorTokens) {
    const cssVar = `--${token}`;

    if (!rootNames.has(cssVar)) {
      throw new Error(`globals CSS missing :root declaration for ${cssVar}`);
    }

    if (!darkNames.has(cssVar)) {
      throw new Error(`globals CSS missing .dark declaration for ${cssVar}`);
    }

    if (!themeColors.has(token)) {
      throw new Error(`globals CSS missing @theme inline mapping for ${token}`);
    }
  }

  for (const token of RADIUS_TOKENS) {
    const themeVar = `--radius-${token}`;

    if (!themeNames.has(themeVar)) {
      throw new Error(
        `globals CSS missing @theme inline mapping for ${themeVar}`
      );
    }
  }

  for (const token of ORDER_TOKENS) {
    const cssVar = `--order-${token}`;

    if (!rootNames.has(cssVar)) {
      throw new Error(`globals CSS missing :root declaration for ${cssVar}`);
    }
  }

  for (const token of SIDEBAR_COLOR_TOKENS) {
    const cssVar = `--${token}`;

    if (!(rootNames.has(cssVar) && darkNames.has(cssVar))) {
      throw new Error(`globals CSS sidebar alias missing for ${cssVar}`);
    }
  }

  for (const [themeVar] of laneThemeInlineDeclarations()) {
    if (!themeNames.has(themeVar)) {
      throw new Error(
        `globals CSS missing @theme inline mapping for ${themeVar}`
      );
    }
  }
}
