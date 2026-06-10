import type { ReactElement } from "react";

import type { MetadataStateRenderer } from "../../contracts/state-renderer.contract";
import { MetadataStateShell } from "./metadata-state-shell";
import { resolveStateVisualDefinition } from "./state-visual-matrix";

type ForbiddenStateProps = {
  description?: string;
  onAction?: () => void;
  title?: string;
};

export function ForbiddenState({
  description,
  onAction,
  title,
}: ForbiddenStateProps): ReactElement {
  const definition = resolveStateVisualDefinition("forbidden");

  return (
    <MetadataStateShell
      action={
        onAction
          ? {
              label: definition.actionLabel ?? "Go back",
              onClick: onAction,
            }
          : undefined
      }
      description={description}
      stateKind="forbidden"
      title={title}
    />
  );
}

export const ForbiddenStateRenderer: MetadataStateRenderer = ({
  forbiddenDescription,
  forbiddenTitle,
  onAction,
}) => (
  <ForbiddenState
    description={forbiddenDescription}
    onAction={onAction}
    title={forbiddenTitle}
  />
);
