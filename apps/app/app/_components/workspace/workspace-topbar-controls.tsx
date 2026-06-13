"use client";

import { Button } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { Moon, PanelBottomOpen, PanelRightOpen, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactElement, ReactNode } from "react";
import type { AppNavTopbarTooltipCopy } from "./app-nav-topbar-tooltip.tsx";
import { AppNavTopbarIconTooltip } from "./app-nav-topbar-tooltip.tsx";
import {
  APP_NAV_TOPBAR_SIDEBAR_TRIGGER_TOOLTIP,
  APP_NAV_TOPBAR_THEME_MENU_TOOLTIP,
} from "./app-nav-topbar-tooltips.ts";
import { useWorkspaceAuditEvidence } from "./audit-evidence/workspace-audit-evidence-context.tsx";
import { SidebarIconControl } from "./sidebar-icon-control.tsx";
import {
  appNavTopbarGhostIconButtonClassName,
  appNavTopbarIconClassName,
  siteTopbarIconButtonClassName,
  siteTopbarIconClassName,
} from "./workspace-shell.classes.ts";

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

export function AppNavTopbarSidebarTrigger(): ReactElement {
  return (
    <AppNavTopbarIconTooltip
      description={APP_NAV_TOPBAR_SIDEBAR_TRIGGER_TOOLTIP.description}
      title={APP_NAV_TOPBAR_SIDEBAR_TRIGGER_TOOLTIP.title}
    >
      <SidebarIconControl
        className={siteTopbarIconButtonClassName}
        menuLabel="App sidebar"
      />
    </AppNavTopbarIconTooltip>
  );
}

export function SiteSidebarTrigger(): ReactElement {
  return (
    <SidebarIconControl
      className={siteTopbarIconButtonClassName}
      menuLabel="Site sidebar"
    />
  );
}

export function AppNavTopbarThemeToggle(): ReactElement {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = (): void => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <AppNavTopbarIconTooltip
      description={APP_NAV_TOPBAR_THEME_MENU_TOOLTIP.description}
      title={APP_NAV_TOPBAR_THEME_MENU_TOOLTIP.title}
    >
      <Button
        className={cn(appNavTopbarGhostIconButtonClassName, "relative")}
        onClick={toggleTheme}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Sun
          className={cn(
            appNavTopbarIconClassName,
            "rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          )}
        />
        <Moon
          className={cn(
            appNavTopbarIconClassName,
            "absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          )}
        />
        <span className="sr-only">
          {APP_NAV_TOPBAR_THEME_MENU_TOOLTIP.title}
        </span>
      </Button>
    </AppNavTopbarIconTooltip>
  );
}

export function SiteContentTopbarPanelActions(): ReactElement {
  const { bottomOpen, rightOpen, toggleSheet } = useWorkspaceAuditEvidence();

  return (
    <div className="flex items-center gap-1">
      <Button
        aria-expanded={bottomOpen}
        aria-label="Toggle audit activity panel"
        aria-pressed={bottomOpen}
        className={siteTopbarIconButtonClassName}
        onClick={() => toggleSheet("bottom")}
        size="icon"
        type="button"
        variant="ghost"
      >
        <PanelBottomOpen className={siteTopbarIconClassName} />
      </Button>
      <Button
        aria-expanded={rightOpen}
        aria-label="Toggle audit evidence detail panel"
        aria-pressed={rightOpen}
        className={siteTopbarIconButtonClassName}
        onClick={() => toggleSheet("right")}
        size="icon"
        type="button"
        variant="ghost"
      >
        <PanelRightOpen className={siteTopbarIconClassName} />
      </Button>
    </div>
  );
}
