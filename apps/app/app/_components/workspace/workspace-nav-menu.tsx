"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@repo/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { Fragment } from "react";
import { isPathActive } from "./path-utils.ts";
import type { WorkspaceNavGroup } from "./types.ts";

type WorkspaceNavMenuProps = {
  groups: readonly WorkspaceNavGroup[];
};

export function WorkspaceNavMenu({
  groups,
}: WorkspaceNavMenuProps): ReactElement {
  const pathname = usePathname();

  return (
    <>
      {groups.map((group, index) => (
        <Fragment key={group.label}>
          {index > 0 ? <SidebarSeparator /> : null}
          <SidebarGroup>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isPathActive(pathname, item.href)}
                    >
                      <Link href={item.href}>{item.label}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Fragment>
      ))}
    </>
  );
}
