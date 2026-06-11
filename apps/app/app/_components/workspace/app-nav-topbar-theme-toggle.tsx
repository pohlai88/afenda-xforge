"use client";

import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactElement } from "react";
import {
  appNavTopbarGhostIconButtonClassName,
  appNavTopbarIconClassName,
} from "./app-nav-topbar-chrome.ts";

export function AppNavTopbarThemeToggle(): ReactElement {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = (): void => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
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
          <span className="sr-only">Toggle color mode</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Color mode</TooltipContent>
    </Tooltip>
  );
}
