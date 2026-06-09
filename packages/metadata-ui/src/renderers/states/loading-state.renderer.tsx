import { Skeleton } from "@repo/ui";
import type { ReactElement } from "react";
import { StatePanel } from "../../components/state-panel";

type LoadingStateProps = {
  description?: string;
  title?: string;
};

export function LoadingState({
  description = "Loading metadata-driven content.",
  title = "Loading",
}: LoadingStateProps): ReactElement {
  return (
    <StatePanel description={description} title={title} tone="info">
      <div className="grid gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </StatePanel>
  );
}
