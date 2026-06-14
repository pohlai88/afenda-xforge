import type { MetadataRenderDensity } from "@repo/metadata-ui/contracts";
import { getAfendaDefaultLaneForFeature } from "@repo/design-system/contracts/afenda/catalogs";
import type {
  AfendaErpVisualLaneId,
  AfendaDensityRegistryMode,
} from "@repo/design-system/contracts/afenda/registries";
import {
  resolvePresentationMetadata,
  type AfendaPresentationMetadata,
  type AfendaResolvedPresentationBundle,
} from "@repo/design-system/presentation";

export type MetadataPresentationInput = {
  componentFamily?: AfendaPresentationMetadata["componentFamily"];
  density?: MetadataRenderDensity;
  featureId?: string;
  lane?: AfendaErpVisualLaneId;
  size?: AfendaPresentationMetadata["size"];
  tone?: AfendaPresentationMetadata["tone"];
  variant?: AfendaPresentationMetadata["variant"];
  variantFamily?: AfendaPresentationMetadata["variantFamily"];
};

export function resolveMetadataPresentation(
  input: MetadataPresentationInput
): AfendaResolvedPresentationBundle {
  const density = (input.density ?? "default") satisfies AfendaDensityRegistryMode;
  const lane =
    input.lane ??
    (input.featureId ? getAfendaDefaultLaneForFeature(input.featureId) : undefined);

  return resolvePresentationMetadata({
    componentFamily: input.componentFamily,
    density,
    lane,
    size: input.size,
    tone: input.tone,
    variant: input.variant,
    variantFamily: input.variantFamily,
  });
}

export type MetadataPresentationDomProps = {
  className?: string;
  style?: Record<string, string>;
} & Partial<Record<"data-density", "compact" | "comfortable">>;

export function presentationBundleToDomProps(
  bundle: AfendaResolvedPresentationBundle
): MetadataPresentationDomProps {
  const className =
    bundle.tailwindClasses.length > 0
      ? bundle.tailwindClasses.join(" ")
      : undefined;
  const style =
    Object.keys(bundle.cssVariables).length > 0
      ? (Object.fromEntries(
          Object.entries(bundle.cssVariables).map(([name, value]) => [
            name,
            value,
          ])
        ) as Record<string, string>)
      : undefined;
  const dataDensity = bundle.dataAttributes["data-density"] as
    | "compact"
    | "comfortable"
    | undefined;

  return {
    ...(dataDensity ? { "data-density": dataDensity } : {}),
    ...(className ? { className } : {}),
    ...(style ? { style } : {}),
  };
}

export function mergePresentationDomProps(
  ...bundles: readonly AfendaResolvedPresentationBundle[]
): MetadataPresentationDomProps {
  const dataAttributes: Record<string, string> = {};
  const cssVariables: Record<`--${string}`, string> = {};
  const tailwindClasses: string[] = [];

  for (const bundle of bundles) {
    Object.assign(dataAttributes, bundle.dataAttributes);
    Object.assign(cssVariables, bundle.cssVariables);
    tailwindClasses.push(...bundle.tailwindClasses);
  }

  return presentationBundleToDomProps({
    cssVariables,
    dataAttributes,
    tailwindClasses: [...new Set(tailwindClasses)],
    governanceReferences: [],
  });
}
