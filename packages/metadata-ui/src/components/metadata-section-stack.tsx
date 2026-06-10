import type { EntityMetadata } from "@repo/metadata";
import type { DashboardTableRow } from "@repo/ui";
import type { ReactElement } from "react";

import { renderMetadataSection } from "../adapters";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { createMetadataRenderContext } from "../contracts/render-context.defaults";
import type {
  MetadataSectionContract,
  MetadataSectionMetadata,
  MetadataSectionRow,
} from "../contracts/section-renderer.contract";
import type { MetadataCustomizationInput } from "../customization";
import { resolveMetadataEntityCustomization } from "../customization";
import {
  resolveDensitySurfaceProps,
  resolveDensityVisualDefinition,
} from "../visualization/density-visual-contract";
import {
  resolveSurfaceKindProps,
  resolveSurfaceShellClassName,
} from "../visualization/surface-visual-contract";
import { composeMetadataWithDiagnostics } from "./compose-metadata-with-diagnostics";

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

export type MetadataRenderableSection = MetadataSectionContract<
  EntityMetadata,
  DashboardTableRow
>;

export type MetadataSectionContentResolver<
  TMetadata = MetadataSectionMetadata,
  TRow extends MetadataSectionRow = MetadataSectionRow,
> = (input: {
  context: MetadataRenderContext;
  section: MetadataSectionContract<TMetadata, TRow>;
}) => ReactElement | null | undefined;

export type MetadataSectionStackProps<
  TMetadata extends MetadataSectionMetadata = EntityMetadata,
  TRow extends MetadataSectionRow = DashboardTableRow,
> = MetadataCustomizationInput & {
  context?: Partial<MetadataRenderContext>;
  entityMetadata?: EntityMetadata;
  resolveSectionContent?: MetadataSectionContentResolver<TMetadata, TRow>;
  sections: readonly MetadataSectionContract<TMetadata, TRow>[];
};

export function MetadataSectionStack<
  TMetadata extends MetadataSectionMetadata = EntityMetadata,
  TRow extends MetadataSectionRow = DashboardTableRow,
>({
  context,
  customization,
  customizationLayers,
  customizationOptions,
  entityMetadata,
  resolveSectionContent,
  sections,
}: MetadataSectionStackProps<TMetadata, TRow>): ReactElement {
  const resolvedEntityMetadata = entityMetadata
    ? resolveMetadataEntityCustomization(entityMetadata, {
        customization,
        customizationLayers,
        customizationOptions,
      })
    : undefined;
  const resolvedSections =
    sections.length > 0
      ? sections
      : ((resolvedEntityMetadata?.sections as
          | readonly MetadataSectionContract<TMetadata, TRow>[]
          | undefined) ?? sections);
  const resolvedContext = createMetadataRenderContext(context, {
    mode: "read",
  });
  const densityVisual = resolveDensityVisualDefinition(resolvedContext.density);
  const sectionResults = resolvedSections.map((section) =>
    renderMetadataSection({
      children: resolveSectionContent?.({
        context: resolvedContext,
        section,
      }),
      context: resolvedContext,
      section: section as MetadataSectionContract,
    })
  );
  const diagnostics = sectionResults.flatMap((result) => result.diagnostics);

  return composeMetadataWithDiagnostics(
    resolvedContext,
    <div
      className={cn(
        densityVisual.stackSpacing,
        resolveSurfaceShellClassName("detail")
      )}
      {...resolveDensitySurfaceProps(resolvedContext.density)}
      {...resolveSurfaceKindProps("detail")}
    >
      {resolvedSections.map((section, index) => (
        <div key={section.key}>{sectionResults[index]?.element}</div>
      ))}
    </div>,
    diagnostics
  );
}
