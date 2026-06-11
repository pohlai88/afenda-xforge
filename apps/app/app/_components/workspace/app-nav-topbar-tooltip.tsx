"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui";
import type { ReactElement, ReactNode } from "react";

export type AppNavTopbarTooltipCopy = {
  title: string;
  description?: string;
};

export function AppNavTopbarTooltipContent({
  title,
  description,
}: AppNavTopbarTooltipCopy): ReactElement {
  return (
    <div className="flex max-w-[14rem] flex-col gap-0.5 text-left">
      <p className="font-medium leading-tight">{title}</p>
      {description ? (
        <p className="text-background/80 text-[11px] leading-snug">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function AppNavTopbarIconTooltip({
  children,
  description,
  side = "bottom",
  title,
}: AppNavTopbarTooltipCopy & {
  children: ReactNode;
  side?: "bottom" | "left" | "right" | "top";
}): ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={4}>
        <AppNavTopbarTooltipContent description={description} title={title} />
      </TooltipContent>
    </Tooltip>
  );
}
