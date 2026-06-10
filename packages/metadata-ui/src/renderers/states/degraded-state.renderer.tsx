import type { ReactElement, ReactNode } from "react";

import type { MetadataStateRenderer } from "../../contracts/state-renderer.contract";
import { MetadataStateShell } from "./metadata-state-shell";
import { resolveStateVisualDefinition } from "./state-visual-matrix";

type DegradedStateProps = {
  children?: ReactNode;
  description?: string;
  onRetry?: () => void;
  title?: string;
};

export function DegradedState({
  children,
  description,
  onRetry,
  title,
}: DegradedStateProps): ReactElement {
  const definition = resolveStateVisualDefinition("degraded");

  return (
    <MetadataStateShell
      action={
        onRetry
          ? {
              label: definition.actionLabel ?? "Continue with caution",
              onClick: onRetry,
            }
          : undefined
      }
      description={description}
      stateKind="degraded"
      title={title}
      variant="banner"
    >
      {children}
    </MetadataStateShell>
  );
}

export const DegradedStateRenderer: MetadataStateRenderer = ({
  children,
  error,
  onRetry,
}) => (
  <DegradedState description={error} onRetry={onRetry}>
    {children}
  </DegradedState>
);
