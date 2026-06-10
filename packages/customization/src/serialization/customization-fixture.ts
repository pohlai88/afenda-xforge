import type { EntityMetadata, MetadataFeatureContract } from "@repo/metadata";

import type {
  CustomizationContract,
  CustomizationFixtureContract,
  CustomizationImportMode,
  CustomizationImportReviewContract,
} from "../contracts/customization.contract.ts";
import {
  createCustomizationFixtureMetadataSnapshot,
  reviewCustomizationFixtureMetadataSnapshot,
} from "../internal/customization-fixture-snapshot.ts";
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
  metadata?: CustomizableMetadata;
};

type CustomizableMetadata = EntityMetadata | MetadataFeatureContract;

const toStableJsonValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((entry) => toStableJsonValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, entryValue]) => [key, toStableJsonValue(entryValue)])
    );
  }

  return value;
};

export const createCustomizationFixture = (
  input: CreateCustomizationFixtureInput
): CustomizationFixtureContract =>
  customizationFixtureSchema.parse({
    customization: input.customization,
    exportedAt: input.exportedAt,
    exportedBy: input.exportedBy,
    metadataSnapshot: input.metadata
      ? createCustomizationFixtureMetadataSnapshot(
          input.customization,
          input.metadata
        )
      : undefined,
    schemaVersion: input.metadata ? 2 : 1,
  });

export const parseCustomizationFixture = (
  input: unknown
): CustomizationFixtureContract => customizationFixtureSchema.parse(input);

export const serializeCustomizationFixture = (
  fixture: CustomizationFixtureContract
): string =>
  `${JSON.stringify(
    toStableJsonValue(customizationFixtureSchema.parse(fixture)),
    null,
    2
  )}\n`;

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
  const snapshotIssues = reviewCustomizationFixtureMetadataSnapshot(
    fixture,
    metadata,
    mode
  );
  const issues = [...validation.issues, ...snapshotIssues];

  return {
    customization: fixture.customization,
    issues,
    mode,
    publishable:
      mode === "strict" && issues.every((issue) => issue.severity !== "error"),
    requiresReview: mode === "draft-with-warnings" || issues.length > 0,
    valid: issues.every((issue) => issue.severity !== "error"),
  };
};
