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
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { MoreHorizontal } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import type { AppNavTopbarTooltipCopy } from "./app-nav-topbar-tooltip.tsx";
import { AppNavTopbarIconTooltip } from "./app-nav-topbar-tooltip.tsx";
import {
  appNavTopbarGhostIconButtonClassName,
  appNavTopbarIconClassName,
  WORKSPACE_SHELL_INTERACTIVE_CLASS,
  WORKSPACE_SHELL_OPEN_CLASS,
} from "./workspace-shell.classes.ts";

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
  triggerTooltip?: AppNavTopbarTooltipCopy;
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
          WORKSPACE_SHELL_INTERACTIVE_CLASS,
          item.destructive && "text-destructive"
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
  triggerTooltip,
}: AppNavTopbarNavActionsProps): ReactElement {
  const [open, setOpen] = useState(false);
  const visibleGroups = groups.filter((group) => group.items.length > 0);
  const showHeader = Boolean(header?.name || header?.email);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <AppNavTopbarIconTooltip
        description={triggerTooltip?.description}
        title={triggerTooltip?.title ?? triggerLabel}
      >
        <PopoverTrigger asChild>
          <Button
            aria-haspopup="dialog"
            className={cn(
              appNavTopbarGhostIconButtonClassName,
              WORKSPACE_SHELL_OPEN_CLASS
            )}
            size="icon"
            type="button"
            variant="ghost"
          >
            <MoreHorizontal className={appNavTopbarIconClassName} />
            <span className="sr-only">
              {triggerTooltip?.title ?? triggerLabel}
            </span>
          </Button>
        </PopoverTrigger>
      </AppNavTopbarIconTooltip>
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
