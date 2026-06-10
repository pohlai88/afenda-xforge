import type { ReactElement } from "react";
import { MetadataSurfaceRegion } from "../../components/metadata-surface-region";
import { MetadataToolbar } from "../../components/metadata-toolbar";
import type { MetadataSectionRendererProps } from "../../contracts/section-renderer.contract";
import {
  resolveDensitySurfaceProps,
  resolveDensityVisualDefinition,
} from "../../visualization/density-visual-contract";
import {
  resolveSectionSurfaceKind,
  resolveSurfaceKindProps,
  resolveSurfaceShellClassName,
} from "../../visualization/surface-visual-contract";

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

const resolvePrimaryRegion = (
  surfaceKind: NonNullable<ReturnType<typeof resolveSectionSurfaceKind>>
):
  | "activity-feed"
  | "field-groups"
  | "kpi-cards"
  | "metadata-sections"
  | "step-content" => {
  switch (surfaceKind) {
    case "dashboard":
      return "kpi-cards";
    case "form":
      return "field-groups";
    case "workflow":
      return "step-content";
    default:
      return "metadata-sections";
  }
};

export function MetadataSectionRenderer({
  children,
  section,
  context,
}: MetadataSectionRendererProps): ReactElement {
  const densityVisual = resolveDensityVisualDefinition(context.density);
  const surfaceKind = resolveSectionSurfaceKind(section.kind) ?? "detail";
  const primaryRegion = resolvePrimaryRegion(surfaceKind);

  return (
    <section
      className={cn(
        densityVisual.sectionSpacing,
        resolveSurfaceShellClassName(surfaceKind)
      )}
      {...resolveDensitySurfaceProps(context.density)}
      {...resolveSurfaceKindProps(surfaceKind)}
    >
      <MetadataToolbar
        actions={section.actions}
        context={context}
        description={section.description}
        surfaceKind={surfaceKind}
        title={section.title}
      />
      <MetadataSurfaceRegion kind={surfaceKind} region="primary">
        <MetadataSurfaceRegion kind={surfaceKind} region={primaryRegion}>
          {children}
        </MetadataSurfaceRegion>
      </MetadataSurfaceRegion>
    </section>
  );
}
