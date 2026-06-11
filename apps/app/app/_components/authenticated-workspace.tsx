"use client";

import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { AuthenticatedFeatureScope } from "./authenticated-feature-scope.tsx";
import { AuthenticatedSidebar } from "./authenticated-sidebar.tsx";
import { AuthenticatedAppNavTopbarActions } from "./authenticated-app-nav-topbar-actions.tsx";
import { AuthenticatedTopBar } from "./authenticated-top-bar.tsx";
import {
  AUTHENTICATED_DEFAULT_FEATURE_ID,
  AUTHENTICATED_NAV_ITEMS,
} from "./authenticated-workspace-nav.ts";
import { resolveActiveFeatureId } from "./workspace/path-utils.ts";
import { WorkspaceFrame } from "./workspace/workspace-frame.tsx";

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

  return (
    <WorkspaceFrame
      appNavTopbar={{
        actions: <AuthenticatedAppNavTopbarActions />,
      }}
      collapsible="icon"
      contentPadded
      sidebar={<AuthenticatedSidebar />}
      sidebarWrapper={(sidebar) => (
        <AuthenticatedFeatureScope featureId={activeFeatureId}>
          {sidebar}
        </AuthenticatedFeatureScope>
      )}
      topBar={<AuthenticatedTopBar />}
    >
      {children}
    </WorkspaceFrame>
  );
}
