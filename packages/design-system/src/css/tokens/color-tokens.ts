import { AFENDA_CHART_COLOR_TOKENS } from "../../contracts/afenda/registries/chart.registry";
import {
  AFENDA_BASE_COLOR_TOKENS,
  AFENDA_BRAND_COLOR_TOKENS,
  AFENDA_SIDEBAR_COLOR_TOKENS,
  AFENDA_STATUS_COLOR_TOKENS,
  AFENDA_SURFACE_COLOR_TOKENS,
  type AfendaBaseColorToken as BaseColorToken,
  type AfendaBrandColorToken as BrandColorToken,
  type AfendaColorToken as ColorToken,
  type AfendaSidebarColorToken as SidebarColorToken,
  type AfendaStatusColorToken as StatusColorToken,
  type AfendaSurfaceColorToken as SurfaceColorToken,
} from "../../contracts/afenda/registries/color-token.registry";

export {
  AFENDA_BASE_COLOR_TOKENS as BASE_COLOR_TOKENS,
  AFENDA_BRAND_COLOR_TOKENS as BRAND_COLOR_TOKENS,
  AFENDA_SIDEBAR_COLOR_TOKENS as SIDEBAR_COLOR_TOKENS,
  AFENDA_STATUS_COLOR_TOKENS as STATUS_COLOR_TOKENS,
  AFENDA_SURFACE_COLOR_TOKENS as SURFACE_COLOR_TOKENS,
  type BaseColorToken,
  type BrandColorToken,
  type ColorToken,
  type SidebarColorToken,
  type StatusColorToken,
  type SurfaceColorToken,
};

export const CHART_COLOR_TOKENS = AFENDA_CHART_COLOR_TOKENS;

export const COLOR_TOKEN_GROUPS = {
  base: AFENDA_BASE_COLOR_TOKENS,
  brand: AFENDA_BRAND_COLOR_TOKENS,
  surface: AFENDA_SURFACE_COLOR_TOKENS,
  status: AFENDA_STATUS_COLOR_TOKENS,
  sidebar: AFENDA_SIDEBAR_COLOR_TOKENS,
  chart: CHART_COLOR_TOKENS,
} as const;

export type CatalogColorGroup = keyof typeof COLOR_TOKEN_GROUPS;

export type CatalogColorTokenSpec<G extends CatalogColorGroup = CatalogColorGroup> = {
  readonly cssVariable: `--${string}`;
  readonly group: `color.${G}`;
  readonly token: (typeof COLOR_TOKEN_GROUPS)[G][number];
};

export const BRAND_TOKEN_CSS_VARIABLES = {
  primary: "--brand-primary",
  "primary-foreground": "--brand-primary-foreground",
  secondary: "--brand-secondary",
  "secondary-foreground": "--brand-secondary-foreground",
  accent: "--brand-accent",
  "accent-foreground": "--brand-accent-foreground",
} as const satisfies Record<BrandColorToken, `--${string}`>;

function buildColorTokenSpecs<G extends CatalogColorGroup>(
  group: G,
  tokens: readonly (typeof COLOR_TOKEN_GROUPS)[G][number][],
  resolveCssVariable: (
    token: (typeof COLOR_TOKEN_GROUPS)[G][number]
  ) => `--${string}` = (token) => `--${token}`
): readonly CatalogColorTokenSpec<G>[] {
  return tokens.map((token) => ({
    token,
    cssVariable: resolveCssVariable(token),
    group: `color.${group}`,
  })) as readonly CatalogColorTokenSpec<G>[];
}

export const COLOR_TOKEN_SPECS = {
  base: buildColorTokenSpecs("base", AFENDA_BASE_COLOR_TOKENS),
  brand: buildColorTokenSpecs(
    "brand",
    AFENDA_BRAND_COLOR_TOKENS,
    (token) => BRAND_TOKEN_CSS_VARIABLES[token]
  ),
  surface: buildColorTokenSpecs("surface", AFENDA_SURFACE_COLOR_TOKENS),
  status: buildColorTokenSpecs("status", AFENDA_STATUS_COLOR_TOKENS),
  sidebar: buildColorTokenSpecs("sidebar", AFENDA_SIDEBAR_COLOR_TOKENS),
  chart: buildColorTokenSpecs("chart", CHART_COLOR_TOKENS),
} as const;
