import { z } from "zod";

import { defineRegistry } from "../../registry.schema";

export const AFENDA_DENSITY_REGISTRY_ID = "afenda.density-registry" as const;
export const AFENDA_DENSITY_REGISTRY_VERSION = "0.1.0" as const;
export const AFENDA_DENSITY_MODES = defineRegistry([
  "compact",
  "default",
  "comfortable",
]);

export const AFENDA_DENSITY_TOKEN_NAMES = defineRegistry([
  "density-control-height",
  "density-table-row-height",
]);

export const AFENDA_DENSITY_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:layout-contract",
  "AFENDA:touch-layout-contract",
  "AFENDA:typography-contract",
  "AFENDA:visual-design-contract",
  "WCAG:1.4.12",
] as const;

export type AfendaDensityRegistryMode = (typeof AFENDA_DENSITY_MODES)[number];
export type AfendaDensityTokenName = (typeof AFENDA_DENSITY_TOKEN_NAMES)[number];

export type AfendaDensityTokenBinding = {
  controlHeightToken: "density-control-height";
  mode: AfendaDensityRegistryMode;
  tableRowHeightToken: "density-table-row-height";
};

export const afendaDensityRegistryModeSchema = z.enum(AFENDA_DENSITY_MODES);
export const afendaDensityTokenNameSchema = z.enum(AFENDA_DENSITY_TOKEN_NAMES);

export const afendaDensityTokenBindingSchema = z
  .object({
    controlHeightToken: z.literal("density-control-height"),
    mode: afendaDensityRegistryModeSchema,
    tableRowHeightToken: z.literal("density-table-row-height"),
  })
  .strict();

export const AFENDA_DENSITY_TOKEN_BINDINGS: readonly AfendaDensityTokenBinding[] =
  AFENDA_DENSITY_MODES.map((mode) => ({
    mode,
    controlHeightToken: "density-control-height",
    tableRowHeightToken: "density-table-row-height",
  }));

export const afendaDensityRegistrySchema = z
  .object({
    bindings: z.array(afendaDensityTokenBindingSchema).min(1).readonly(),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_DENSITY_REGISTRY_ID),
    modes: z.array(afendaDensityRegistryModeSchema).min(1).readonly(),
    tokenNames: z.array(afendaDensityTokenNameSchema).min(1).readonly(),
    version: z.literal(AFENDA_DENSITY_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.bindings.map((binding) => binding.mode).join("|") ===
      registry.modes.join("|"),
    "Afenda density token bindings must cover each density mode"
  );

export const afendaDensityRegistry = {
  id: AFENDA_DENSITY_REGISTRY_ID,
  version: AFENDA_DENSITY_REGISTRY_VERSION,
  modes: AFENDA_DENSITY_MODES,
  tokenNames: AFENDA_DENSITY_TOKEN_NAMES,
  bindings: AFENDA_DENSITY_TOKEN_BINDINGS,
  governanceReferences: AFENDA_DENSITY_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaDensityRegistry(): void {
  afendaDensityRegistrySchema.parse(afendaDensityRegistry);
}

export const AFENDA_MOTION_REGISTRY_ID = "afenda.motion-registry" as const;
export const AFENDA_MOTION_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_MOTION_ANIMATION_TOKENS = defineRegistry(["shimmer"]);

export const AFENDA_MOTION_PREFERENCE_TOKENS = defineRegistry([
  "default",
  "reduced",
]);

export const AFENDA_MOTION_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:motion-contract",
  "AFENDA:interaction-contract",
  "AFENDA:performance-contract",
  "WCAG:2.2.2",
] as const;

export type AfendaMotionAnimationToken =
  (typeof AFENDA_MOTION_ANIMATION_TOKENS)[number];
export type AfendaMotionPreferenceToken =
  (typeof AFENDA_MOTION_PREFERENCE_TOKENS)[number];

export const afendaMotionAnimationTokenSchema = z.enum(
  AFENDA_MOTION_ANIMATION_TOKENS
);
export const afendaMotionPreferenceTokenSchema = z.enum(
  AFENDA_MOTION_PREFERENCE_TOKENS
);

export const afendaMotionRegistrySchema = z
  .object({
    animationTokens: z
      .array(afendaMotionAnimationTokenSchema)
      .min(1)
      .readonly(),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_MOTION_REGISTRY_ID),
    preferenceTokens: z
      .array(afendaMotionPreferenceTokenSchema)
      .min(1)
      .readonly(),
    version: z.literal(AFENDA_MOTION_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.animationTokens.includes("shimmer") &&
      registry.preferenceTokens.includes("default") &&
      registry.preferenceTokens.includes("reduced"),
    "Afenda motion registry must preserve shimmer/default/reduced vocabulary"
  );

export const afendaMotionRegistry = {
  id: AFENDA_MOTION_REGISTRY_ID,
  version: AFENDA_MOTION_REGISTRY_VERSION,
  animationTokens: AFENDA_MOTION_ANIMATION_TOKENS,
  preferenceTokens: AFENDA_MOTION_PREFERENCE_TOKENS,
  governanceReferences: AFENDA_MOTION_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaMotionRegistry(): void {
  afendaMotionRegistrySchema.parse(afendaMotionRegistry);
}

export const AFENDA_ORDER_REGISTRY_ID = "afenda.order-registry" as const;
export const AFENDA_ORDER_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_ORDER_TOKENS = defineRegistry([
  "background",
  "base",
  "ornament",
  "raised",
  "sticky",
  "popover",
  "overlay",
]);

export const AFENDA_ORDER_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:layout-contract",
  "AFENDA:interaction-contract",
  "AFENDA:visual-design-contract",
  "AFENDA:theme-token-contract",
  "WCAG:2.4.3",
] as const;

export type AfendaOrderToken = (typeof AFENDA_ORDER_TOKENS)[number];

export type AfendaOrderTokenBinding = {
  readonly token: AfendaOrderToken;
  readonly value: number;
};

export const afendaOrderTokenSchema = z.enum(AFENDA_ORDER_TOKENS);

export const afendaOrderTokenBindingSchema = z
  .object({
    token: afendaOrderTokenSchema,
    value: z.number().int(),
  })
  .strict();

export const AFENDA_ORDER_TOKEN_BINDINGS = [
  { token: "background", value: -10 },
  { token: "base", value: 0 },
  { token: "ornament", value: 1 },
  { token: "raised", value: 10 },
  { token: "sticky", value: 20 },
  { token: "popover", value: 30 },
  { token: "overlay", value: 50 },
] as const satisfies readonly AfendaOrderTokenBinding[];

export const afendaOrderRegistrySchema = z
  .object({
    bindings: z.array(afendaOrderTokenBindingSchema).min(1).readonly(),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_ORDER_REGISTRY_ID),
    tokens: z.array(afendaOrderTokenSchema).min(1).readonly(),
    version: z.literal(AFENDA_ORDER_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.bindings.map((binding) => binding.token).join("|") ===
      registry.tokens.join("|"),
    "Afenda order token bindings must cover each governed order token"
  )
  .refine(
    (registry) =>
      new Set(registry.bindings.map((binding) => binding.value)).size ===
      registry.bindings.length,
    "Afenda order token bindings must preserve unique layer values"
  )
  .refine(
    (registry) =>
      registry.tokens.includes("background") &&
      registry.tokens.includes("base") &&
      registry.tokens.includes("ornament") &&
      registry.tokens.includes("raised") &&
      registry.tokens.includes("sticky") &&
      registry.tokens.includes("popover") &&
      registry.tokens.includes("overlay"),
    "Afenda order registry must preserve governed background/base/ornament/raised/sticky/popover/overlay tokens"
  );

export const afendaOrderRegistry = {
  id: AFENDA_ORDER_REGISTRY_ID,
  version: AFENDA_ORDER_REGISTRY_VERSION,
  tokens: AFENDA_ORDER_TOKENS,
  bindings: AFENDA_ORDER_TOKEN_BINDINGS,
  governanceReferences: AFENDA_ORDER_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaOrderRegistry(): void {
  afendaOrderRegistrySchema.parse(afendaOrderRegistry);
}

export const AFENDA_RADIUS_REGISTRY_ID = "afenda.radius-registry" as const;
export const AFENDA_RADIUS_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_RADIUS_SOURCE_TOKENS = defineRegistry(["radius"]);

export const AFENDA_RADIUS_TOKENS = defineRegistry([
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "control",
  "panel",
]);

export const AFENDA_RADIUS_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:visual-design-contract",
  "AFENDA:layout-contract",
  "AFENDA:component-variant-contract",
  "AFENDA:theme-token-contract",
] as const;

export type AfendaRadiusSourceToken =
  (typeof AFENDA_RADIUS_SOURCE_TOKENS)[number];
export type AfendaRadiusToken = (typeof AFENDA_RADIUS_TOKENS)[number];

export const afendaRadiusSourceTokenSchema = z.enum(
  AFENDA_RADIUS_SOURCE_TOKENS
);
export const afendaRadiusTokenSchema = z.enum(AFENDA_RADIUS_TOKENS);

export const afendaRadiusRegistrySchema = z
  .object({
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_RADIUS_REGISTRY_ID),
    sourceTokens: z.array(afendaRadiusSourceTokenSchema).min(1).readonly(),
    tokens: z.array(afendaRadiusTokenSchema).min(1).readonly(),
    version: z.literal(AFENDA_RADIUS_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.sourceTokens.includes("radius") &&
      registry.tokens.includes("control") &&
      registry.tokens.includes("panel"),
    "Afenda radius registry must include source, control, and panel tokens"
  );

export const afendaRadiusRegistry = {
  id: AFENDA_RADIUS_REGISTRY_ID,
  version: AFENDA_RADIUS_REGISTRY_VERSION,
  sourceTokens: AFENDA_RADIUS_SOURCE_TOKENS,
  tokens: AFENDA_RADIUS_TOKENS,
  governanceReferences: AFENDA_RADIUS_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaRadiusRegistry(): void {
  afendaRadiusRegistrySchema.parse(afendaRadiusRegistry);
}

export const AFENDA_SHADOW_REGISTRY_ID = "afenda.shadow-registry" as const;
export const AFENDA_SHADOW_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_SHADOW_TOKENS = defineRegistry(["xs", "sm", "md"]);

export const AFENDA_SHADOW_ALIAS_TOKENS = defineRegistry([
  "lane-active-glow",
]);

export const AFENDA_SHADOW_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:visual-design-contract",
  "AFENDA:elevation-contract",
  "AFENDA:visual-lane-registry",
  "AFENDA:theme-token-contract",
] as const;

export type AfendaShadowToken = (typeof AFENDA_SHADOW_TOKENS)[number];
export type AfendaShadowAliasToken = (typeof AFENDA_SHADOW_ALIAS_TOKENS)[number];

export const afendaShadowTokenSchema = z.enum(AFENDA_SHADOW_TOKENS);
export const afendaShadowAliasTokenSchema = z.enum(AFENDA_SHADOW_ALIAS_TOKENS);

export const afendaShadowRegistrySchema = z
  .object({
    aliasTokens: z.array(afendaShadowAliasTokenSchema).min(1).readonly(),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_SHADOW_REGISTRY_ID),
    tokens: z.array(afendaShadowTokenSchema).min(1).readonly(),
    version: z.literal(AFENDA_SHADOW_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.tokens.includes("xs") &&
      registry.tokens.includes("sm") &&
      registry.tokens.includes("md") &&
      registry.aliasTokens.includes("lane-active-glow"),
    "Afenda shadow registry must preserve xs/sm/md and lane-active-glow vocabulary"
  );

export const afendaShadowRegistry = {
  id: AFENDA_SHADOW_REGISTRY_ID,
  version: AFENDA_SHADOW_REGISTRY_VERSION,
  tokens: AFENDA_SHADOW_TOKENS,
  aliasTokens: AFENDA_SHADOW_ALIAS_TOKENS,
  governanceReferences: AFENDA_SHADOW_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaShadowRegistry(): void {
  afendaShadowRegistrySchema.parse(afendaShadowRegistry);
}
