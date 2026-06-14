import { z } from "zod";

import { defineGovernanceReferences, governanceReferencesSchema } from "../registry.schema";

export const AFENDA_PRESENTATION_RESOLUTION_CONTRACT_ID =
  "afenda.presentation-resolution-contract" as const;
export const AFENDA_PRESENTATION_RESOLUTION_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_PRESENTATION_RESOLUTION_GOVERNANCE_REFERENCES =
  defineGovernanceReferences([
    "afenda.presentation-metadata-contract",
    "afenda.presentation-resolution-catalog",
    "afenda.runtime-token-resolution-contract",
  ]);

export type AfendaResolvedPresentationBundle = {
  cssVariables: Readonly<Record<`--${string}`, string>>;
  dataAttributes: Readonly<Record<string, string>>;
  governanceReferences: readonly string[];
  tailwindClasses: readonly string[];
};

const cssVariableKeySchema = z
  .string()
  .regex(/^--[a-z0-9-]+$/, "CSS variable keys must be kebab-case");

export const afendaResolvedPresentationBundleSchema = z
  .object({
    cssVariables: z.record(cssVariableKeySchema, z.string().min(1)),
    dataAttributes: z.record(z.string().min(1), z.string()),
    governanceReferences: governanceReferencesSchema,
    tailwindClasses: z.array(z.string().trim().min(1)).readonly(),
  })
  .strict();

export const afendaPresentationResolutionContractSchema = z
  .object({
    governanceReferences: governanceReferencesSchema,
    id: z.literal(AFENDA_PRESENTATION_RESOLUTION_CONTRACT_ID),
    version: z.literal(AFENDA_PRESENTATION_RESOLUTION_CONTRACT_VERSION),
  })
  .strict();

export const afendaPresentationResolutionContract = {
  id: AFENDA_PRESENTATION_RESOLUTION_CONTRACT_ID,
  version: AFENDA_PRESENTATION_RESOLUTION_CONTRACT_VERSION,
  governanceReferences: AFENDA_PRESENTATION_RESOLUTION_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaPresentationResolutionContract(): void {
  afendaPresentationResolutionContractSchema.parse(
    afendaPresentationResolutionContract
  );
}

export function createEmptyResolvedPresentationBundle(): AfendaResolvedPresentationBundle {
  return {
    cssVariables: {},
    tailwindClasses: [],
    dataAttributes: {},
    governanceReferences: [
      ...AFENDA_PRESENTATION_RESOLUTION_GOVERNANCE_REFERENCES,
    ],
  };
}
