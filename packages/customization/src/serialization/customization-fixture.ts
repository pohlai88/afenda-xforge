import type { EntityMetadata, MetadataFeatureContract } from "@repo/metadata";

import type {
  CustomizationContract,
  CustomizationFixtureContract,
  CustomizationImportMode,
  CustomizationImportReviewContract,
} from "../contracts/customization.contract.ts";
import { customizationFixtureSchema } from "../schemas/customization.schema.ts";
import type { CustomizationMetadataValidationOptions } from "../validation/validate-customization-against-metadata.ts";
import {
  assertCustomizationMatchesMetadata,
  validateCustomizationAgainstMetadata,
} from "../validation/validate-customization-against-metadata.ts";

export type CreateCustomizationFixtureInput = {
  customization: CustomizationContract;
  exportedAt: string;
  exportedBy: string;
};

type CustomizableMetadata = EntityMetadata | MetadataFeatureContract;

export const createCustomizationFixture = (
  input: CreateCustomizationFixtureInput
): CustomizationFixtureContract =>
  customizationFixtureSchema.parse({
    exportedAt: input.exportedAt,
    exportedBy: input.exportedBy,
    schemaVersion: 1,
    customization: input.customization,
  });

export const parseCustomizationFixture = (
  input: unknown
): CustomizationFixtureContract => customizationFixtureSchema.parse(input);

export const serializeCustomizationFixture = (
  fixture: CustomizationFixtureContract
): string =>
  `${JSON.stringify(customizationFixtureSchema.parse(fixture), null, 2)}\n`;

export const deserializeCustomizationFixture = (
  serialized: string
): CustomizationFixtureContract =>
  parseCustomizationFixture(JSON.parse(serialized));

export const validateCustomizationFixtureAgainstMetadata = (
  fixture: CustomizationFixtureContract,
  metadata: CustomizableMetadata,
  options: CustomizationMetadataValidationOptions = {}
) =>
  validateCustomizationAgainstMetadata(
    fixture.customization,
    metadata,
    options
  );

export const assertCustomizationFixtureMatchesMetadata = (
  fixture: CustomizationFixtureContract,
  metadata: CustomizableMetadata,
  options: CustomizationMetadataValidationOptions = {}
): CustomizationFixtureContract => {
  assertCustomizationMatchesMetadata(fixture.customization, metadata, options);
  return fixture;
};

export type ReviewCustomizationFixtureImportInput = {
  fixture: CustomizationFixtureContract;
  metadata: CustomizableMetadata;
  mode: CustomizationImportMode;
  options?: Omit<
    CustomizationMetadataValidationOptions,
    "allowStaleMetadataFingerprint" | "validationMode"
  >;
};

export const reviewCustomizationFixtureImport = ({
  fixture,
  metadata,
  mode,
  options = {},
}: ReviewCustomizationFixtureImportInput): CustomizationImportReviewContract => {
  const validation = validateCustomizationAgainstMetadata(
    fixture.customization,
    metadata,
    {
      ...options,
      allowStaleMetadataFingerprint: mode === "draft-with-warnings",
      validationMode: mode === "strict" ? "import-strict" : "import-draft",
    }
  );

  return {
    customization: fixture.customization,
    issues: validation.issues,
    mode,
    publishable: mode === "strict" && validation.valid,
    requiresReview:
      mode === "draft-with-warnings" || validation.issues.length > 0,
    valid: validation.valid,
  };
};
