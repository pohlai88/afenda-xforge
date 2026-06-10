import type { ReactElement } from "react";

import { MetadataMotionSkeleton } from "../../components/metadata-motion-skeleton";

export const TABLE_LOADING_SKELETON_KEYS = [
  "metadata-table-skeleton-1",
  "metadata-table-skeleton-2",
  "metadata-table-skeleton-3",
  "metadata-table-skeleton-4",
  "metadata-table-skeleton-5",
] as const;

type MetadataTableLoadingSkeletonProps = {
  rowCount?: number;
};

export function MetadataTableLoadingSkeleton({
  rowCount = TABLE_LOADING_SKELETON_KEYS.length,
}: MetadataTableLoadingSkeletonProps): ReactElement {
  return (
    <div className="grid gap-3">
      {TABLE_LOADING_SKELETON_KEYS.slice(0, rowCount).map((key) => (
        <MetadataMotionSkeleton className="h-10 w-full" key={key} />
      ))}
    </div>
  );
}
