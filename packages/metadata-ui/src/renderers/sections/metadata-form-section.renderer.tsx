import type { ReactElement } from "react";
import { MetadataForm } from "../../components/metadata-form";
import type { MetadataSectionRendererProps } from "../../contracts/section-renderer.contract";
import { MetadataSectionRenderer } from "./metadata-section.renderer";

export function MetadataFormSectionRenderer({
  children,
  context,
  section,
}: MetadataSectionRendererProps): ReactElement {
  const content =
    children ??
    (section.fields ? (
      <MetadataForm
        actions={section.actions}
        context={context}
        description={section.description}
        fields={section.fields}
        title={section.title}
      />
    ) : null);

  return (
    <MetadataSectionRenderer context={context} section={section}>
      {content}
    </MetadataSectionRenderer>
  );
}
