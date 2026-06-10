import type { ReactElement } from "react";
import { MetadataToolbar } from "../../components/metadata-toolbar";
import type { MetadataSectionRendererProps } from "../../contracts/section-renderer.contract";
import {
  resolveDensitySurfaceProps,
  resolveDensityVisualDefinition,
} from "../../visualization/density-visual-contract";

export function MetadataSectionRenderer({
  children,
  section,
  context,
}: MetadataSectionRendererProps): ReactElement {
  const densityVisual = resolveDensityVisualDefinition(context.density);

  return (
    <section
      className={densityVisual.sectionSpacing}
      {...resolveDensitySurfaceProps(context.density)}
    >
      <MetadataToolbar
        actions={section.actions}
        context={context}
        description={section.description}
        title={section.title}
      />
      {children}
    </section>
  );
}
