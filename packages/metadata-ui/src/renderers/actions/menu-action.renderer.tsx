import { Button } from "@repo/ui/components/button";
import type { ReactElement } from "react";

import type { MetadataActionRendererProps } from "../../contracts/action-renderer.contract";

export function MenuActionRenderer({
  action,
  onAction,
}: MetadataActionRendererProps): ReactElement {
  if (action.href) {
    return (
      <Button asChild disabled={action.disabled} size="sm" variant="ghost">
        <a
          aria-haspopup="menu"
          href={action.disabled ? undefined : action.href}
        >
          {action.label}
        </a>
      </Button>
    );
  }

  return (
    <Button
      aria-haspopup="menu"
      disabled={action.disabled}
      onClick={(): void => onAction?.(action)}
      size="sm"
      variant="ghost"
    >
      {action.label}
    </Button>
  );
}
