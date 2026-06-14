import { z } from "zod";

import { defineGovernanceReferences, defineRegistry, governanceReferencesSchema } from "../registry.schema";
import { AFENDA_TOKEN_PIPELINE_GOVERNANCE_REFERENCES } from "./catalogs/governance-reference.catalog";

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

export const AFENDA_PRESENTATION_TOKEN_ROLES = defineRegistry([
  "surface",
  "accent",
  "brand",
  "status",
  "lane",
  "density",
  "typography",
  "elevation",
  "motion",
  "stacking",
]);

export type AfendaPresentationTokenRole =
  (typeof AFENDA_PRESENTATION_TOKEN_ROLES)[number];

export const AFENDA_TOKENIZED_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  ...AFENDA_TOKEN_PIPELINE_GOVERNANCE_REFERENCES,
  "DTCG:2025.10",
  "TOKENUI:token-components",
]);

export type AfendaTokenizedTokenType =
  (typeof AFENDA_TOKENIZED_TOKEN_TYPES)[number];

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
} as const;

export type AfendaTokenUiDisplayComponent =
  (typeof AFENDA_TOKEN_UI_DISPLAY_COMPONENTS)[AfendaTokenizedTokenType];

export const AFENDA_TOKEN_UI_COMPONENT_DESCRIPTIONS = {
  color:
    "Color swatches with interactive tooltips — W3C DTCG color type (§8.1).",
  typography:
    "Font size, line height, and composite typography scale values.",
  spacing: "Spacing, padding, gap, and density dimension tokens.",
  radius: "Border radius tokens for controls, panels, and surfaces.",
  elevation: "Shadow and elevation tokens for layered surfaces.",
  duration: "Motion and animation duration tokens.",
  "font-family": "Font stack tokens for sans, mono, and heading roles.",
  "font-weight": "Font weight tokens for heading and label roles.",
  number: "Numeric values such as letter-spacing and tracking.",
  order: "Stacking order and z-index layer tokens.",
} as const satisfies Record<AfendaTokenizedTokenType, string>;

/** Token UI docs nav order — https://www.tokenui.dev/docs/components/token */
export const AFENDA_TOKEN_UI_COMPONENT_NAV = AFENDA_TOKENIZED_TOKEN_TYPES.map(
  (dtcgType) => ({
    dtcgType,
    component: AFENDA_TOKEN_UI_DISPLAY_COMPONENTS[dtcgType],
    namePrefix: `${dtcgType}-`,
    title: AFENDA_TOKEN_UI_DISPLAY_COMPONENTS[dtcgType],
    description: AFENDA_TOKEN_UI_COMPONENT_DESCRIPTIONS[dtcgType],
  })
) as readonly {
  component: AfendaTokenUiDisplayComponent;
  description: string;
  dtcgType: AfendaTokenizedTokenType;
  namePrefix: string;
  title: string;
}[];

export const AFENDA_TOKEN_UI_NAME_PREFIXES = Object.fromEntries(
  AFENDA_TOKEN_UI_COMPONENT_NAV.map((entry) => [
    entry.component,
    entry.namePrefix,
  ])
) as Record<AfendaTokenUiDisplayComponent, string>;

export const afendaTokenizedTokenTypeSchema = z.enum(
  AFENDA_TOKENIZED_TOKEN_TYPES
);
export const afendaTokenUiDisplayComponentSchema = z.enum(
  Object.values(AFENDA_TOKEN_UI_DISPLAY_COMPONENTS) as [
    AfendaTokenUiDisplayComponent,
    ...AfendaTokenUiDisplayComponent[],
  ]
);

export const afendaTokenUiContractSchema = z
  .object({
    displayComponents: z.record(
      afendaTokenizedTokenTypeSchema,
      afendaTokenUiDisplayComponentSchema
    ),
    governanceReferences: governanceReferencesSchema,
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
