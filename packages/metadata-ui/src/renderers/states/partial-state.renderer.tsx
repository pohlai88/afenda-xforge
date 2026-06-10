import type { ReactElement, ReactNode } from "react";

import type { MetadataStateRenderer } from "../../contracts/state-renderer.contract";
import { MetadataStateShell } from "./metadata-state-shell";
import { resolveStateVisualDefinition } from "./state-visual-matrix";

type PartialStateProps = {
  children?: ReactNode;
  description?: string;
  onRetry?: () => void;
  title?: string;
};

export function PartialState({
  children,
  description,
  onRetry,
  title,
}: PartialStateProps): ReactElement {
  const definition = resolveStateVisualDefinition("partial");

  return (
    <MetadataStateShell
      action={
        onRetry
          ? {
              label: definition.actionLabel ?? "Refresh",
              onClick: onRetry,
            }
          : undefined
      }
      description={description}
      stateKind="partial"
      title={title}
      variant="banner"
    >
      {children}
    </MetadataStateShell>
  );
}

export const PartialStateRenderer: MetadataStateRenderer = ({
  children,
  error,
  onRetry,
}) => (
  <PartialState description={error} onRetry={onRetry}>
    {children}
  </PartialState>
);
