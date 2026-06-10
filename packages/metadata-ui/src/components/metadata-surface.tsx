import type { ReactElement } from "react";

import type { MetadataSurfaceRendererProps } from "../contracts/surface.contract";
import {
  resolveSurfaceKindProps,
  resolveSurfaceVisualDefinition,
} from "../visualization/surface-visual-contract";
import { MetadataSurfaceRegion } from "./metadata-surface-region";
import { MetadataToolbar } from "./metadata-toolbar";

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

export function MetadataSurface({
  children,
  context,
  surface,
}: MetadataSurfaceRendererProps): ReactElement {
  const definition = resolveSurfaceVisualDefinition(surface.kind);

  return (
    <div
      className={cn(definition.shellClass, "space-y-4")}
      {...resolveSurfaceKindProps(surface.kind)}
    >
      {surface.title || surface.description ? (
        <MetadataToolbar
          context={context}
          description={surface.description}
          surfaceKind={surface.kind}
          title={surface.title}
        />
      ) : null}

      <MetadataSurfaceRegion kind={surface.kind} region="primary">
        {children}
      </MetadataSurfaceRegion>
    </div>
  );
}
