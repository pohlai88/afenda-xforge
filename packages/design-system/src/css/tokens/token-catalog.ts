import {
  COLOR_TOKEN_SPECS,
  type CatalogColorTokenSpec,
} from "./color-tokens";
import {
  GLOBALS_CSS_ROOT_DECLARATIONS,
  GLOBALS_CSS_THEME_DECLARATIONS,
} from "./css-theme";
import type { CssDeclaration } from "./css-declaration.types";
import {
  DENSITY_TOKEN_SPECS,
  MOTION_TOKEN_SPECS,
  ORDER_TOKEN_SPECS,
  RADIUS_TOKEN_SPECS,
  SHADOW_TOKEN_SPECS,
  type DensityTokenSpec,
  type MotionAnimationSpec,
  type OrderTokenSpec,
  type RadiusTokenSpec,
  type ShadowTokenSpec,
} from "./registry-token-specs";
import {
  TYPOGRAPHY_FONT_FAMILY_SPECS,
  TYPOGRAPHY_FONT_WEIGHT_SPECS,
  TYPOGRAPHY_NUMBER_SPECS,
  TYPOGRAPHY_SCALE_SPECS,
  type TypographyFontFamilySpec,
  type TypographyFontWeightSpec,
  type TypographyNumberSpec,
  type TypographyScaleSpec,
} from "./typography-tokens";
import {
  AFENDA_TOKENIZED_GOVERNANCE_REFERENCES,
  AFENDA_TOKENIZED_TOKEN_TYPES,
  AFENDA_TOKEN_UI_DISPLAY_COMPONENTS,
  type AfendaTokenizedTokenType,
  type AfendaTokenUiDisplayComponent,
  validateAfendaTokenCatalogNaming,
  validateAfendaTokenUiContract,
  type AfendaPresentationTokenRole,
} from "../../contracts/afenda/token-ui.contract";
import { validateAfendaRuntimeTokenResolutionContract } from "../../contracts/afenda/runtime-token-resolution.contract";

export {
  AFENDA_TOKENIZED_GOVERNANCE_REFERENCES,
  AFENDA_TOKENIZED_TOKEN_TYPES,
  AFENDA_TOKEN_UI_DISPLAY_COMPONENTS,
} from "../../contracts/afenda/token-ui.contract";

export type AfendaTokenizedToken = {
  readonly cssVariable?: `--${string}`;
  readonly description: string;
  readonly governanceReferences: readonly string[];
  readonly group: string;
  readonly name: string;
  readonly presentationRoles?: readonly AfendaPresentationTokenRole[];
  readonly references?: readonly string[];
  readonly type: AfendaTokenizedTokenType;
  readonly value: string | number;
};

export type AfendaTokenUiDisplayToken = AfendaTokenizedToken & {
  readonly displayComponent: AfendaTokenUiDisplayComponent;
};

export type AfendaDesignTokenExportEntry = {
  readonly $description: string;
  readonly $extensions: {
    readonly afenda: {
      readonly cssVariable?: `--${string}`;
      readonly displayComponent: AfendaTokenUiDisplayComponent;
      readonly governanceReferences: readonly string[];
      readonly group: string;
      readonly presentationRoles?: readonly AfendaPresentationTokenRole[];
      readonly references?: readonly string[];
    };
  };
  readonly $type: AfendaTokenizedTokenType;
  readonly $value: string | number;
};

export type AfendaDesignTokenExport = Record<
  string,
  AfendaDesignTokenExportEntry
>;

function createDeclarationMap(
  declarations: readonly CssDeclaration[]
): ReadonlyMap<string, string> {
  return new Map(declarations);
}

const rootDeclarationMap = createDeclarationMap(GLOBALS_CSS_ROOT_DECLARATIONS);
const themeDeclarationMap = createDeclarationMap(GLOBALS_CSS_THEME_DECLARATIONS);

function humanizeTokenFragment(value: string): string {
  return value.replace(/-/g, " ");
}

function extractVariableReferences(value: string): readonly string[] | undefined {
  const references = [...value.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map(
    (match) => match[1] as string
  );

  return references.length > 0 ? references : undefined;
}

function readRequiredDeclarationValue(
  cssVariable: `--${string}`,
  source: "root" | "theme" | "root-or-theme"
): string {
  if (source === "root") {
    const value = rootDeclarationMap.get(cssVariable);
    if (value) {
      return value;
    }
  }

  if (source === "theme") {
    const value = themeDeclarationMap.get(cssVariable);
    if (value) {
      return value;
    }
  }

  if (source === "root-or-theme") {
    const value =
      rootDeclarationMap.get(cssVariable) ?? themeDeclarationMap.get(cssVariable);
    if (value) {
      return value;
    }
  }

  throw new Error(`Missing token declaration for ${cssVariable}`);
}

function resolvePresentationRoles(input: {
  readonly group: string;
  readonly type: AfendaTokenizedTokenType;
}): readonly AfendaPresentationTokenRole[] | undefined {
  if (input.group.startsWith("color.base") || input.group.startsWith("color.sidebar")) {
    return ["surface"];
  }
  if (input.group.startsWith("color.brand")) {
    return ["brand", "accent"];
  }
  if (input.group.startsWith("color.status")) {
    return ["status"];
  }
  if (input.group.startsWith("color.chart")) {
    return ["lane", "accent"];
  }
  if (input.group.startsWith("density.")) {
    return ["density"];
  }
  if (input.group.startsWith("typography.")) {
    return ["typography"];
  }
  if (input.group.startsWith("radius")) {
    return ["surface"];
  }
  if (input.type === "elevation") {
    return ["elevation", "surface"];
  }
  if (input.type === "duration") {
    return ["motion"];
  }
  if (input.type === "order") {
    return ["stacking"];
  }

  return undefined;
}

function buildCatalogToken(input: {
  readonly cssVariable?: `--${string}`;
  readonly description: string;
  readonly group: string;
  readonly name: string;
  readonly presentationRoles?: readonly AfendaPresentationTokenRole[];
  readonly references?: readonly string[];
  readonly type: AfendaTokenizedTokenType;
  readonly value: string | number;
}): AfendaTokenizedToken {
  const inferredReferences =
    typeof input.value === "string"
      ? extractVariableReferences(input.value)
      : undefined;
  const references = input.references ?? inferredReferences;
  const presentationRoles =
    input.presentationRoles ??
    resolvePresentationRoles({ group: input.group, type: input.type });
  const baseToken = {
    ...input,
    governanceReferences: AFENDA_TOKENIZED_GOVERNANCE_REFERENCES,
    ...(presentationRoles ? { presentationRoles } : {}),
  };

  if (references) {
    return {
      ...baseToken,
      references,
    };
  }

  return baseToken;
}

function buildColorCatalogToken(spec: CatalogColorTokenSpec): AfendaTokenizedToken {
  const tokenName =
    spec.group === "color.brand"
      ? `color-brand-${spec.token}`
      : `color-${spec.token}`;

  return buildCatalogToken({
    name: tokenName,
    type: "color",
    value: readRequiredDeclarationValue(spec.cssVariable, "root"),
    group: spec.group,
    cssVariable: spec.cssVariable,
    description: `Canonical ${spec.group.replace(/^color\./, "")} color token for ${humanizeTokenFragment(spec.token)}.`,
  });
}

function buildTypographyCatalogToken(
  spec: TypographyScaleSpec
): AfendaTokenizedToken {
  return buildCatalogToken({
    name: `typography-${spec.role}`,
    type: "typography",
    value: `${spec.fontSize} / ${spec.lineHeight}`,
    group: "typography.scale",
    cssVariable: `${spec.cssVarPrefix}-size`,
    references: [`${spec.cssVarPrefix}-leading`],
    description: `Canonical typography scale token for ${spec.role} text.`,
  });
}

function buildSpacingCatalogToken(spec: DensityTokenSpec): AfendaTokenizedToken {
  return buildCatalogToken({
    name: spec.catalogName,
    type: "spacing",
    value: readRequiredDeclarationValue(spec.cssVariable, "root"),
    group: spec.group,
    cssVariable: spec.cssVariable,
    description: `Canonical spacing token for ${humanizeTokenFragment(spec.token.replace(/^density-/, ""))}.`,
  });
}

function buildRadiusCatalogToken(spec: RadiusTokenSpec): AfendaTokenizedToken {
  return buildCatalogToken({
    name: `radius-${spec.token}`,
    type: "radius",
    value: readRequiredDeclarationValue(spec.cssVariable, "root-or-theme"),
    group: spec.group,
    cssVariable: spec.cssVariable,
    description: `Canonical radius token for ${humanizeTokenFragment(spec.token)} surfaces.`,
  });
}

function buildElevationCatalogToken(spec: ShadowTokenSpec): AfendaTokenizedToken {
  return buildCatalogToken({
    name: `elevation-${spec.token}`,
    type: "elevation",
    value: readRequiredDeclarationValue(spec.elevationVariable, "root"),
    group: spec.group,
    cssVariable: spec.elevationVariable,
    description: `Canonical elevation token for ${humanizeTokenFragment(spec.token)} surfaces.`,
  });
}

function extractAnimationDuration(spec: MotionAnimationSpec): string {
  const animationValue = readRequiredDeclarationValue(spec.cssVariable, "theme");
  const durationMatch = animationValue.match(/\b\d*\.?\d+m?s\b/i);

  if (!durationMatch?.[0]) {
    throw new Error(`Missing duration in animation declaration for ${spec.cssVariable}`);
  }

  return durationMatch[0];
}

function buildDurationCatalogToken(
  spec: MotionAnimationSpec
): AfendaTokenizedToken {
  return buildCatalogToken({
    name: `duration-${spec.token}`,
    type: "duration",
    value: extractAnimationDuration(spec),
    group: spec.group,
    references: [spec.cssVariable],
    description: `Canonical motion duration token for ${humanizeTokenFragment(spec.token)} animation.`,
  });
}

function buildOrderCatalogToken(spec: OrderTokenSpec): AfendaTokenizedToken {
  return buildCatalogToken({
    name: `order-${spec.token}`,
    type: "order",
    value: spec.value,
    group: spec.group,
    cssVariable: spec.cssVariable,
    description: `Canonical order token for ${humanizeTokenFragment(spec.token)} layering.`,
  });
}

function buildFontFamilyCatalogToken(
  spec: TypographyFontFamilySpec
): AfendaTokenizedToken | null {
  const value = themeDeclarationMap.get(spec.cssVariable);

  if (!value) {
    return null;
  }

  return buildCatalogToken({
    name: `font-family-${spec.role}`,
    type: "font-family",
    value,
    group: "typography.font",
    cssVariable: spec.cssVariable,
    description: `Canonical font family token for ${humanizeTokenFragment(spec.role)} typography.`,
  });
}

function parseNumericTokenValue(value: string): string | number {
  return /^\d+(\.\d+)?$/.test(value) ? Number(value) : value;
}

function buildFontWeightCatalogToken(
  spec: TypographyFontWeightSpec
): AfendaTokenizedToken {
  return buildCatalogToken({
    name: `font-weight-${spec.role}`,
    type: "font-weight",
    value: parseNumericTokenValue(spec.fontWeight),
    group: "typography.weight",
    references: [spec.reference],
    description: `Canonical font weight token for ${spec.role} typography.`,
  });
}

function buildNumberCatalogToken(
  spec: TypographyNumberSpec
): AfendaTokenizedToken {
  return buildCatalogToken({
    name: `number-${spec.role}-tracking`,
    type: "number",
    value: spec.letterSpacing,
    group: "typography.number",
    references: [spec.reference],
    description: `Canonical numeric spacing token for ${spec.role} typography tracking.`,
  });
}

const colorCatalog = [
  ...COLOR_TOKEN_SPECS.base,
  ...COLOR_TOKEN_SPECS.brand,
  ...COLOR_TOKEN_SPECS.status,
  ...COLOR_TOKEN_SPECS.sidebar,
  ...COLOR_TOKEN_SPECS.chart,
].map((spec) => buildColorCatalogToken(spec));

const typographyCatalog = TYPOGRAPHY_SCALE_SPECS.map((spec) =>
  buildTypographyCatalogToken(spec)
);

const spacingCatalog = DENSITY_TOKEN_SPECS.tokens.map((spec) =>
  buildSpacingCatalogToken(spec)
);

const radiusCatalog = RADIUS_TOKEN_SPECS.tokens.map((spec) =>
  buildRadiusCatalogToken(spec)
);

const elevationCatalog = SHADOW_TOKEN_SPECS.elevations.map((spec) =>
  buildElevationCatalogToken(spec)
);

const durationCatalog = MOTION_TOKEN_SPECS.animations.map((spec) =>
  buildDurationCatalogToken(spec)
);

const orderCatalog = ORDER_TOKEN_SPECS.tokens.map((spec) =>
  buildOrderCatalogToken(spec)
);

const fontFamilyCatalog = TYPOGRAPHY_FONT_FAMILY_SPECS.map((spec) =>
  buildFontFamilyCatalogToken(spec)
).filter((token): token is AfendaTokenizedToken => token !== null);

const fontWeightCatalog = TYPOGRAPHY_FONT_WEIGHT_SPECS.map((spec) =>
  buildFontWeightCatalogToken(spec)
);

const numberCatalog = TYPOGRAPHY_NUMBER_SPECS.map((spec) =>
  buildNumberCatalogToken(spec)
);

export const afendaTokenCatalog = [
  ...colorCatalog,
  ...typographyCatalog,
  ...spacingCatalog,
  ...radiusCatalog,
  ...elevationCatalog,
  ...durationCatalog,
  ...orderCatalog,
  ...fontFamilyCatalog,
  ...fontWeightCatalog,
  ...numberCatalog,
] as const satisfies readonly AfendaTokenizedToken[];

export const afendaTokenUiCatalog = afendaTokenCatalog.map(
  (token) =>
    ({
      ...token,
      displayComponent: AFENDA_TOKEN_UI_DISPLAY_COMPONENTS[token.type],
    }) as const
) as readonly AfendaTokenUiDisplayToken[];

function buildDesignTokenExportEntry(
  token: AfendaTokenizedToken
): AfendaDesignTokenExportEntry {
  return {
    $description: token.description,
    $extensions: {
      afenda: {
        ...(token.cssVariable ? { cssVariable: token.cssVariable } : {}),
        displayComponent: AFENDA_TOKEN_UI_DISPLAY_COMPONENTS[token.type],
        governanceReferences: token.governanceReferences,
        group: token.group,
        ...(token.presentationRoles
          ? { presentationRoles: token.presentationRoles }
          : {}),
        ...(token.references ? { references: token.references } : {}),
      },
    },
    $type: token.type,
    $value: token.value,
  };
}

export const afendaDesignTokenCatalogExport = Object.fromEntries(
  afendaTokenCatalog.map((token) => [token.name, buildDesignTokenExportEntry(token)])
) as AfendaDesignTokenExport;

export function validateAfendaTokenCatalog(): void {
  validateAfendaTokenUiContract();
  validateAfendaRuntimeTokenResolutionContract();

  const names = afendaTokenCatalog.map((token) => token.name);
  if (new Set(names).size !== names.length) {
    throw new Error("Afenda token catalog contains duplicate names");
  }

  const configuredTypes = new Set(
    Object.keys(AFENDA_TOKEN_UI_DISPLAY_COMPONENTS)
  );
  const catalogTypes = new Set(afendaTokenCatalog.map((token) => token.type));
  for (const tokenType of AFENDA_TOKENIZED_TOKEN_TYPES) {
    if (!configuredTypes.has(tokenType)) {
      throw new Error(`Afenda token type missing Token UI display: ${tokenType}`);
    }
    if (!catalogTypes.has(tokenType)) {
      throw new Error(`Afenda token catalog missing token type: ${tokenType}`);
    }
  }

  for (const token of afendaTokenCatalog) {
    if (!token.name.trim() || !token.description.trim() || !token.group.trim()) {
      throw new Error(`Afenda tokenized token is incomplete: ${token.name}`);
    }
  }

  validateAfendaTokenCatalogNaming(
    afendaTokenUiCatalog.map((token) => ({
      name: token.name,
      displayComponent: token.displayComponent,
    }))
  );
}
