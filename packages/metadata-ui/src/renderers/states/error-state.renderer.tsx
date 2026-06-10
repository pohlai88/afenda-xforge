import type { ReactElement } from "react";

import type { MetadataStateRenderer } from "../../contracts/state-renderer.contract";
import { MetadataStateShell } from "./metadata-state-shell";
import { resolveStateVisualDefinition } from "./state-visual-matrix";

type ErrorStateProps = {
  description?: string;
  onRetry?: () => void;
  title?: string;
};

export function ErrorState({
  description,
  onRetry,
  title,
}: ErrorStateProps): ReactElement {
  const definition = resolveStateVisualDefinition("error");

  return (
    <MetadataStateShell
      action={
        onRetry
          ? {
              label: definition.actionLabel ?? "Retry",
              onClick: onRetry,
            }
          : undefined
      }
      description={description}
      stateKind="error"
      title={title}
    />
  );
}

export const ErrorStateRenderer: MetadataStateRenderer = ({
  error,
  onRetry,
}) => <ErrorState description={error} onRetry={onRetry} />;
