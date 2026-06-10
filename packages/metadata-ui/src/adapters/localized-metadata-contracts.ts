import type { MetadataActionContract } from "../contracts/action-renderer.contract";
import type { MetadataFieldContract } from "../contracts/field-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import type {
  MetadataSectionContract,
  MetadataSectionMetadata,
  MetadataSectionRow,
} from "../contracts/section-renderer.contract";
import { resolveMetadataLabel } from "../localization/resolve-metadata-label";

export function withLocalizedFieldLabel(
  field: MetadataFieldContract,
  context: MetadataRenderContext
): MetadataFieldContract {
  return {
    ...field,
    label: resolveMetadataLabel(context, {
      label: field.label,
      labelKey: field.labelKey,
      labels: field.labels,
    }),
  };
}

export function withLocalizedActionLabel(
  action: MetadataActionContract,
  context: MetadataRenderContext
): MetadataActionContract {
  return {
    ...action,
    label: resolveMetadataLabel(context, {
      label: action.label,
      labelKey: action.labelKey,
      labels: action.labels,
    }),
  };
}

export function withLocalizedSectionTitle<
  TMetadata = MetadataSectionMetadata,
  TRow extends MetadataSectionRow = MetadataSectionRow,
>(
  section: MetadataSectionContract<TMetadata, TRow>,
  context: MetadataRenderContext
): MetadataSectionContract<TMetadata, TRow> {
  return {
    ...section,
    title: resolveMetadataLabel(context, {
      label: section.title,
      labelKey: section.labelKey,
      labels: section.labels,
    }),
  };
}
