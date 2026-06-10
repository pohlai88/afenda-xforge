import type { EntityMetadata, MetadataFeatureContract } from "@repo/metadata";

import type {
  CustomizationContract,
  CustomizationResolutionResult,
  CustomizationValidationIssue,
} from "../contracts/customization.contract.ts";
import { assertCustomizationContract } from "../validation/assert-customization-contract.ts";
import type { CustomizationMetadataValidationOptions } from "../validation/validate-customization-against-metadata.ts";
import {
  assertCustomizationMatchesMetadata,
  validateCustomizationAgainstMetadata,
} from "../validation/validate-customization-against-metadata.ts";
import {
  resolveCustomizedEntityMetadata,
  resolveCustomizedMetadata,
} from "./resolve-customized-metadata.ts";

export type CustomizationLayerSet = {
  company?: CustomizationContract | null;
  tenant?: CustomizationContract | null;
};

export type LayeredCustomizationResolutionOptions =
  CustomizationMetadataValidationOptions & {
    includeDraftsForPreview?: boolean;
  };

type CustomizableMetadata = EntityMetadata | MetadataFeatureContract;

const isPublishedCustomization = (
  customization: CustomizationContract | null | undefined,
  includeDraftsForPreview: boolean
): customization is CustomizationContract => {
  if (!customization) {
    return false;
  }

  if (includeDraftsForPreview) {
    return (
      customization.status === "draft" || customization.status === "published"
    );
  }

  return customization.status === "published";
};

const normalizeLayerCustomization = (
  customization: CustomizationContract | null | undefined
): CustomizationContract | null | undefined => {
  if (!customization) {
    return customization;
  }

  return assertCustomizationContract(customization);
};

const normalizeLayerSet = (
  layers: CustomizationLayerSet
): CustomizationLayerSet => ({
  company: normalizeLayerCustomization(layers.company),
  tenant: normalizeLayerCustomization(layers.tenant),
});

const getApplicableCustomizations = (
  layers: CustomizationLayerSet,
  includeDraftsForPreview: boolean
): readonly CustomizationContract[] =>
  [layers.tenant, layers.company].filter((customization) =>
    isPublishedCustomization(customization, includeDraftsForPreview)
  );

const toInvalidContractIssue = (
  error: unknown
): CustomizationValidationIssue => ({
  code: "customization.invalid_contract",
  hint: "Reload or repair the persisted customization before using it at runtime.",
  message:
    error instanceof Error
      ? error.message
      : "customization contract validation failed",
  path: [],
  severity: "error",
});

const assertLayerScope = (
  layerName: "company" | "tenant",
  customization: CustomizationContract
): void => {
  if (customization.scope !== layerName) {
    throw new Error(
      `${layerName} customization layer received ${customization.scope} scoped customization.`
    );
  }
};

const assertTenantAlignment = (
  previous: CustomizationContract | undefined,
  current: CustomizationContract
): void => {
  if (previous && previous.tenantId !== current.tenantId) {
    throw new Error("Customization layers must target the same tenant.");
  }
};

const assertLayering = (layers: CustomizationLayerSet): void => {
  if (layers.tenant) {
    assertLayerScope("tenant", layers.tenant);
  }

  if (layers.company) {
    assertLayerScope("company", layers.company);
    assertTenantAlignment(layers.tenant ?? undefined, layers.company);
  }
};

const getLayerValidationIssues = (
  metadata: CustomizableMetadata,
  layers: CustomizationLayerSet,
  options: LayeredCustomizationResolutionOptions,
  includeDraftsForPreview: boolean
) =>
  getApplicableCustomizations(layers, includeDraftsForPreview).flatMap(
    (customization) =>
      validateCustomizationAgainstMetadata(customization, metadata, options)
        .issues
  );

const resolveNormalizedLayers = (
  layers: CustomizationLayerSet
): CustomizationLayerSet => {
  const normalizedLayers = normalizeLayerSet(layers);
  assertLayering(normalizedLayers);
  return normalizedLayers;
};

const createBaseFallbackResult = <TMetadata extends CustomizableMetadata>(
  metadata: TMetadata,
  diagnostics: readonly CustomizationValidationIssue[]
): CustomizationResolutionResult<TMetadata> => ({
  appliedCustomizations: [],
  diagnostics,
  metadata,
  status: "base_fallback",
});

type ResolveLayeredResultInput<TMetadata extends CustomizableMetadata> = {
  layers: CustomizationLayerSet;
  getAppliedCustomizations: (
    layers: CustomizationLayerSet
  ) => readonly CustomizationContract[];
  includeDraftsForPreview: boolean;
  metadata: TMetadata;
  options: LayeredCustomizationResolutionOptions;
  resolveMetadata: (
    metadata: TMetadata,
    layers: CustomizationLayerSet,
    options: LayeredCustomizationResolutionOptions
  ) => TMetadata;
};

const resolveLayeredCustomizationResult = <
  TMetadata extends CustomizableMetadata,
>({
  layers,
  getAppliedCustomizations,
  includeDraftsForPreview,
  metadata,
  options,
  resolveMetadata,
}: ResolveLayeredResultInput<TMetadata>): CustomizationResolutionResult<TMetadata> => {
  let normalizedLayers: CustomizationLayerSet;

  try {
    normalizedLayers = resolveNormalizedLayers(layers);
  } catch (error) {
    return createBaseFallbackResult(metadata, [toInvalidContractIssue(error)]);
  }

  const diagnostics = getLayerValidationIssues(
    metadata,
    normalizedLayers,
    options,
    includeDraftsForPreview
  );

  if (diagnostics.some((issue) => issue.severity === "error")) {
    return createBaseFallbackResult(metadata, diagnostics);
  }

  return {
    appliedCustomizations: getAppliedCustomizations(normalizedLayers),
    diagnostics,
    metadata: resolveMetadata(metadata, normalizedLayers, options),
    status: "resolved",
  };
};

export const resolveLayeredCustomizedMetadata = (
  metadata: MetadataFeatureContract,
  layers: CustomizationLayerSet,
  options: LayeredCustomizationResolutionOptions = {}
): MetadataFeatureContract => {
  const normalizedLayers = normalizeLayerSet(layers);
  assertLayering(normalizedLayers);

  return getApplicableCustomizations(
    normalizedLayers,
    options.includeDraftsForPreview ?? false
  ).reduce((resolved, customization) => {
    assertCustomizationMatchesMetadata(customization, metadata, options);
    return resolveCustomizedMetadata(resolved, customization, {
      ...options,
      validate: false,
    });
  }, metadata);
};

export const resolveLayeredCustomizedEntityMetadata = (
  metadata: EntityMetadata,
  layers: CustomizationLayerSet,
  options: LayeredCustomizationResolutionOptions = {}
): EntityMetadata => {
  const normalizedLayers = normalizeLayerSet(layers);
  assertLayering(normalizedLayers);

  return getApplicableCustomizations(
    normalizedLayers,
    options.includeDraftsForPreview ?? false
  ).reduce((resolved, customization) => {
    assertCustomizationMatchesMetadata(customization, metadata, options);
    return resolveCustomizedEntityMetadata(resolved, customization, {
      ...options,
      validate: false,
    });
  }, metadata);
};

export const resolvePublishedCustomizationLayers = (
  layers: CustomizationLayerSet
): readonly CustomizationContract[] => {
  const normalizedLayers = normalizeLayerSet(layers);
  assertLayering(normalizedLayers);
  return getApplicableCustomizations(normalizedLayers, false);
};

export const resolvePreviewCustomizationLayers = (
  layers: CustomizationLayerSet
): readonly CustomizationContract[] => {
  const normalizedLayers = normalizeLayerSet(layers);
  assertLayering(normalizedLayers);
  return getApplicableCustomizations(normalizedLayers, true);
};

export const resolvePublishedCustomizedMetadataResult = (
  metadata: MetadataFeatureContract,
  layers: CustomizationLayerSet,
  options: LayeredCustomizationResolutionOptions = {}
): CustomizationResolutionResult<MetadataFeatureContract> =>
  resolveLayeredCustomizationResult({
    getAppliedCustomizations: resolvePublishedCustomizationLayers,
    includeDraftsForPreview: false,
    layers,
    metadata,
    options,
    resolveMetadata: resolveLayeredCustomizedMetadata,
  });

export const resolvePublishedCustomizedEntityMetadataResult = (
  metadata: EntityMetadata,
  layers: CustomizationLayerSet,
  options: LayeredCustomizationResolutionOptions = {}
): CustomizationResolutionResult<EntityMetadata> =>
  resolveLayeredCustomizationResult({
    getAppliedCustomizations: resolvePublishedCustomizationLayers,
    includeDraftsForPreview: false,
    layers,
    metadata,
    options,
    resolveMetadata: resolveLayeredCustomizedEntityMetadata,
  });

export const resolvePreviewCustomizedMetadataResult = (
  metadata: MetadataFeatureContract,
  layers: CustomizationLayerSet,
  options: LayeredCustomizationResolutionOptions = {}
): CustomizationResolutionResult<MetadataFeatureContract> => {
  const previewOptions = {
    ...options,
    includeDraftsForPreview: true,
    validationMode: options.validationMode ?? "preview",
  } satisfies LayeredCustomizationResolutionOptions;

  return resolveLayeredCustomizationResult({
    getAppliedCustomizations: resolvePreviewCustomizationLayers,
    includeDraftsForPreview: true,
    layers,
    metadata,
    options: previewOptions,
    resolveMetadata: resolveLayeredCustomizedMetadata,
  });
};

export const resolvePreviewCustomizedEntityMetadataResult = (
  metadata: EntityMetadata,
  layers: CustomizationLayerSet,
  options: LayeredCustomizationResolutionOptions = {}
): CustomizationResolutionResult<EntityMetadata> => {
  const previewOptions = {
    ...options,
    includeDraftsForPreview: true,
    validationMode: options.validationMode ?? "preview",
  } satisfies LayeredCustomizationResolutionOptions;

  return resolveLayeredCustomizationResult({
    getAppliedCustomizations: resolvePreviewCustomizationLayers,
    includeDraftsForPreview: true,
    layers,
    metadata,
    options: previewOptions,
    resolveMetadata: resolveLayeredCustomizedEntityMetadata,
  });
};
