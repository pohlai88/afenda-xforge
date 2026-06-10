import type { ElementType, ReactElement, ReactNode } from "react";

import type { MetadataSurfaceKind } from "../contracts/surface.contract";
import type {
  MetadataSurfaceHierarchySlot,
  MetadataSurfaceRegionSlot,
} from "../visualization/surface-visual-contract";
import { resolveSurfaceRegionProps } from "../visualization/surface-visual-contract";

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

export type MetadataSurfaceRegionProps = {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
  kind: MetadataSurfaceKind;
  region: MetadataSurfaceHierarchySlot | MetadataSurfaceRegionSlot;
};

export function MetadataSurfaceRegion({
  as: Component = "div",
  children,
  className,
  kind,
  region,
}: MetadataSurfaceRegionProps): ReactElement {
  return (
    <Component
      className={cn(className)}
      {...resolveSurfaceRegionProps(kind, region)}
    >
      {children}
    </Component>
  );
}
