"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";
import { useSidebar } from "@repo/ui/components/ui/sidebar";
import { cn } from "@repo/ui/lib/utils";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import type { ReactElement } from "react";
import {
  SIDEBAR_BEHAVIOR_LABELS,
  SIDEBAR_BEHAVIOR_MODES,
} from "./sidebar-behavior.constants.ts";
import { useSidebarControl } from "./sidebar-control-provider.tsx";

type SidebarIconControlProps = {
  className?: string;
  menuLabel?: string;
};

export function SidebarIconControl({
  className,
  menuLabel = "Sidebar control",
}: SidebarIconControlProps): ReactElement {
  const { isMobile, open } = useSidebar();
  const { mode, setMode } = useSidebarControl();
  const Icon = open ? ArrowLeftToLine : ArrowRightToLine;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={menuLabel}
          className={cn("size-7", className)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Icon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          {menuLabel}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          onValueChange={(value) => {
            if (
              value === "expanded" ||
              value === "collapsed" ||
              value === "hover"
            ) {
              setMode(value);
            }
          }}
          value={mode}
        >
          {SIDEBAR_BEHAVIOR_MODES.map((behaviorMode) => (
            <DropdownMenuRadioItem
              disabled={isMobile && behaviorMode === "hover"}
              key={behaviorMode}
              value={behaviorMode}
            >
              {SIDEBAR_BEHAVIOR_LABELS[behaviorMode]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
