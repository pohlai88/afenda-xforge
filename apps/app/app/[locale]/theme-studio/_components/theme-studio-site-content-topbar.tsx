"use client";

import { WorkspaceNavSiteTopbar } from "@repo/ui/components/compose/workspace";
import type { ReactElement } from "react";
import { PersistedModeToggle } from "../../../_components/persisted-mode-toggle.tsx";
import { HR_SUITE_SITE_SCOPE_LABEL } from "../../../_components/workspace/hr-suite-site-nav.ts";
import { SiteNavSidebarTrigger } from "../../../_components/workspace/site-nav-sidebar-trigger.tsx";
import { AppNavTopbarThemeToggle } from "../../../_components/workspace/app-nav-topbar-theme-toggle.tsx";
import { useThemeStudioHrSuite } from "./theme-studio-hr-suite-context.tsx";

export function ThemeStudioSiteContentTopbar(): ReactElement {
  const { activeFeature } = useThemeStudioHrSuite();

  return (
    <WorkspaceNavSiteTopbar
      actions={
        <div className="flex items-center gap-1">
          <AppNavTopbarThemeToggle />
          <PersistedModeToggle />
        </div>
      }
      description={activeFeature.description ?? activeFeature.featureId}
      leading={<SiteNavSidebarTrigger />}
      scopeLabel={HR_SUITE_SITE_SCOPE_LABEL}
      title={activeFeature.label}
    />
  );
}
