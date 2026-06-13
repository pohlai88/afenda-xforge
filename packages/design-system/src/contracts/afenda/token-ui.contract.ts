import { z } from "zod";

import { defineRegistry } from "../registry.schema";

export const AFENDA_TOKEN_UI_CONTRACT_ID = "afenda.token-ui-contract" as const;
export const AFENDA_TOKEN_UI_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_TOKENIZED_TOKEN_TYPES = defineRegistry([
  "color",
  "typography",
  "spacing",
  "radius",
  "elevation",
  "duration",
  "font-family",
  "font-weight",
  "number",
  "order",
]);

export const AFENDA_TOKENIZED_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:theme-token-contract",
  "AFENDA:theming-contract",
  "AFENDA:visual-design-contract",
  "DTCG:2025.10",
  "TOKENUI:token-components",
] as const;

export type AfendaTokenizedTokenType =
  (typeof AFENDA_TOKENIZED_TOKEN_TYPES)[number];

export type AfendaTokenUiDisplayComponent =
  | "ColorToken"
  | "TypographyToken"
  | "SpacingToken"
  | "RadiusToken"
  | "ElevationToken"
  | "DurationToken"
  | "FontFamilyToken"
  | "FontWeightToken"
  | "NumberToken"
  | "OrderToken";

export const AFENDA_TOKEN_UI_DISPLAY_COMPONENTS = {
  color: "ColorToken",
  duration: "DurationToken",
  elevation: "ElevationToken",
  "font-family": "FontFamilyToken",
  "font-weight": "FontWeightToken",
  number: "NumberToken",
  order: "OrderToken",
  radius: "RadiusToken",
  spacing: "SpacingToken",
  typography: "TypographyToken",
} as const satisfies Record<
  AfendaTokenizedTokenType,
  AfendaTokenUiDisplayComponent
>;

/** Token UI docs nav order — https://www.tokenui.dev/docs/components/token */
export const AFENDA_TOKEN_UI_COMPONENT_NAV = [
  {
    component: "ColorToken",
    dtcgType: "color",
    namePrefix: "color-",
    title: "ColorToken",
    description:
      "Color swatches with interactive tooltips — W3C DTCG color type (§8.1).",
  },
  {
    component: "TypographyToken",
    dtcgType: "typography",
    namePrefix: "typography-",
    title: "TypographyToken",
    description: "Font size, line height, and composite typography scale values.",
  },
  {
    component: "SpacingToken",
    dtcgType: "spacing",
    namePrefix: "spacing-",
    title: "SpacingToken",
    description: "Spacing, padding, gap, and density dimension tokens.",
  },
  {
    component: "RadiusToken",
    dtcgType: "radius",
    namePrefix: "radius-",
    title: "RadiusToken",
    description: "Border radius tokens for controls, panels, and surfaces.",
  },
  {
    component: "ElevationToken",
    dtcgType: "elevation",
    namePrefix: "elevation-",
    title: "ElevationToken",
    description: "Shadow and elevation tokens for layered surfaces.",
  },
  {
    component: "DurationToken",
    dtcgType: "duration",
    namePrefix: "duration-",
    title: "DurationToken",
    description: "Motion and animation duration tokens.",
  },
  {
    component: "FontFamilyToken",
    dtcgType: "font-family",
    namePrefix: "font-family-",
    title: "FontFamilyToken",
    description: "Font stack tokens for sans, mono, and heading roles.",
  },
  {
    component: "FontWeightToken",
    dtcgType: "font-weight",
    namePrefix: "font-weight-",
    title: "FontWeightToken",
    description: "Font weight tokens for heading and label roles.",
  },
  {
    component: "NumberToken",
    dtcgType: "number",
    namePrefix: "number-",
    title: "NumberToken",
    description: "Numeric values such as letter-spacing and tracking.",
  },
  {
    component: "OrderToken",
    dtcgType: "order",
    namePrefix: "order-",
    title: "OrderToken",
    description: "Stacking order and z-index layer tokens.",
  },
] as const satisfies readonly {
  component: AfendaTokenUiDisplayComponent;
  description: string;
  dtcgType: AfendaTokenizedTokenType;
  namePrefix: string;
  title: string;
}[];

export const AFENDA_TOKEN_UI_NAME_PREFIXES = Object.fromEntries(
  AFENDA_TOKEN_UI_COMPONENT_NAV.map((entry) => [entry.component, entry.namePrefix])
) as Record<AfendaTokenUiDisplayComponent, string>;

export const afendaTokenizedTokenTypeSchema = z.enum(
  AFENDA_TOKENIZED_TOKEN_TYPES
);
export const afendaTokenUiDisplayComponentSchema = z.enum([
  "ColorToken",
  "TypographyToken",
  "SpacingToken",
  "RadiusToken",
  "ElevationToken",
  "DurationToken",
  "FontFamilyToken",
  "FontWeightToken",
  "NumberToken",
  "OrderToken",
]);

export const afendaTokenUiContractSchema = z
  .object({
    displayComponents: z.record(
      afendaTokenizedTokenTypeSchema,
      afendaTokenUiDisplayComponentSchema
    ),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_TOKEN_UI_CONTRACT_ID),
    tokenTypes: z.array(afendaTokenizedTokenTypeSchema).min(1).readonly(),
    version: z.literal(AFENDA_TOKEN_UI_CONTRACT_VERSION),
  })
  .strict()
  .refine(
    (contract) =>
      contract.tokenTypes.every(
        (tokenType) => typeof contract.displayComponents[tokenType] === "string"
      ),
    "Afenda Token UI contract must map every token type to a display component"
  );

export const afendaTokenUiContract = {
  id: AFENDA_TOKEN_UI_CONTRACT_ID,
  version: AFENDA_TOKEN_UI_CONTRACT_VERSION,
  tokenTypes: AFENDA_TOKENIZED_TOKEN_TYPES,
  displayComponents: AFENDA_TOKEN_UI_DISPLAY_COMPONENTS,
  governanceReferences: AFENDA_TOKENIZED_GOVERNANCE_REFERENCES,
} as const;

export function getAfendaTokenUiNavEntry(
  displayComponent: AfendaTokenUiDisplayComponent
) {
  const entry = AFENDA_TOKEN_UI_COMPONENT_NAV.find(
    (item) => item.component === displayComponent
  );
  if (!entry) {
    throw new Error(`Unknown Token UI display component: ${displayComponent}`);
  }
  return entry;
}

export function assessAfendaTokenUiNaming(input: {
  readonly displayComponent: AfendaTokenUiDisplayComponent;
  readonly name: string;
}): { readonly expectedPrefix: string; readonly namingInRange: boolean } {
  const expectedPrefix = AFENDA_TOKEN_UI_NAME_PREFIXES[input.displayComponent];
  return {
    expectedPrefix,
    namingInRange: input.name.startsWith(expectedPrefix),
  };
}

export function mapDtcgTypeToDisplayComponent(
  type: AfendaTokenizedTokenType
): AfendaTokenUiDisplayComponent {
  return AFENDA_TOKEN_UI_DISPLAY_COMPONENTS[type];
}

export function validateAfendaTokenCatalogNaming(
  tokens: readonly {
    readonly displayComponent: AfendaTokenUiDisplayComponent;
    readonly name: string;
  }[]
): void {
  const violations = tokens
    .map((token) => ({
      token: token.name,
      ...assessAfendaTokenUiNaming(token),
    }))
    .filter((entry) => !entry.namingInRange);

  if (violations.length > 0) {
    throw new Error(
      `Afenda token catalog naming violations: ${violations
        .map(
          (entry) =>
            `${entry.token} expected prefix ${entry.expectedPrefix}`
        )
        .join(", ")}`
    );
  }
}

export function validateAfendaTokenUiContract(): void {
  afendaTokenUiContractSchema.parse(afendaTokenUiContract);

  if (
    AFENDA_TOKEN_UI_COMPONENT_NAV.length !== AFENDA_TOKENIZED_TOKEN_TYPES.length
  ) {
    throw new Error(
      "Afenda Token UI nav must cover every governed token type exactly once"
    );
  }

  for (const entry of AFENDA_TOKEN_UI_COMPONENT_NAV) {
    if (
      AFENDA_TOKEN_UI_DISPLAY_COMPONENTS[entry.dtcgType] !== entry.component
    ) {
      throw new Error(
        `Token UI nav mismatch for ${entry.dtcgType}: expected ${AFENDA_TOKEN_UI_DISPLAY_COMPONENTS[entry.dtcgType]}, got ${entry.component}`
      );
    }
  }
}

export const AFENDA_RUNTIME_TOKEN_RESOLUTION_CONTRACT_ID =
  "afenda.runtime-token-resolution-contract" as const;
export const AFENDA_RUNTIME_TOKEN_RESOLUTION_CONTRACT_VERSION =
  "0.1.0" as const;

export const AFENDA_RUNTIME_TOKEN_RESOLUTION_SOURCES = defineRegistry([
  "literal",
  "css-variable",
  "reference-variable",
]);

export const AFENDA_RUNTIME_TOKEN_RESOLUTION_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:theme-token-contract",
  "AFENDA:runtime-reference-contract",
  "AFENDA:theming-contract",
] as const;

export type AfendaRuntimeTokenResolutionSource =
  (typeof AFENDA_RUNTIME_TOKEN_RESOLUTION_SOURCES)[number];

export const afendaRuntimeTokenResolutionSourceSchema = z.enum(
  AFENDA_RUNTIME_TOKEN_RESOLUTION_SOURCES
);

export const afendaRuntimeTokenResolutionContractSchema = z
  .object({
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_RUNTIME_TOKEN_RESOLUTION_CONTRACT_ID),
    resolutionSources: z
      .array(afendaRuntimeTokenResolutionSourceSchema)
      .min(1)
      .readonly(),
    version: z.literal(AFENDA_RUNTIME_TOKEN_RESOLUTION_CONTRACT_VERSION),
  })
  .strict()
  .refine(
    (contract) =>
      contract.resolutionSources.includes("literal") &&
      contract.resolutionSources.includes("css-variable") &&
      contract.resolutionSources.includes("reference-variable"),
    "Afenda runtime token resolution contract must preserve literal/css/reference resolution sources"
  );

export const afendaRuntimeTokenResolutionContract = {
  id: AFENDA_RUNTIME_TOKEN_RESOLUTION_CONTRACT_ID,
  version: AFENDA_RUNTIME_TOKEN_RESOLUTION_CONTRACT_VERSION,
  resolutionSources: AFENDA_RUNTIME_TOKEN_RESOLUTION_SOURCES,
  governanceReferences: AFENDA_RUNTIME_TOKEN_RESOLUTION_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaRuntimeTokenResolutionContract(): void {
  afendaRuntimeTokenResolutionContractSchema.parse(
    afendaRuntimeTokenResolutionContract
  );
}
