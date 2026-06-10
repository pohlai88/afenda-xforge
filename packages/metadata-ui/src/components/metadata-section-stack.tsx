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
import {
  resolveDensitySurfaceProps,
  resolveDensityVisualDefinition,
} from "../visualization/density-visual-contract";
import {
  resolveSurfaceKindProps,
  resolveSurfaceShellClassName,
} from "../visualization/surface-visual-contract";

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
> = {
  context?: Partial<MetadataRenderContext>;
  resolveSectionContent?: MetadataSectionContentResolver<TMetadata, TRow>;
  sections: readonly MetadataSectionContract<TMetadata, TRow>[];
};

export function MetadataSectionStack<
  TMetadata extends MetadataSectionMetadata = EntityMetadata,
  TRow extends MetadataSectionRow = DashboardTableRow,
>({
  context,
  resolveSectionContent,
  sections,
}: MetadataSectionStackProps<TMetadata, TRow>): ReactElement {
  const resolvedContext = createMetadataRenderContext(context, {
    mode: "read",
  });
  const densityVisual = resolveDensityVisualDefinition(resolvedContext.density);

  return (
    <div
      className={cn(
        densityVisual.stackSpacing,
        resolveSurfaceShellClassName("detail")
      )}
      {...resolveDensitySurfaceProps(resolvedContext.density)}
      {...resolveSurfaceKindProps("detail")}
    >
      {sections.map((section) => {
        const renderedSection = renderMetadataSection({
          children: resolveSectionContent?.({
            context: resolvedContext,
            section,
          }),
          context: resolvedContext,
          section: section as MetadataSectionContract,
        });

        return <div key={section.key}>{renderedSection.element}</div>;
      })}
    </div>
  );
}
