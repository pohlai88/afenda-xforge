"use client";

import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui";
import type { ReactElement, ReactNode } from "react";
import { appNavTopbarGhostIconButtonClassName } from "./app-nav-topbar-chrome.ts";

export function AppNavTopbarIconButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick?: () => void;
}): ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={appNavTopbarGhostIconButtonClassName}
          disabled={disabled}
          onClick={onClick}
          size="icon"
          type="button"
          variant="ghost"
        >
          {children}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
