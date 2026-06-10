import type { ReactElement, ReactNode } from "react";
import { MetadataSurfaceRegion } from "../../components/metadata-surface-region";
import type { MetadataLayoutContract } from "../../contracts/layout.contract";
import type { MetadataRenderContext } from "../../contracts/render-context.contract";
import { resolveMetadataLabel } from "../../localization/resolve-metadata-label";
import {
  resolveDensitySurfaceProps,
  resolveDensityVisualDefinition,
} from "../../visualization/density-visual-contract";
import {
  resolveSurfaceKindProps,
  resolveSurfaceShellClassName,
} from "../../visualization/surface-visual-contract";

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

type MetadataStackLayoutRendererProps = {
  children?: ReactNode;
  context: MetadataRenderContext;
  layout: MetadataLayoutContract;
};

export function MetadataStackLayoutRenderer({
  children,
  context,
  layout,
}: MetadataStackLayoutRendererProps): ReactElement {
  const densityVisual = resolveDensityVisualDefinition(
    layout.density ?? context.density
  );
  const title = layout.title
    ? resolveMetadataLabel(context, {
        label: layout.title,
      })
    : undefined;

  return (
    <div
      className={cn(
        densityVisual.stackSpacing,
        resolveSurfaceShellClassName("detail")
      )}
      {...resolveDensitySurfaceProps(layout.density ?? context.density)}
      {...resolveSurfaceKindProps("detail")}
    >
      {title ? (
        <MetadataSurfaceRegion kind="detail" region="title">
          <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
          {layout.description ? (
            <p className="text-muted-foreground text-sm">
              {layout.description}
            </p>
          ) : null}
        </MetadataSurfaceRegion>
      ) : null}
      <MetadataSurfaceRegion kind="detail" region="primary">
        {children}
      </MetadataSurfaceRegion>
    </div>
  );
}
