import { Card, CardContent } from "@repo/ui";
import type { ReactElement } from "react";
import { MetadataToolbar } from "../../components/metadata-toolbar";
import type { MetadataSectionRendererProps } from "../../contracts/section-renderer.contract";
import {
  resolveDensitySurfaceProps,
  resolveDensityVisualDefinition,
} from "../../visualization/density-visual-contract";

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

export function MetadataCardSectionRenderer({
  children,
  section,
  context,
}: MetadataSectionRendererProps): ReactElement {
  const densityVisual = resolveDensityVisualDefinition(context.density);

  return (
    <Card className="overflow-hidden border-border bg-card/95 shadow-sm">
      <CardContent
        className={cn(densityVisual.cardPadding, densityVisual.sectionSpacing)}
        {...resolveDensitySurfaceProps(context.density)}
      >
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
