"use client";

import { usePathname } from "@/i18n/navigation";
import type { ReactElement } from "react";
import { AUTHENTICATED_SIDEBAR_NAV_GROUPS } from "../authenticated-workspace-nav.ts";
import { isPathActive } from "./path-utils.ts";
import { SiteContentNavSidebar } from "./site-content-nav-sidebar.tsx";
import { WorkspaceNavMenu } from "./workspace-nav-menu.tsx";

function resolveActiveNavGroup(pathname: string) {
  return (
    AUTHENTICATED_SIDEBAR_NAV_GROUPS.find((group) =>
      group.items.some((item) => isPathActive(pathname, item.href))
    ) ?? AUTHENTICATED_SIDEBAR_NAV_GROUPS[0]
  );
}

export function AuthenticatedSiteContentNavSidebar(): ReactElement {
  const pathname = usePathname();
  const activeGroup = resolveActiveNavGroup(pathname);

  return (
    <SiteContentNavSidebar label={activeGroup.label}>
      <WorkspaceNavMenu groups={[activeGroup]} />
    </SiteContentNavSidebar>
  );
}
