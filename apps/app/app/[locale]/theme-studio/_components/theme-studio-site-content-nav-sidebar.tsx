"use client";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@repo/ui";
import {
  WORKSPACE_SHELL_SPACE,
  WORKSPACE_SHELL_TYPE,
  WorkspaceSidebarSectionLabel,
} from "@repo/ui/components/compose/workspace";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

import { SiteContentNavSidebar } from "../../../_components/workspace/site-content-nav-sidebar.tsx";
import { THEME_STUDIO_FEATURE_NAV } from "./theme-studio-rail.constants.ts";
import {
  isThemeStudioPathActive,
  THEME_STUDIO_PAGES,
} from "./theme-studio-routes.ts";

export function ThemeStudioSiteContentNavSidebar(): ReactElement {
  const pathname = usePathname();

  return (
    <SiteContentNavSidebar label="Dev block 1">
      <div
        className={cn(
          WORKSPACE_SHELL_SPACE.sidebarLabelGap,
          WORKSPACE_SHELL_SPACE.navListGap
        )}
      >
        <WorkspaceSidebarSectionLabel>Preview surfaces</WorkspaceSidebarSectionLabel>
        <SidebarMenu>
          {THEME_STUDIO_PAGES.map((page) => {
            const isActive = isThemeStudioPathActive(pathname, page.href);

            return (
              <SidebarMenuItem key={page.slug}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    WORKSPACE_SHELL_SPACE.navRow,
                    isActive
                      ? WORKSPACE_SHELL_TYPE.navItemActive
                      : WORKSPACE_SHELL_TYPE.navItem
                  )}
                  isActive={isActive}
                  tooltip={page.description}
                >
                  <Link href={page.href}>
                    <span className="truncate">{page.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <WorkspaceSidebarSectionLabel>Token & lane work</WorkspaceSidebarSectionLabel>
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
      </div>
    </SiteContentNavSidebar>
  );
}
