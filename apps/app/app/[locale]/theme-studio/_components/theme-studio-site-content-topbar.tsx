"use client";

import type { ReactElement } from "react";
import { HrSuiteSiteContentTopbar } from "../../../_components/workspace/hr-suite-site-content-topbar.tsx";
import {
  SiteContentTopbarPanelActions,
  SiteSidebarTrigger,
} from "../../../_components/workspace/workspace-topbar-controls.tsx";
import { useThemeStudioHrSuite } from "./theme-studio-hr-suite-context.tsx";

export function ThemeStudioSiteContentTopbar(): ReactElement {
  const { activeFeatureId } = useThemeStudioHrSuite();

  return (
    <HrSuiteSiteContentTopbar
      actions={<SiteContentTopbarPanelActions />}
      activeFeatureId={activeFeatureId}
      leading={<SiteSidebarTrigger />}
    />
  );
}
