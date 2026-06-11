"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataActionRendererProps } from "../../contracts/action-renderer.contract";

export function MenuActionSurface({
  action,
  onAction,
}: MetadataActionRendererProps): ReactElement {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-haspopup="menu"
          data-action-surface="menu"
          disabled={action.disabled}
          size="sm"
          type="button"
          variant="ghost"
        >
          {action.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={action.disabled}
          onSelect={(): void => {
            if (!action.disabled) {
              onAction?.(action);
            }
          }}
        >
          {action.label}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
