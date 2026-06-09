import { Card, CardContent } from "@repo/ui";
import type { ReactElement } from "react";
import { MetadataToolbar } from "../../components/metadata-toolbar";
import type { MetadataSectionRendererProps } from "../../contracts/section-renderer.contract";

export function MetadataCardSectionRenderer({
  children,
  section,
  context,
}: MetadataSectionRendererProps): ReactElement {
  return (
    <Card className="overflow-hidden border-border bg-card/95 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <MetadataToolbar
          actions={section.actions}
          context={context}
          description={section.description}
          title={section.title}
        />
        {children}
      </CardContent>
    </Card>
  );
}
