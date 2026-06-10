import { Skeleton } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataStateRenderer } from "../../contracts/state-renderer.contract";
import { MetadataStateShell } from "./metadata-state-shell";

type LoadingStateProps = {
  description?: string;
  title?: string;
};

export function LoadingState({
  description,
  title,
}: LoadingStateProps): ReactElement {
  return (
    <MetadataStateShell
      description={description}
      stateKind="loading"
      title={title}
    >
      <div className="grid gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </MetadataStateShell>
  );
}

export const LoadingStateRenderer: MetadataStateRenderer = ({
  loadingDescription,
  loadingTitle,
}) => <LoadingState description={loadingDescription} title={loadingTitle} />;
