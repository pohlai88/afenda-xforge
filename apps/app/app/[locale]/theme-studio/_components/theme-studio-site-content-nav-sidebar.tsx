"use client";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@repo/ui";
import {
  WORKSPACE_SHELL_SPACE,
  WORKSPACE_SHELL_TYPE,
} from "@repo/ui/components/compose/workspace";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";
import { SiteContentNavSidebar } from "../../../_components/workspace/site-content-nav-sidebar.tsx";
import { THEME_STUDIO_FEATURE_NAV } from "./theme-studio-rail.constants.ts";

export function ThemeStudioSiteContentNavSidebar(): ReactElement {
  return (
    <SiteContentNavSidebar label="Features">
      <SidebarMenu>
        {THEME_STUDIO_FEATURE_NAV.map((feature) => (
          <SidebarMenuItem key={feature.id}>
            <SidebarMenuButton
              className={cn(
                WORKSPACE_SHELL_SPACE.navRow,
                WORKSPACE_SHELL_TYPE.navItem
              )}
              tooltip={feature.label}
              type="button"
            >
              <feature.icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{feature.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SiteContentNavSidebar>
  );
}
