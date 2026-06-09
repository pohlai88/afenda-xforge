import type { ReactElement } from "react";
import { StatePanel } from "../../components/state-panel";

type ErrorStateProps = {
  description?: string;
  onRetry?: () => void;
  title?: string;
};

export function ErrorState({
  description = "The metadata surface could not be rendered.",
  onRetry,
  title = "Unable to load records",
}: ErrorStateProps): ReactElement {
  return (
    <StatePanel
      action={
        onRetry
          ? {
              label: "Retry",
              onClick: onRetry,
            }
          : undefined
      }
      description={description}
      title={title}
      tone="danger"
    />
  );
}
