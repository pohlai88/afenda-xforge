import type { EntityMetadata, MetadataFeatureContract } from "@repo/metadata";

import type { CustomizationContract } from "../contracts/customization.contract.ts";
import { assertCustomizationMatchesMetadata } from "../validation/validate-customization-against-metadata.ts";
import {
  resolveCustomizedEntityMetadata,
  resolveCustomizedMetadata,
} from "./resolve-customized-metadata.ts";

export type CustomizationLayerSet = {
  company?: CustomizationContract | null;
  tenant?: CustomizationContract | null;
};

export type LayeredCustomizationResolutionOptions = {
  companyAware?: boolean;
  includeDraftsForPreview?: boolean;
  metadataFingerprint?: string;
  safeActionKeys?: readonly string[];
  systemFieldKeys?: readonly string[];
};

const isPublishedCustomization = (
  customization: CustomizationContract | null | undefined,
  includeDraftsForPreview: boolean
): customization is CustomizationContract => {
  if (!customization) {
    return false;
  }

  if (includeDraftsForPreview) {
    return true;
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
