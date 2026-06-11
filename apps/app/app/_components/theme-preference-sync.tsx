"use client";

import { useTheme } from "next-themes";
import type { ReactElement } from "react";
import { useEffect } from "react";
import { useTenantBranding } from "./tenant-branding-context.tsx";

export function ThemePreferenceSync(): ReactElement | null {
  const { userPreferences } = useTenantBranding();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (userPreferences.colorMode) {
      setTheme(userPreferences.colorMode);
    }
  }, [setTheme, userPreferences.colorMode]);

  return null;
}
