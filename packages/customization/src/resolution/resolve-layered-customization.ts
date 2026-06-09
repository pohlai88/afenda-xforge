import type { EntityMetadata, MetadataFeatureContract } from "@repo/metadata";

import type {
  CustomizationContract,
  CustomizationResolutionResult,
} from "../contracts/customization.contract.ts";
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

const isPublishedCustomization = (
  customization: CustomizationContract | null | undefined,
  includeDraftsForPreview: boolean
): customization is CustomizationContract => {
  if (!customization) {
    return false;
  }

  if (includeDraftsForPreview) {
    return customization.status !== "archived";
  }

  return customization.status === "published";
};

const getApplicableCustomizations = (
  layers: CustomizationLayerSet,
  includeDraftsForPreview: boolean
): readonly CustomizationContract[] =>
  [layers.tenant, layers.company].filter((customization) =>
    isPublishedCustomization(customization, includeDraftsForPreview)
  );

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
  metadata: EntityMetadata | MetadataFeatureContract,
  layers: CustomizationLayerSet,
  options: LayeredCustomizationResolutionOptions,
  includeDraftsForPreview: boolean
) =>
  getApplicableCustomizations(layers, includeDraftsForPreview).flatMap(
    (customization) =>
      validateCustomizationAgainstMetadata(customization, metadata, options)
        .issues
  );

export const resolveLayeredCustomizedMetadata = (
  metadata: MetadataFeatureContract,
  layers: CustomizationLayerSet,
  options: LayeredCustomizationResolutionOptions = {}
): MetadataFeatureContract => {
  assertLayering(layers);

  return getApplicableCustomizations(
    layers,
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
  assertLayering(layers);

  return getApplicableCustomizations(
    layers,
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
  assertLayering(layers);
  return getApplicableCustomizations(layers, false);
};

export const resolvePreviewCustomizationLayers = (
  layers: CustomizationLayerSet
): readonly CustomizationContract[] => {
  assertLayering(layers);
  return getApplicableCustomizations(layers, true);
};

export const resolvePublishedCustomizedMetadataResult = (
  metadata: MetadataFeatureContract,
  layers: CustomizationLayerSet,
  options: LayeredCustomizationResolutionOptions = {}
): CustomizationResolutionResult<MetadataFeatureContract> => {
  assertLayering(layers);

  const diagnostics = getLayerValidationIssues(
    metadata,
    layers,
    options,
    false
  );

  if (diagnostics.some((issue) => issue.severity === "error")) {
    return {
      appliedCustomizations: [],
      diagnostics,
      metadata,
      status: "base_fallback",
    };
  }

  return {
    appliedCustomizations: resolvePublishedCustomizationLayers(layers),
    diagnostics,
    metadata: resolveLayeredCustomizedMetadata(metadata, layers, options),
    status: "resolved",
  };
};

export const resolvePublishedCustomizedEntityMetadataResult = (
  metadata: EntityMetadata,
  layers: CustomizationLayerSet,
  options: LayeredCustomizationResolutionOptions = {}
): CustomizationResolutionResult<EntityMetadata> => {
  assertLayering(layers);

  const diagnostics = getLayerValidationIssues(
    metadata,
    layers,
    options,
    false
  );

  if (diagnostics.some((issue) => issue.severity === "error")) {
    return {
      appliedCustomizations: [],
      diagnostics,
      metadata,
      status: "base_fallback",
    };
  }

  return {
    appliedCustomizations: resolvePublishedCustomizationLayers(layers),
    diagnostics,
    metadata: resolveLayeredCustomizedEntityMetadata(metadata, layers, options),
    status: "resolved",
  };
};

export const resolvePreviewCustomizedMetadataResult = (
  metadata: MetadataFeatureContract,
  layers: CustomizationLayerSet,
  options: LayeredCustomizationResolutionOptions = {}
): CustomizationResolutionResult<MetadataFeatureContract> => {
  assertLayering(layers);

  const previewOptions = {
    ...options,
    includeDraftsForPreview: true,
    validationMode: options.validationMode ?? "preview",
  } satisfies LayeredCustomizationResolutionOptions;
  const diagnostics = getLayerValidationIssues(
    metadata,
    layers,
    previewOptions,
    true
  );

  if (diagnostics.some((issue) => issue.severity === "error")) {
    return {
      appliedCustomizations: [],
      diagnostics,
      metadata,
      status: "base_fallback",
    };
  }

  return {
    appliedCustomizations: resolvePreviewCustomizationLayers(layers),
    diagnostics,
    metadata: resolveLayeredCustomizedMetadata(
      metadata,
      layers,
      previewOptions
    ),
    status: "resolved",
  };
};

export const resolvePreviewCustomizedEntityMetadataResult = (
  metadata: EntityMetadata,
  layers: CustomizationLayerSet,
  options: LayeredCustomizationResolutionOptions = {}
): CustomizationResolutionResult<EntityMetadata> => {
  assertLayering(layers);

  const previewOptions = {
    ...options,
    includeDraftsForPreview: true,
    validationMode: options.validationMode ?? "preview",
  } satisfies LayeredCustomizationResolutionOptions;
  const diagnostics = getLayerValidationIssues(
    metadata,
    layers,
    previewOptions,
    true
  );

  if (diagnostics.some((issue) => issue.severity === "error")) {
    return {
      appliedCustomizations: [],
      diagnostics,
      metadata,
      status: "base_fallback",
    };
  }

  return {
    appliedCustomizations: resolvePreviewCustomizationLayers(layers),
    diagnostics,
    metadata: resolveLayeredCustomizedEntityMetadata(
      metadata,
      layers,
      previewOptions
    ),
    status: "resolved",
  };
};
