"use client";

import type { AfendaColorModePreference as ColorModePreference } from "@repo/design-system/contracts/afenda/customization";
import { EnterpriseDropdownMenu } from "@repo/metadata-ui/components";
import { Button } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactElement } from "react";
import { useState } from "react";
import { persistColorModePreferences } from "../../../lib/user-appearance/persist-color-mode.client";
import { useTenantBranding } from "../tenant-branding-context.tsx";
import {
  appNavTopbarGhostIconButtonClassName,
  appNavTopbarIconClassName,
} from "./workspace-shell.classes.ts";
import { AppNavTopbarIconTooltip } from "./app-nav-topbar-tooltip.tsx";
import { APP_NAV_TOPBAR_THEME_MENU_TOOLTIP } from "./app-nav-topbar-tooltips.ts";

export function AppNavTopbarThemeMenu(): ReactElement {
  const { setTheme } = useTheme();
  const { setUserPreferences, userPreferences } = useTenantBranding();
  const [pending, setPending] = useState(false);

  const applyColorMode = async (
    colorMode: ColorModePreference
  ): Promise<void> => {
    setTheme(colorMode);
    setPending(true);

    const result = await persistColorModePreferences(
      userPreferences,
      colorMode
    );
    setPending(false);

    if (result.ok) {
      setUserPreferences(result.preferences);
    }
  };

  return (
    <EnterpriseDropdownMenu
      items={[
        {
          icon: <Sun className={appNavTopbarIconClassName} />,
          key: "light",
          label: "Light",
          onSelect: () => {
            applyColorMode("light").catch(() => undefined);
          },
        },
        {
          icon: <Moon className={appNavTopbarIconClassName} />,
          key: "dark",
          label: "Dark",
          onSelect: () => {
            applyColorMode("dark").catch(() => undefined);
          },
        },
        {
          icon: <Monitor className={appNavTopbarIconClassName} />,
          key: "system",
          label: "System",
          onSelect: () => {
            applyColorMode("system").catch(() => undefined);
          },
        },
      ]}
      trigger={
        <AppNavTopbarIconTooltip
          description={APP_NAV_TOPBAR_THEME_MENU_TOOLTIP.description}
          title={APP_NAV_TOPBAR_THEME_MENU_TOOLTIP.title}
        >
          <Button
            aria-haspopup="menu"
            className={cn(appNavTopbarGhostIconButtonClassName, "relative")}
            disabled={pending}
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
      }
    />
  );
}
