import type { CustomizationContract } from "@repo/customization/contracts";
import type {
  CustomizationLayerSet,
  LayeredCustomizationResolutionOptions,
} from "@repo/customization/resolution";
import {
  resolveCustomizedEntityMetadata,
  resolveLayeredCustomizedEntityMetadata,
} from "@repo/customization/resolution";
import type { EntityMetadata } from "@repo/metadata";

export type MetadataCustomizationInput = {
  customization?: CustomizationContract | null;
  customizationLayers?: CustomizationLayerSet | null;
  customizationOptions?: LayeredCustomizationResolutionOptions;
};

export function resolveMetadataEntityCustomization(
  metadata: EntityMetadata,
  {
    customization,
    customizationLayers,
    customizationOptions,
  }: MetadataCustomizationInput = {}
): EntityMetadata {
  if (customizationLayers) {
    return resolveLayeredCustomizedEntityMetadata(
      metadata,
      customizationLayers,
      customizationOptions
    );
  }

  return resolveCustomizedEntityMetadata(metadata, customization);
}

export function hasMetadataCustomizationInput(
  input: MetadataCustomizationInput = {}
): boolean {
  return Boolean(input.customization ?? input.customizationLayers);
}
