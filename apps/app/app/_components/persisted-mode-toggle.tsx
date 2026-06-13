"use client";

import type { AfendaColorModePreference as ColorModePreference } from "@repo/design-system/contracts/afenda/customization";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactElement } from "react";
import { useState } from "react";
import { persistColorModePreferences } from "../../lib/user-appearance/persist-color-mode.client";
import { useTenantBranding } from "./tenant-branding-context.tsx";

export function PersistedModeToggle(): ReactElement {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={pending} size="icon" variant="outline">
          <Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle color mode</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => applyColorMode("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyColorMode("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyColorMode("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
