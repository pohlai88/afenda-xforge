import { Button } from "@repo/ui/components/button";
import type { ReactElement } from "react";

import type { MetadataActionRendererProps } from "../../contracts/action-renderer.contract";

export function DestructiveActionRenderer({
  action,
  onAction,
}: MetadataActionRendererProps): ReactElement {
  if (action.href) {
    return (
      <Button
        asChild
        disabled={action.disabled}
        size="sm"
        variant="destructive"
      >
        <a href={action.disabled ? undefined : action.href}>{action.label}</a>
      </Button>
    );
  }

  return (
    <Button
      disabled={action.disabled}
      onClick={(): void => onAction?.(action)}
      size="sm"
      variant="destructive"
    >
      {action.label}
    </Button>
  );
}
