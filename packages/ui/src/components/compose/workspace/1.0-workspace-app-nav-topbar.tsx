"use client";

import { ChevronDown } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";

import { cn } from "../../../lib/utils";
import { Button } from "../../ui-shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../ui-shadcn/dropdown-menu";
import { SidebarTrigger } from "../../ui-shadcn/sidebar";
import { TooltipProvider } from "../../ui-shadcn/tooltip";
import { WorkspaceAppNavTopbarBrand } from "./1.2-workspace-app-nav-topbar-brand.tsx";
import type { WorkspaceNavContextScope } from "./5.4-workspace-rail.types.ts";
import {
  WORKSPACE_NAV_CONTEXT_LABELS,
  WORKSPACE_NAV_CONTEXT_SCOPE_INDICATORS,
} from "./5.4-workspace-rail.types.ts";
import type { WorkspaceNavContextSwitcherProps } from "./5.7-workspace-nav-context-switcher.tsx";
import {
  WORKSPACE_SHELL_CHROME_HEIGHT,
  WORKSPACE_SHELL_SPACE,
  WORKSPACE_SHELL_TYPE,
} from "./6.1-workspace-shell.typography.ts";

export const WORKSPACE_APP_NAV_TOPBAR_HEIGHT = WORKSPACE_SHELL_CHROME_HEIGHT;

const WORKSPACE_APP_TOPBAR_SWITCHER_MAX_CHARS = 20;

export type WorkspaceAppNavTopbarProps = {
  actions?: ReactNode;
  brand?: ReactElement;
  brandHomeHref?: string;
  className?: string;
  /** Replaces the default sidebar panel trigger (e.g. for app-layer tooltips). */
  sidebarTrigger?: ReactNode;
  showSidebarTrigger?: boolean;
  switchers?: readonly WorkspaceNavContextSwitcherProps[];
};

function truncateSwitcherLabel(value: string): string {
  if (value.length <= WORKSPACE_APP_TOPBAR_SWITCHER_MAX_CHARS) {
    return value;
  }

  return `${value.slice(0, WORKSPACE_APP_TOPBAR_SWITCHER_MAX_CHARS - 1)}…`;
}

function ContextSwitcher({
  activeOptionId: activeOptionIdProp,
  defaultOptionId,
  menuLabel,
  onOptionChange,
  options,
  scope = "organization",
}: WorkspaceNavContextSwitcherProps): ReactElement | null {
  const [internalActiveOptionId, setInternalActiveOptionId] = useState(
    defaultOptionId ?? options[0]?.id,
  );
  const activeOptionId = activeOptionIdProp ?? internalActiveOptionId;
  const activeOption =
    options.find((option) => option.id === activeOptionId) ?? options[0];
  const resolvedMenuLabel = menuLabel ?? WORKSPACE_NAV_CONTEXT_LABELS[scope];
  const scopeIndicator =
    WORKSPACE_NAV_CONTEXT_SCOPE_INDICATORS[scope as WorkspaceNavContextScope] ??
    resolvedMenuLabel;

  if (!activeOption) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            "group font-normal hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent",
            WORKSPACE_SHELL_TYPE.appTopbarSwitcherIdle,
            WORKSPACE_SHELL_SPACE.topbarItem,
          )}
          size="sm"
          type="button"
          variant="ghost"
        >
          <span className="flex min-w-0 flex-1 flex-col items-start justify-center gap-0">
            <span className={WORKSPACE_SHELL_TYPE.appTopbarScopeLabel}>
              {truncateSwitcherLabel(scopeIndicator)}
            </span>
            <span
              className={cn(
                WORKSPACE_SHELL_TYPE.appTopbarItemValue,
                WORKSPACE_SHELL_TYPE.appTopbarSwitcherValueMax,
              )}
            >
              {truncateSwitcherLabel(activeOption.name)}
            </span>
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuLabel className={WORKSPACE_SHELL_TYPE.menuLabel}>
          {resolvedMenuLabel}
        </DropdownMenuLabel>
        {options.map((option) => (
          <DropdownMenuItem
            className={WORKSPACE_SHELL_TYPE.menuItem}
            key={option.id}
            onSelect={(event) => {
              event.preventDefault();
              if (activeOptionIdProp === undefined) {
                setInternalActiveOptionId(option.id);
              }
              onOptionChange?.(option);
            }}
          >
            {option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function WorkspaceAppNavTopbar({
  actions,
  brand,
  brandHomeHref,
  className,
  sidebarTrigger,
  showSidebarTrigger = true,
  switchers = [],
}: WorkspaceAppNavTopbarProps): ReactElement {
  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "sticky top-0 z-50 flex shrink-0 items-center gap-1 antialiased",
          WORKSPACE_SHELL_SPACE.appTopbarSurface,
          WORKSPACE_SHELL_SPACE.shellInsetX,
          className,
        )}
        data-slot="workspace-app-nav-topbar"
        style={{ height: WORKSPACE_SHELL_CHROME_HEIGHT }}
      >
      {showSidebarTrigger
        ? (sidebarTrigger ?? (
            <SidebarTrigger
              className={cn(
                WORKSPACE_SHELL_SPACE.iconButton,
                "shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            />
          ))
        : null}
      {brand ?? <WorkspaceAppNavTopbarBrand homeHref={brandHomeHref} />}
      {switchers.length > 0 ? (
        <nav
          aria-label="Workspace context"
          className={cn(
            "flex min-w-0 flex-1 items-center overflow-x-auto",
            WORKSPACE_SHELL_TYPE.appTopbarBreadcrumb,
          )}
        >
          {switchers.map((switcher, index) => {
            const switcherKey = `${switcher.scope ?? switcher.menuLabel ?? "switcher"}-${index}`;

            return (
              <div className="min-w-0 shrink-0" key={switcherKey}>
                <ContextSwitcher {...switcher} showShortcuts={false} />
              </div>
            );
          })}
        </nav>
      ) : (
        <div className="min-w-0 flex-1" />
      )}
      {actions ? (
        <div className="ms-auto flex shrink-0 items-center">{actions}</div>
      ) : null}
      </div>
    </TooltipProvider>
  );
}
