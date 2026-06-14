import { z } from "zod";

import { defineGovernanceReferences, defineRegistry, governanceReferencesSchema } from "../registry.schema";
import {
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_RUNTIME_REFERENCE,
  AFENDA_GOV_THEMING,
  AFENDA_GOV_TOKEN_UI,
} from "./catalogs/governance-reference.catalog";

export const AFENDA_RUNTIME_TOKEN_RESOLUTION_CONTRACT_ID =
  "afenda.runtime-token-resolution-contract" as const;
export const AFENDA_RUNTIME_TOKEN_RESOLUTION_CONTRACT_VERSION =
  "0.1.0" as const;

export const AFENDA_RUNTIME_TOKEN_RESOLUTION_SOURCES = defineRegistry([
  "literal",
  "css-variable",
  "reference-variable",
]);

export const AFENDA_RUNTIME_TOKEN_RESOLUTION_GOVERNANCE_REFERENCES =
  defineGovernanceReferences([
    AFENDA_GOV_DESIGN_SYSTEM,
    AFENDA_GOV_TOKEN_UI,
    AFENDA_GOV_RUNTIME_REFERENCE,
    AFENDA_GOV_THEMING,
  ]);

export type AfendaRuntimeTokenResolutionSource =
  (typeof AFENDA_RUNTIME_TOKEN_RESOLUTION_SOURCES)[number];

export const afendaRuntimeTokenResolutionSourceSchema = z.enum(
  AFENDA_RUNTIME_TOKEN_RESOLUTION_SOURCES
);

export const afendaRuntimeTokenResolutionContractSchema = z
  .object({
    governanceReferences: governanceReferencesSchema,
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
