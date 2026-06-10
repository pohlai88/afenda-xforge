import type { ReactElement } from "react";

import type { MetadataStateRenderer } from "../../contracts/state-renderer.contract";
import { MetadataStateShell } from "./metadata-state-shell";
import { resolveStateVisualDefinition } from "./state-visual-matrix";

type MaintenanceStateProps = {
  description?: string;
  onAction?: () => void;
  title?: string;
};

export function MaintenanceState({
  description,
  onAction,
  title,
}: MaintenanceStateProps): ReactElement {
  const definition = resolveStateVisualDefinition("maintenance");

  return (
    <MetadataStateShell
      action={
        onAction
          ? {
              label: definition.actionLabel ?? "Return later",
              onClick: onAction,
            }
          : undefined
      }
      description={description}
      stateKind="maintenance"
      title={title}
      variant="banner"
    />
  );
}

export const MaintenanceStateRenderer: MetadataStateRenderer = ({
  forbiddenDescription,
  onAction,
}) => (
  <MaintenanceState description={forbiddenDescription} onAction={onAction} />
);
