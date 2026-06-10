import type { ReactElement, ReactNode } from "react";

import { MetadataMotionSkeleton } from "../../components/metadata-motion-skeleton";
import type { MetadataStateRenderer } from "../../contracts/state-renderer.contract";
import { MetadataStateShell } from "./metadata-state-shell";

type LoadingStateProps = {
  children?: ReactNode;
  description?: string;
  title?: string;
};

export function LoadingState({
  children,
  description,
  title,
}: LoadingStateProps): ReactElement {
  return (
    <MetadataStateShell
      description={description}
      stateKind="loading"
      title={title}
    >
      {children ?? (
        <div className="grid gap-2">
          <MetadataMotionSkeleton className="h-4 w-2/3" />
          <MetadataMotionSkeleton className="h-4 w-full" />
          <MetadataMotionSkeleton className="h-4 w-5/6" />
        </div>
      )}
    </MetadataStateShell>
  );
}

export const LoadingStateRenderer: MetadataStateRenderer = ({
  children,
  loadingDescription,
  loadingTitle,
}) => (
  <LoadingState description={loadingDescription} title={loadingTitle}>
    {children}
  </LoadingState>
);
