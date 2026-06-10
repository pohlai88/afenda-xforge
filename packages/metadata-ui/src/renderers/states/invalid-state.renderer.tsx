import type { ReactElement } from "react";

import type { MetadataStateRenderer } from "../../contracts/state-renderer.contract";
import { MetadataStateShell } from "./metadata-state-shell";
import { resolveStateVisualDefinition } from "./state-visual-matrix";

type InvalidStateProps = {
  description?: string;
  onRetry?: () => void;
  title?: string;
};

export function InvalidState({
  description,
  onRetry,
  title,
}: InvalidStateProps): ReactElement {
  const definition = resolveStateVisualDefinition("invalid");

  return (
    <MetadataStateShell
      action={
        onRetry
          ? {
              label: definition.actionLabel ?? "Review metadata",
              onClick: onRetry,
            }
          : undefined
      }
      description={description}
      stateKind="invalid"
      title={title}
      variant="banner"
    />
  );
}

export const InvalidStateRenderer: MetadataStateRenderer = ({
  error,
  onRetry,
}) => <InvalidState description={error} onRetry={onRetry} />;
