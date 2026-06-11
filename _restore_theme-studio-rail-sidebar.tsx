"use client";

import {
  WorkspaceAppSidebarContent,
  WorkspaceAppSidebarFooter,
  WorkspaceAppSidebarHeader,
  WorkspaceMemoryLane,
  WorkspaceNavUser,
  WorkspaceSidebarNavMain,
  WorkspaceSidebarNavSecondary,
  WorkspaceSidebarSectionLabel,
  WORKSPACE_SHELL_SPACE,
  WORKSPACE_SHELL_TYPE,
  computeWorkspaceOrbitLoad,
} from "@repo/ui/components/compose/workspace";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactElement } from "react";

import {
  THEME_STUDIO_ORBIT_LABELS,
  THEME_STUDIO_ORBIT_SEED,
} from "./theme-studio-orbit.constants.ts";
import { THEME_STUDIO_FEATURE_NAV } from "./theme-studio-rail.constants.ts";
import {
  isThemeStudioPathActive,
  THEME_STUDIO_PAGES,
} from "./theme-studio-routes.ts";

export function ThemeStudioRailSidebar(): ReactElement {
  const pathname = usePathname();
  const [labels, setLabels] = useState(THEME_STUDIO_ORBIT_LABELS);
  const [openCount, setOpenCount] = useState(THEME_STUDIO_ORBIT_SEED.openCount);
  const [urgentCount, setUrgentCount] = useState(THEME_STUDIO_ORBIT_SEED.urgentCount);

  const orbitLoad = useMemo(
    () => computeWorkspaceOrbitLoad({ openCount, urgentCount }),
    [openCount, urgentCount]
  );

  return (
    <>
      <WorkspaceAppSidebarHeader className="pb-2 pt-2">
        <WorkspaceMemoryLane
          labels={labels}
          onAddLabel={({ color, name }) => {
            setLabels((current) => [
              ...current,
              { color, id: `${name}-${Date.now()}`, name },
            ]);
          }}
          onAddTask={({ due }) => {
            setOpenCount((count) => count + 1);
            if (due) {
              setUrgentCount((count) => count + 1);
            }
          }}
          orbitLoad={orbitLoad}
        />
      </WorkspaceAppSidebarHeader>

      <WorkspaceAppSidebarContent className="gap-0 pt-0">
        <WorkspaceSidebarNavMain>
          <WorkspaceSidebarSectionLabel>Preview pages</WorkspaceSidebarSectionLabel>
          <div
            className={cn(
              WORKSPACE_SHELL_SPACE.sidebarLabelGap,
              WORKSPACE_SHELL_SPACE.navListGap
            )}
          >
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
                    >
                      <Link href={page.href}>
                        <span className="truncate">{page.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        </WorkspaceSidebarNavMain>

        <WorkspaceSidebarNavSecondary label="Features">
          <SidebarMenu>
            {THEME_STUDIO_FEATURE_NAV.map((feature) => (
              <SidebarMenuItem key={feature.id}>
                <SidebarMenuButton
                  className={cn(
                    WORKSPACE_SHELL_SPACE.navRow,
                    WORKSPACE_SHELL_TYPE.navItem
                  )}
                  type="button"
                >
                  <feature.icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{feature.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </WorkspaceSidebarNavSecondary>
      </WorkspaceAppSidebarContent>

      <WorkspaceAppSidebarFooter>
        <WorkspaceNavUser
          user={{
            avatar: null,
            email: "brand.lead@vietnamfeed.com",
            name: "Brand Lead",
          }}
        />
      </WorkspaceAppSidebarFooter>
    </>
  );
}
