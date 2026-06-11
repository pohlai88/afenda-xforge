"use client";

import { Button } from "@repo/ui";
import type { ReactElement, ReactNode } from "react";
import { appNavTopbarGhostIconButtonClassName } from "./app-nav-topbar-chrome.ts";
import {
  AppNavTopbarIconTooltip,
  type AppNavTopbarTooltipCopy,
} from "./app-nav-topbar-tooltip.tsx";

export function AppNavTopbarIconButton({
  children,
  disabled,
  description,
  onClick,
  title,
}: AppNavTopbarTooltipCopy & {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}): ReactElement {
  return (
    <AppNavTopbarIconTooltip description={description} title={title}>
      <Button
        className={appNavTopbarGhostIconButtonClassName}
        disabled={disabled}
        onClick={onClick}
        size="icon"
        type="button"
        variant="ghost"
      >
        {children}
        <span className="sr-only">{title}</span>
      </Button>
    </AppNavTopbarIconTooltip>
  );
}
