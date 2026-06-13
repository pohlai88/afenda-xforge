"use client";

import { WorkspaceNavSiteTopbar } from "@repo/ui/components/compose/workspace";
import type { ReactElement } from "react";
import { PersistedModeToggle } from "./persisted-mode-toggle.tsx";
import { SiteContentTopbarPanelActions } from "./workspace/workspace-topbar-controls.tsx";

/** App site column topbar — no site-chrome sidebar (preview that in Theme Studio). */
export function AuthenticatedTopBar(): ReactElement {
  return (
    <WorkspaceNavSiteTopbar
      actions={
        <>
          <SiteContentTopbarPanelActions />
          <PersistedModeToggle />
        </>
      }
    />
  );
}
