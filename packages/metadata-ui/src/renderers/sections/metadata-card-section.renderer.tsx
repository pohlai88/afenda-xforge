import { Card, CardContent } from "@repo/ui";
import type { ReactElement, ReactNode } from "react";
import { MetadataToolbar } from "../../components/metadata-toolbar";
import type { MetadataSectionRendererProps } from "../../contracts/section-renderer.contract";
import {
  resolveDensitySurfaceProps,
  resolveDensityVisualDefinition,
} from "../../visualization/density-visual-contract";

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

const statToneClassNames: Record<string, string> = {
  danger: "text-destructive",
  info: "text-sky-700 dark:text-sky-300",
  primary: "text-primary",
  success: "text-emerald-700 dark:text-emerald-300",
  warning: "text-amber-700 dark:text-amber-300",
};

const renderStatSectionContent = (
  section: MetadataSectionRendererProps["section"]
): ReactNode => {
  const value = section.metadataAttributes?.value;

  if (value === undefined || value === null) {
    return null;
  }

  const tone =
    typeof section.metadataAttributes?.tone === "string"
      ? section.metadataAttributes.tone
      : "primary";

  return (
    <p
      className={cn(
        "font-semibold text-3xl tracking-tight",
        statToneClassNames[tone] ?? statToneClassNames.primary
      )}
    >
      {String(value)}
    </p>
  );
};

export function MetadataCardSectionRenderer({
  children,
  section,
  context,
}: MetadataSectionRendererProps): ReactElement {
  const densityVisual = resolveDensityVisualDefinition(context.density);
  const sectionContent =
    children ??
    (section.kind === "stat" ? renderStatSectionContent(section) : null);

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
        {sectionContent}
      </CardContent>
    </Card>
  );
}
