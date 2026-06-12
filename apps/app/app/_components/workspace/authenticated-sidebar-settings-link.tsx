"use client";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@repo/ui";
import { Settings2 } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import type { ReactElement } from "react";
import { isPathActive } from "./path-utils.ts";

export function AuthenticatedSidebarSettingsLink(): ReactElement {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isPathActive(pathname, "/settings/appearance")}
          tooltip="Settings"
        >
          <Link href="/settings/appearance">
            <Settings2 />
            <span>Settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
