import { AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS } from "@repo/design-system";
import type { Decorator } from "@storybook/react";
import { useEffect } from "react";
import { ThemeStudioPreviewRoot } from "../../app/app/[locale]/theme-studio/_components/theme-studio-preview-root.tsx";
import { ThemeStudioWorkspace } from "../../app/app/[locale]/theme-studio/_components/theme-studio-workspace.tsx";

import { setStorybookPathname } from "../.storybook/mocks/next-navigation.ts";

export const withThemeStudioWorkspace: Decorator = (Story, context) => {
  const themeStudioPath =
    typeof context.parameters.themeStudioPath === "string"
      ? context.parameters.themeStudioPath
      : "/theme-studio/executive-dashboard";

  useEffect(() => {
    setStorybookPathname(themeStudioPath);
  }, [themeStudioPath]);

  return (
    <ThemeStudioPreviewRoot branding={AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS}>
      <ThemeStudioWorkspace>
        <Story />
      </ThemeStudioWorkspace>
    </ThemeStudioPreviewRoot>
  );
};
