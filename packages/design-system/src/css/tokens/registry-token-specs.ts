import {
  AFENDA_DENSITY_TOKEN_BINDINGS,
  AFENDA_DENSITY_MODES,
  AFENDA_DENSITY_TOKEN_NAMES,
  AFENDA_MOTION_ANIMATION_TOKENS,
  AFENDA_MOTION_PREFERENCE_TOKENS,
  AFENDA_ORDER_TOKEN_BINDINGS,
  AFENDA_ORDER_TOKENS,
  AFENDA_RADIUS_TOKENS,
  AFENDA_SHADOW_TOKENS as AFENDA_SHADOW_REGISTRY_TOKENS,
  type AfendaDensityTokenBinding as DensityBinding,
  type AfendaDensityRegistryMode as DensityMode,
  type AfendaDensityRegistryMode as DensityModeToken,
  type AfendaDensityTokenName as DensityToken,
  type AfendaOrderToken as OrderToken,
  type AfendaOrderTokenBinding as OrderTokenBinding,
  type AfendaRadiusToken as RadiusToken,
} from "../../contracts/afenda/registries/dimension-token.registry";

export {
  AFENDA_DENSITY_TOKEN_BINDINGS as DENSITY_BINDINGS,
  AFENDA_DENSITY_MODES as DENSITY_MODE_TOKENS,
  AFENDA_DENSITY_MODES as DENSITY_MODES,
  AFENDA_DENSITY_TOKEN_NAMES as DENSITY_TOKENS,
  type DensityBinding,
  type DensityModeToken,
  type DensityMode,
  type DensityToken,
};

export type DensityTokenSpec = {
  readonly catalogName: `spacing-${string}`;
  readonly cssVariable: `--${DensityToken}`;
  readonly group: "density.spacing";
  readonly token: DensityToken;
};

export const DENSITY_TOKEN_CSS_VARIABLES = Object.fromEntries(
  AFENDA_DENSITY_TOKEN_NAMES.map((token) => [token, `--${token}`])
) as Readonly<Record<DensityToken, `--${DensityToken}`>>;

export const DENSITY_TOKEN_SPECS = {
  tokens: AFENDA_DENSITY_TOKEN_NAMES.map((token) => ({
    token,
    cssVariable: DENSITY_TOKEN_CSS_VARIABLES[token],
    catalogName: `spacing-${token.replace(/^density-/, "")}` as const,
    group: "density.spacing" as const,
  })) as readonly DensityTokenSpec[],
} as const;

export {
  AFENDA_ORDER_TOKENS as ORDER_TOKENS,
  type OrderToken,
  type OrderTokenBinding,
};

export type OrderTokenSpec = {
  readonly cssVariable: `--order-${OrderToken}`;
  readonly group: "order.z-index";
  readonly token: OrderToken;
  readonly value: OrderTokenBinding["value"];
};

export const ORDER_TOKEN_CSS_VARIABLES = Object.fromEntries(
  AFENDA_ORDER_TOKENS.map((token) => [token, `--order-${token}`])
) as Readonly<Record<OrderToken, `--order-${OrderToken}`>>;

export const ORDER_TOKEN_SPECS = {
  tokens: AFENDA_ORDER_TOKEN_BINDINGS.map((binding) => ({
    ...binding,
    cssVariable: ORDER_TOKEN_CSS_VARIABLES[binding.token],
    group: "order.z-index" as const,
  })) as readonly OrderTokenSpec[],
} as const;

export {
  AFENDA_RADIUS_TOKENS as RADIUS_TOKENS,
  type RadiusToken,
};

export type RadiusTokenSpec = {
  readonly cssVariable: `--radius-${RadiusToken}`;
  readonly group: "radius";
  readonly token: RadiusToken;
};

export const RADIUS_TOKEN_CSS_VARIABLES = Object.fromEntries(
  AFENDA_RADIUS_TOKENS.map((token) => [token, `--radius-${token}`])
) as Readonly<Record<RadiusToken, `--radius-${RadiusToken}`>>;

export const RADIUS_TOKEN_SPECS = {
  tokens: AFENDA_RADIUS_TOKENS.map((token) => ({
    token,
    cssVariable: RADIUS_TOKEN_CSS_VARIABLES[token],
    group: "radius" as const,
  })) as readonly RadiusTokenSpec[],
} as const;

export const SHADOW_TOKENS = AFENDA_SHADOW_REGISTRY_TOKENS;

export type ShadowToken = (typeof SHADOW_TOKENS)[number];
export type ShadowTokenSpec = {
  readonly elevationVariable: `--elevation-${ShadowToken}`;
  readonly group: "elevation";
  readonly themeVariable: `--shadow-${ShadowToken}`;
  readonly token: ShadowToken;
};

export const SHADOW_TOKEN_SPECS = {
  elevations: SHADOW_TOKENS.map((token) => ({
    token,
    elevationVariable: `--elevation-${token}` as const,
    themeVariable: `--shadow-${token}` as const,
    group: "elevation" as const,
  })) as readonly ShadowTokenSpec[],
} as const;

export const ANIMATION_TOKENS = AFENDA_MOTION_ANIMATION_TOKENS;
export const MOTION_PREFERENCE_TOKENS = AFENDA_MOTION_PREFERENCE_TOKENS;
export const MOTION_PREFERENCES = MOTION_PREFERENCE_TOKENS;

export type AnimationToken = (typeof ANIMATION_TOKENS)[number];

export type MotionAnimationSpec = {
  readonly cssVariable: `--animate-${AnimationToken}`;
  readonly group: "motion.duration";
  readonly token: AnimationToken;
};

export const MOTION_ANIMATION_CSS_VARIABLES = Object.fromEntries(
  ANIMATION_TOKENS.map((token) => [token, `--animate-${token}`])
) as Readonly<Record<AnimationToken, `--animate-${AnimationToken}`>>;

export const MOTION_TOKEN_SPECS = {
  animations: ANIMATION_TOKENS.map((token) => ({
    token,
    cssVariable: MOTION_ANIMATION_CSS_VARIABLES[token],
    group: "motion.duration" as const,
  })) as readonly MotionAnimationSpec[],
} as const;
