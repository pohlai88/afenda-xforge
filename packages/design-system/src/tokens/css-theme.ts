import { THEME_PRESETS } from "../contracts/theme-preset.contract";
import {
  GLOBALS_CSS_ACTIVE_LANE_DECLARATIONS,
  GLOBALS_CSS_LANE_DARK_DECLARATIONS,
  GLOBALS_CSS_LANE_ROOT_DECLARATIONS,
  laneThemeInlineDeclarations,
} from "./lane-css-declarations";
import { CHART_DARK_DECLARATIONS, CHART_LIGHT_DECLARATIONS } from "./chart-tokens";
import { SURFACE_COLOR_TOKENS } from "./color-tokens";
import { ANIMATION_TOKENS } from "./motion-tokens";
import { RADIUS_TOKENS } from "./radius-tokens";
import {
  STATUS_DARK_DECLARATIONS,
  STATUS_LIGHT_DECLARATIONS,
} from "./status-tokens";
import { FONT_FEATURE_TOKENS, TEXT_UTILITY_TOKENS } from "./typography-tokens";

export type CssDeclaration = readonly [name: string, value: string];

const XFORGE_PRESET = THEME_PRESETS.find((preset) => preset.name === "xforge");

if (!XFORGE_PRESET) {
  throw new Error("xforge theme preset is required for globals CSS generation");
}

function tenantBrandVar(tenantName: string, fallback: string): string {
  return `var(${tenantName}, ${fallback})`;
}

export const GLOBALS_CSS_SOURCE_GLOBS = [
  "../components/**/*.{ts,tsx}",
  "../lib/**/*.{ts,tsx}",
  "../index.ts",
] as const;

export const GLOBALS_CSS_ROOT_DECLARATIONS: readonly CssDeclaration[] = [
  [
    "--brand-primary",
    tenantBrandVar("--tenant-primary", XFORGE_PRESET.brand.light.primary),
  ],
  [
    "--brand-primary-foreground",
    tenantBrandVar(
      "--tenant-primary-foreground",
      XFORGE_PRESET.brand.light["primary-foreground"]
    ),
  ],
  [
    "--brand-secondary",
    tenantBrandVar("--tenant-secondary", XFORGE_PRESET.brand.light.secondary),
  ],
  [
    "--brand-accent",
    tenantBrandVar("--tenant-accent", XFORGE_PRESET.brand.light.accent),
  ],
  ["--background", "oklch(0.982 0.004 255)"],
  ["--foreground", "oklch(0.205 0.018 264)"],
  ["--card", "oklch(0.998 0.002 255)"],
  ["--card-foreground", "oklch(0.205 0.018 264)"],
  ["--popover", "oklch(0.998 0.002 255)"],
  ["--popover-foreground", "oklch(0.205 0.018 264)"],
  ["--surface", "oklch(0.99 0.003 255)"],
  ["--surface-foreground", "oklch(0.234 0.02 264)"],
  ["--surface-muted", "oklch(0.955 0.007 255)"],
  ["--surface-accent", "oklch(0.932 0.018 198)"],
  ["--primary", "var(--brand-primary)"],
  ["--primary-foreground", "var(--brand-primary-foreground)"],
  ["--secondary", "oklch(0.948 0.011 254)"],
  ["--secondary-foreground", "oklch(0.267 0.023 264)"],
  ["--muted", "oklch(0.958 0.007 255)"],
  ["--muted-foreground", "oklch(0.48 0.024 264)"],
  ["--accent", "oklch(0.936 0.018 198)"],
  ["--accent-foreground", "oklch(0.245 0.029 218)"],
  ...STATUS_LIGHT_DECLARATIONS,
  ["--border", "oklch(0.887 0.013 255)"],
  ["--input", "oklch(0.887 0.013 255)"],
  ["--ring", "oklch(0.55 0.02 264)"],
  ["--ring-brand", "var(--brand-primary)"],
  ...CHART_LIGHT_DECLARATIONS,
  ["--radius", "0.625rem"],
  ["--radius-control", "0.5rem"],
  ["--radius-panel", "0.75rem"],
  ["--radius-2xl", "1rem"],
  ["--radius-3xl", "1.25rem"],
  ["--radius-4xl", "1.5rem"],
  ["--density-control-height", "2.25rem"],
  ["--density-table-row-height", "2.75rem"],
  ["--elevation-xs", "0 1px 1px oklch(0.1 0.01 260 / 0.05)"],
  ["--elevation-sm", "0 1px 2px oklch(0.1 0.01 260 / 0.07)"],
  ["--elevation-md", "0 10px 28px oklch(0.1 0.01 260 / 0.08)"],
  ["--elevation-lane-active-glow", "0 0 16px var(--lane-active-glow)"],
  ["--sidebar", "var(--surface)"],
  ["--sidebar-foreground", "var(--surface-foreground)"],
  ["--sidebar-primary", "var(--primary)"],
  ["--sidebar-primary-foreground", "var(--primary-foreground)"],
  ["--sidebar-accent", "var(--surface-accent)"],
  ["--sidebar-accent-foreground", "var(--accent-foreground)"],
  ["--sidebar-border", "var(--border)"],
  ["--sidebar-ring", "var(--ring)"],
  ...GLOBALS_CSS_LANE_ROOT_DECLARATIONS,
  ...GLOBALS_CSS_ACTIVE_LANE_DECLARATIONS,
] as const;

export const GLOBALS_CSS_DARK_DECLARATIONS: readonly CssDeclaration[] = [
  [
    "--brand-primary",
    tenantBrandVar("--tenant-primary", XFORGE_PRESET.brand.dark.primary),
  ],
  [
    "--brand-primary-foreground",
    tenantBrandVar(
      "--tenant-primary-foreground",
      XFORGE_PRESET.brand.dark["primary-foreground"]
    ),
  ],
  [
    "--brand-secondary",
    tenantBrandVar("--tenant-secondary", XFORGE_PRESET.brand.dark.secondary),
  ],
  [
    "--brand-accent",
    tenantBrandVar("--tenant-accent", XFORGE_PRESET.brand.dark.accent),
  ],
  ["--background", "oklch(0.17 0.014 264)"],
  ["--foreground", "oklch(0.958 0.005 258)"],
  ["--card", "oklch(0.205 0.016 264)"],
  ["--card-foreground", "oklch(0.958 0.005 258)"],
  ["--popover", "oklch(0.205 0.016 264)"],
  ["--popover-foreground", "oklch(0.958 0.005 258)"],
  ["--surface", "oklch(0.218 0.016 264)"],
  ["--surface-foreground", "oklch(0.948 0.006 258)"],
  ["--surface-muted", "oklch(0.274 0.016 264)"],
  ["--surface-accent", "oklch(0.305 0.027 198)"],
  ["--primary", "var(--brand-primary)"],
  ["--primary-foreground", "var(--brand-primary-foreground)"],
  ["--secondary", "oklch(0.288 0.018 264)"],
  ["--secondary-foreground", "oklch(0.958 0.005 258)"],
  ["--muted", "oklch(0.268 0.016 264)"],
  ["--muted-foreground", "oklch(0.738 0.014 260)"],
  ["--accent", "oklch(0.31 0.027 198)"],
  ["--accent-foreground", "oklch(0.958 0.005 258)"],
  ...STATUS_DARK_DECLARATIONS,
  ["--border", "oklch(0.322 0.019 264)"],
  ["--input", "oklch(0.322 0.019 264)"],
  ["--ring", "oklch(0.72 0.02 260)"],
  ["--ring-brand", "var(--brand-primary)"],
  ...CHART_DARK_DECLARATIONS,
  ["--elevation-xs", "0 1px 1px oklch(0 0 0 / 0.2)"],
  ["--elevation-sm", "0 1px 2px oklch(0 0 0 / 0.24)"],
  ["--elevation-md", "0 18px 48px oklch(0 0 0 / 0.26)"],
  ["--sidebar", "var(--surface)"],
  ["--sidebar-foreground", "var(--surface-foreground)"],
  ["--sidebar-primary", "var(--primary)"],
  ["--sidebar-primary-foreground", "var(--primary-foreground)"],
  ["--sidebar-accent", "var(--surface-accent)"],
  ["--sidebar-accent-foreground", "var(--accent-foreground)"],
  ["--sidebar-border", "var(--border)"],
  ["--sidebar-ring", "var(--ring)"],
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

export const GLOBALS_CSS_THEME_DECLARATIONS: readonly CssDeclaration[] = [
  ["--color-background", "var(--background)"],
  ["--color-foreground", "var(--foreground)"],
  ["--font-sans", "ui-sans-serif, system-ui, sans-serif"],
  [
    "--font-mono",
    `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace`,
  ],
  ["--color-ring", "var(--ring)"],
  ["--color-input", "var(--input)"],
  ["--color-border", "var(--border)"],
  ["--color-surface", "var(--surface)"],
  ["--color-surface-foreground", "var(--surface-foreground)"],
  ["--color-surface-muted", "var(--surface-muted)"],
  ["--color-surface-accent", "var(--surface-accent)"],
  ["--color-destructive", "var(--destructive)"],
  ["--color-destructive-foreground", "var(--destructive-foreground)"],
  ["--color-destructive-muted", "var(--destructive-muted)"],
  [
    "--color-destructive-muted-foreground",
    "var(--destructive-muted-foreground)",
  ],
  ["--color-destructive-border", "var(--destructive-border)"],
  ["--color-invert", "var(--invert)"],
  ["--color-invert-foreground", "var(--invert-foreground)"],
  ["--color-success", "var(--success)"],
  ["--color-success-foreground", "var(--success-foreground)"],
  ["--color-success-muted", "var(--success-muted)"],
  ["--color-success-muted-foreground", "var(--success-muted-foreground)"],
  ["--color-success-border", "var(--success-border)"],
  ["--color-warning", "var(--warning)"],
  ["--color-warning-foreground", "var(--warning-foreground)"],
  ["--color-warning-muted", "var(--warning-muted)"],
  ["--color-warning-muted-foreground", "var(--warning-muted-foreground)"],
  ["--color-warning-border", "var(--warning-border)"],
  ["--color-info", "var(--info)"],
  ["--color-info-foreground", "var(--info-foreground)"],
  ["--color-info-muted", "var(--info-muted)"],
  ["--color-info-muted-foreground", "var(--info-muted-foreground)"],
  ["--color-info-border", "var(--info-border)"],
  ["--color-accent-foreground", "var(--accent-foreground)"],
  ["--color-accent", "var(--accent)"],
  ["--color-muted-foreground", "var(--muted-foreground)"],
  ["--color-muted", "var(--muted)"],
  ["--color-secondary-foreground", "var(--secondary-foreground)"],
  ["--color-secondary", "var(--secondary)"],
  ["--color-primary-foreground", "var(--primary-foreground)"],
  ["--color-primary", "var(--primary)"],
  ["--color-popover-foreground", "var(--popover-foreground)"],
  ["--color-popover", "var(--popover)"],
  ["--color-card-foreground", "var(--card-foreground)"],
  ["--color-card", "var(--card)"],
  ["--color-chart-1", "var(--chart-1)"],
  ["--color-chart-2", "var(--chart-2)"],
  ["--color-chart-3", "var(--chart-3)"],
  ["--color-chart-4", "var(--chart-4)"],
  ["--color-chart-5", "var(--chart-5)"],
  ["--color-chart-6", "var(--chart-6)"],
  ["--color-chart-7", "var(--chart-7)"],
  ["--color-sidebar", "var(--sidebar)"],
  ["--color-sidebar-foreground", "var(--sidebar-foreground)"],
  ["--color-sidebar-primary", "var(--sidebar-primary)"],
  ["--color-sidebar-primary-foreground", "var(--sidebar-primary-foreground)"],
  ["--color-sidebar-accent", "var(--sidebar-accent)"],
  ["--color-sidebar-accent-foreground", "var(--sidebar-accent-foreground)"],
  ["--color-sidebar-border", "var(--sidebar-border)"],
  ["--color-sidebar-ring", "var(--sidebar-ring)"],
  ["--radius-sm", "calc(var(--radius) - 0.25rem)"],
  ["--radius-md", "calc(var(--radius) - 0.125rem)"],
  ["--radius-lg", "var(--radius)"],
  ["--radius-xl", "calc(var(--radius) + 0.25rem)"],
  ["--radius-2xl", "var(--radius-2xl)"],
  ["--radius-3xl", "var(--radius-3xl)"],
  ["--radius-4xl", "var(--radius-4xl)"],
  ["--radius-control", "var(--radius-control)"],
  ["--radius-panel", "var(--radius-panel)"],
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

export const GLOBALS_CSS_UTILITIES = [
  ["text-tabular", "font-variant-numeric: tabular-nums;"],
  ["font-rlig", 'font-feature-settings: "rlig";'],
  ["font-calt", 'font-feature-settings: "calt";'],
  ["control-density", "min-height: var(--density-control-height);"],
  ["row-density", "min-height: var(--density-table-row-height);"],
] as const;

export function validateGlobalsCssTokens(): void {
  if (
    SURFACE_COLOR_TOKENS.length !== 4 ||
    !SURFACE_COLOR_TOKENS.includes("surface") ||
    !RADIUS_TOKENS.includes("2xl") ||
    !RADIUS_TOKENS.includes("3xl") ||
    !RADIUS_TOKENS.includes("4xl") ||
    ANIMATION_TOKENS[0] !== "shimmer" ||
    !FONT_FEATURE_TOKENS.includes("rlig") ||
    !FONT_FEATURE_TOKENS.includes("calt") ||
    !TEXT_UTILITY_TOKENS.includes("text-tabular")
  ) {
    throw new Error("globals CSS tokens do not match the design-system contract");
  }
}
