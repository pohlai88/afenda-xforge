import { Button } from "@repo/ui/components/button";
import type { ReactElement } from "react";

import type { MetadataActionRendererProps } from "../../contracts/action-renderer.contract";

export function ButtonActionRenderer({
  action,
  onAction,
}: MetadataActionRendererProps): ReactElement {
  const content = action.label;

  if (action.href) {
    return (
      <Button asChild disabled={action.disabled} size="sm" variant="default">
        <a href={action.disabled ? undefined : action.href}>{content}</a>
      </Button>
    );
  }

  return (
    <Button
      disabled={action.disabled}
      onClick={(): void => onAction?.(action)}
      size="sm"
      variant="default"
    >
      {content}
    </Button>
  );
}
