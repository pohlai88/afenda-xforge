import type { ReactElement } from "react";

import type { MetadataStateRenderer } from "../../contracts/state-renderer.contract";
import { MetadataStateShell } from "./metadata-state-shell";
import { resolveStateVisualDefinition } from "./state-visual-matrix";

type EmptyStateProps = {
  actionLabel?: string;
  description?: string;
  onAction?: () => void;
  title?: string;
};

export function EmptyState({
  actionLabel,
  description,
  onAction,
  title,
}: EmptyStateProps): ReactElement {
  const definition = resolveStateVisualDefinition("empty");

  return (
    <MetadataStateShell
      action={
        onAction
          ? {
              label: actionLabel ?? definition.actionLabel ?? "Create record",
              onClick: onAction,
            }
          : undefined
      }
      description={description}
      stateKind="empty"
      title={title}
    />
  );
}

export const EmptyStateRenderer: MetadataStateRenderer = ({
  actionLabel,
  emptyDescription,
  emptyTitle,
  onAction,
}) => (
  <EmptyState
    actionLabel={actionLabel}
    description={emptyDescription}
    onAction={onAction}
    title={emptyTitle}
  />
);
