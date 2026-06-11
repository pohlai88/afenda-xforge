"use client";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { MoreHorizontal } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import {
  appNavTopbarGhostIconButtonClassName,
  appNavTopbarIconClassName,
} from "./app-nav-topbar-chrome.ts";

export type AppNavTopbarNavActionItem = {
  destructive?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  key: string;
  label: string;
  onSelect?: () => void;
};

export type AppNavTopbarNavActionGroup = {
  items: readonly AppNavTopbarNavActionItem[];
  key: string;
  label?: string;
};

export type AppNavTopbarNavActionsProps = {
  groups: readonly AppNavTopbarNavActionGroup[];
  header?: {
    email?: string;
    name?: string;
  };
  triggerLabel?: string;
};

function AppNavTopbarNavActionRow({
  item,
  onClose,
}: {
  item: AppNavTopbarNavActionItem;
  onClose: () => void;
}): ReactElement {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={cn(
          item.destructive && "text-destructive hover:text-destructive"
        )}
        disabled={item.disabled}
        onClick={() => {
          item.onSelect?.();
          onClose();
        }}
        type="button"
      >
        {item.icon}
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppNavTopbarNavActions({
  groups,
  header,
  triggerLabel = "Actions",
}: AppNavTopbarNavActionsProps): ReactElement {
  const [open, setOpen] = useState(false);
  const visibleGroups = groups.filter((group) => group.items.length > 0);
  const showHeader = Boolean(header?.name || header?.email);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              aria-haspopup="dialog"
              className={cn(
                appNavTopbarGhostIconButtonClassName,
                "data-[state=open]:bg-accent"
              )}
              size="icon"
              type="button"
              variant="ghost"
            >
              <MoreHorizontal className={appNavTopbarIconClassName} />
              <span className="sr-only">{triggerLabel}</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{triggerLabel}</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="end"
        className="w-56 overflow-hidden rounded-lg p-0"
        sideOffset={4}
      >
        {showHeader ? (
          <div className="border-b px-3 py-2">
            {header?.name ? (
              <p className="truncate font-medium text-foreground text-sm">
                {header.name}
              </p>
            ) : null}
            {header?.email ? (
              <p className="truncate text-muted-foreground text-xs">
                {header.email}
              </p>
            ) : null}
          </div>
        ) : null}
        {visibleGroups.length > 0 ? (
          <Sidebar className="bg-transparent" collapsible="none">
            <SidebarContent>
              {visibleGroups.map((group) => (
                <SidebarGroup
                  className="border-b last:border-none"
                  key={group.key}
                >
                  {group.label ? (
                    <SidebarGroupLabel className="px-2 py-1.5 text-muted-foreground text-xs">
                      {group.label}
                    </SidebarGroupLabel>
                  ) : null}
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <AppNavTopbarNavActionRow
                          item={item}
                          key={item.key}
                          onClose={() => {
                            setOpen(false);
                          }}
                        />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
