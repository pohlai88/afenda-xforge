import type { MetadataRenderContext } from "../contracts/render-context.contract";

export type MetadataLocalizedLabels = Readonly<Partial<Record<string, string>>>;

export type MetadataLabelSource = {
  label: string;
  labelKey?: string;
  labels?: MetadataLocalizedLabels;
};

export function resolveMetadataLabel(
  context: MetadataRenderContext,
  source: MetadataLabelSource
): string {
  if (source.labelKey) {
    const catalogLabel = context.labelCatalog?.[source.labelKey];

    if (catalogLabel) {
      return catalogLabel;
    }
  }

  const localeLabel = source.labels?.[context.locale];

  if (localeLabel) {
    return localeLabel;
  }

  const fallbackLocaleLabel = source.labels?.en;

  if (fallbackLocaleLabel) {
    return fallbackLocaleLabel;
  }

  return source.label;
}
