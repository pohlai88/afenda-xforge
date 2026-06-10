import type { ReactElement } from "react";

import type { MetadataRenderContext } from "../contracts/render-context.contract";
import type {
  MetadataSectionCompleteness,
  MetadataSectionContract,
} from "../contracts/section-renderer.contract";
import { resolveMetadataLabel } from "../localization/resolve-metadata-label";
import { DegradedState } from "../renderers/states/degraded-state.renderer";
import { PartialState } from "../renderers/states/partial-state.renderer";

export function resolveSectionCompleteness(
  section: MetadataSectionContract,
  context: MetadataRenderContext
): MetadataSectionCompleteness {
  if (section.completeness && section.completeness !== "full") {
    return section.completeness;
  }

  if (context.state === "partial" || context.state === "degraded") {
    return context.state;
  }

  return "full";
}

export function resolveSectionTitle(
  section: MetadataSectionContract,
  context: MetadataRenderContext
): string {
  return resolveMetadataLabel(context, {
    label: section.title,
    labelKey: section.labelKey,
    labels: section.labels,
  });
}

export function wrapSectionCompleteness(
  completeness: MetadataSectionCompleteness,
  title: string,
  description: string | undefined,
  content: ReactElement | null
): ReactElement | null {
  if (completeness === "partial") {
    return (
      <PartialState description={description} title={title}>
        {content}
      </PartialState>
    );
  }

  if (completeness === "degraded") {
    return (
      <DegradedState description={description} title={title}>
        {content}
      </DegradedState>
    );
  }

  return content;
}
