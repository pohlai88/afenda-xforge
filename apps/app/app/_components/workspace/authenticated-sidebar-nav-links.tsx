"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { isPathActive } from "./path-utils.ts";
import type { WorkspaceNavItem } from "./types.ts";

type AuthenticatedSidebarNavLinksProps = {
  items: readonly WorkspaceNavItem[];
};

export function AuthenticatedSidebarNavLinks({
  items,
}: AuthenticatedSidebarNavLinksProps): ReactElement {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isPathActive(pathname, item.href);

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={item.description ?? item.label}
            >
              <Link href={item.href}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
