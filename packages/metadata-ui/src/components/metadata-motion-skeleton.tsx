import { Skeleton } from "@repo/ui";
import type { ComponentProps, ReactElement } from "react";

import {
  METADATA_PULSE_MOTION_CLASS,
  resolveMetadataMotionClassName,
} from "../interaction/motion-visual-contract";

export type MetadataMotionSkeletonProps = ComponentProps<typeof Skeleton>;

export function MetadataMotionSkeleton({
  className,
  ...props
}: MetadataMotionSkeletonProps): ReactElement {
  return (
    <Skeleton
      className={resolveMetadataMotionClassName(
        METADATA_PULSE_MOTION_CLASS,
        className
      )}
      {...props}
    />
  );
}
