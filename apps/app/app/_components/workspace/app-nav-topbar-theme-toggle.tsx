"use client";

import { Button } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactElement } from "react";
import {
  appNavTopbarGhostIconButtonClassName,
  appNavTopbarIconClassName,
} from "./app-nav-topbar-chrome.ts";
import { AppNavTopbarIconTooltip } from "./app-nav-topbar-tooltip.tsx";
import { APP_NAV_TOPBAR_THEME_MENU_TOOLTIP } from "./app-nav-topbar-tooltips.ts";

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
