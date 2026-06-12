"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui";
import { Link, usePathname } from "@/i18n/navigation";
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
              className="h-7 gap-1.5 px-2 text-[10px] leading-4 data-[active=true]:border-l-0 data-[active=true]:shadow-none"
              isActive={active}
              tooltip={item.description ?? item.label}
            >
              <Link href={item.href}>
                <Icon />
                <span className="truncate">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
