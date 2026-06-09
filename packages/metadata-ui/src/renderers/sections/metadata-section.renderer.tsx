import type { ReactElement } from "react";
import { MetadataToolbar } from "../../components/metadata-toolbar";
import type { MetadataSectionRendererProps } from "../../contracts/section-renderer.contract";

export function MetadataSectionRenderer({
  children,
  section,
  context,
}: MetadataSectionRendererProps): ReactElement {
  return (
    <section className="space-y-4">
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
