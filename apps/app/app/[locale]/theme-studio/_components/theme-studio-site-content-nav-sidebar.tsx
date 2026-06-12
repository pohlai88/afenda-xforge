"use client";

import { ScrollArea, SidebarContent } from "@repo/ui";
import {
  WORKSPACE_SHELL_SPACE,
  WORKSPACE_SHELL_TYPE,
  WorkspaceSidebarSectionLabel,
} from "@repo/ui/components/compose/workspace";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";
import { HR_SUITE_SITE_NAV_GROUPS } from "../../../_components/workspace/hr-suite-site-nav.ts";
import { SiteContentNavLinks } from "../../../_components/workspace/site-content-nav-links.tsx";
import { useThemeStudioHrSuite } from "./theme-studio-hr-suite-context.tsx";

const siteNavScrollClass =
  "h-full min-h-0 w-full min-w-0 [&_[data-slot=scroll-area-viewport]]:overflow-x-hidden";

export function ThemeStudioSiteContentNavSidebar(): ReactElement {
  const { activeFeatureId, setActiveFeatureId } = useThemeStudioHrSuite();

  return (
    <SidebarContent className="min-h-0 gap-0 overflow-hidden p-0">
      <ScrollArea className={siteNavScrollClass}>
        <div
          className={cn(
            "flex min-w-0 flex-col gap-4 py-2",
            WORKSPACE_SHELL_SPACE.sidebarRoot,
            WORKSPACE_SHELL_TYPE.sidebarRoot
          )}
        >
          {HR_SUITE_SITE_NAV_GROUPS.map((group) => (
            <section className="min-w-0 px-2" key={group.label}>
              <WorkspaceSidebarSectionLabel>{group.label}</WorkspaceSidebarSectionLabel>
              <SiteContentNavLinks
                activeFeatureId={activeFeatureId}
                items={group.items}
                onSelect={setActiveFeatureId}
              />
            </section>
          ))}
        </div>
      </ScrollArea>
    </SidebarContent>
  );
}
