"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import type { ReactElement } from "react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../ui-shadcn/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../ui-shadcn/sidebar";
import type {
  WorkspaceNavContextOption,
  WorkspaceNavContextScope,
} from "./5.4-workspace-rail.types.ts";
import { WORKSPACE_NAV_CONTEXT_LABELS } from "./5.4-workspace-rail.types.ts";

export type WorkspaceNavContextSwitcherProps = {
  activeOptionId?: string;
  addOptionLabel?: string;
  defaultOptionId?: string;
  menuLabel?: string;
  onAddOption?: () => void;
  onOptionChange?: (option: WorkspaceNavContextOption) => void;
  options: readonly WorkspaceNavContextOption[];
  scope?: WorkspaceNavContextScope;
  showShortcuts?: boolean;
};

export function WorkspaceNavContextSwitcher({
  activeOptionId: activeOptionIdProp,
  addOptionLabel = "Add option",
  defaultOptionId,
  menuLabel,
  onAddOption,
  onOptionChange,
  options,
  scope = "organization",
  showShortcuts = true,
}: WorkspaceNavContextSwitcherProps): ReactElement | null {
  const { isMobile } = useSidebar();
  const [internalActiveOptionId, setInternalActiveOptionId] = useState(
    defaultOptionId ?? options[0]?.id
  );
  const activeOptionId = activeOptionIdProp ?? internalActiveOptionId;
  const activeOption =
    options.find((option) => option.id === activeOptionId) ?? options[0];
  const resolvedMenuLabel =
    menuLabel ?? WORKSPACE_NAV_CONTEXT_LABELS[scope];

  if (!activeOption) {
    return null;
  }

  const ActiveLogo = activeOption.logo;

  const handleOptionChange = (option: WorkspaceNavContextOption): void => {
    if (activeOptionIdProp === undefined) {
      setInternalActiveOptionId(option.id);
    }

    onOptionChange?.(option);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {ActiveLogo ? <ActiveLogo className="size-4" /> : null}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeOption.name}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {activeOption.subtitle}
                </span>
              </div>
              <ChevronsUpDown className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {resolvedMenuLabel}
            </DropdownMenuLabel>
            {options.map((option, index) => {
              const OptionLogo = option.logo;

              return (
                <DropdownMenuItem
                  className="gap-2 p-2"
                  key={option.id}
                  onSelect={(event) => {
                    event.preventDefault();
                    handleOptionChange(option);
                  }}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    {OptionLogo ? (
                      <OptionLogo className="size-3.5 shrink-0" />
                    ) : null}
                  </div>
                  <span className="min-w-0 flex-1 truncate">{option.name}</span>
                  {showShortcuts && index < 9 ? (
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  ) : null}
                </DropdownMenuItem>
              );
            })}
            {onAddOption ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onSelect={(event) => {
                    event.preventDefault();
                    onAddOption();
                  }}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    {addOptionLabel}
                  </div>
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
