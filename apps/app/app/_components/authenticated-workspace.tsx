"use client";

import type { ReactElement, ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import { AuthenticatedAppNavTopbarActions } from "./authenticated-app-nav-topbar-actions.tsx";
import { AuthenticatedFeatureScope } from "./authenticated-feature-scope.tsx";
import { AuthenticatedSidebar } from "./authenticated-sidebar.tsx";
import { AuthenticatedTopBar } from "./authenticated-top-bar.tsx";
import {
  AUTHENTICATED_DEFAULT_FEATURE_ID,
  AUTHENTICATED_NAV_ITEMS,
} from "./authenticated-workspace-nav.ts";
import { PersistedModeToggle } from "./persisted-mode-toggle.tsx";
import { AuthenticatedAuditScopeSync } from "./workspace/audit-evidence/authenticated-audit-scope-sync.tsx";
import { HrSuiteSiteContentTopbar } from "./workspace/hr-suite-site-content-topbar.tsx";
import {
  HR_SUITE_DEFAULT_FEATURE_ID,
  isHrSuitePath,
  resolveHrSuiteFeatureFromPathname,
} from "./workspace/hr-suite-site-nav.ts";
import { HrSuiteSiteSidebar } from "./workspace/hr-suite-site-sidebar.tsx";
import { WorkspaceShortcutsDispatcher } from "./workspace/keyboard-shortcuts/keyboard-shortcuts-provider.tsx";
import { resolveActiveFeatureId } from "./workspace/path-utils.ts";
import { WorkspaceFrame } from "./workspace/workspace-frame.tsx";
import {
  AppNavTopbarSidebarTrigger,
  SiteContentTopbarPanelActions,
  SiteSidebarTrigger,
} from "./workspace/workspace-topbar-controls.tsx";

type AuthenticatedWorkspaceProps = {
  children: ReactNode;
};

export function AuthenticatedWorkspace({
  children,
}: AuthenticatedWorkspaceProps): ReactElement {
  const pathname = usePathname();
  const activeFeatureId = resolveActiveFeatureId(
    pathname,
    AUTHENTICATED_NAV_ITEMS,
    AUTHENTICATED_DEFAULT_FEATURE_ID
  );
  const hrSuiteFeature = resolveHrSuiteFeatureFromPathname(pathname);
  const isHrSuiteRoute = isHrSuitePath(pathname);
  const hrSuiteActiveFeatureId =
    hrSuiteFeature?.feature.featureId ?? HR_SUITE_DEFAULT_FEATURE_ID;
  const siteTopbar = isHrSuiteRoute ? (
    <HrSuiteSiteContentTopbar
      actions={
        <>
          <SiteContentTopbarPanelActions />
          <PersistedModeToggle />
        </>
      }
      leading={<SiteSidebarTrigger />}
    />
  ) : (
    <AuthenticatedTopBar />
  );

  return (
    <WorkspaceFrame
      appNavTopbar={{
        actions: <AuthenticatedAppNavTopbarActions />,
        sidebarTrigger: <AppNavTopbarSidebarTrigger />,
      }}
      appSidebar={<AuthenticatedSidebar />}
      appSidebarCollapsible="icon"
      appSidebarWrapper={(appSidebar) => (
        <AuthenticatedFeatureScope featureId={activeFeatureId}>
          {appSidebar}
        </AuthenticatedFeatureScope>
      )}
      auditEvidenceScopeSync={<AuthenticatedAuditScopeSync />}
      contentPadded
      enableSidebarKeyboardShortcut={false}
      siteSidebarLeft={
        isHrSuiteRoute ? (
          <HrSuiteSiteSidebar
            activeFeatureId={hrSuiteActiveFeatureId}
            mode="live"
            onSelect={() => undefined}
          />
        ) : undefined
      }
      siteTopbar={siteTopbar}
    >
      <WorkspaceShortcutsDispatcher />
      {children}
    </WorkspaceFrame>
  );
}
