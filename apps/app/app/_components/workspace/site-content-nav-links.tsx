"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { Link } from "@/i18n/navigation";
import type { ReactElement } from "react";
import type { HrSuiteSiteNavItem } from "./hr-suite-site-nav.ts";

type SiteContentNavLinksProps = {
  activeFeatureId: string;
  items: readonly HrSuiteSiteNavItem[];
  onSelect: (featureId: string) => void;
};

export function SiteContentNavLinks({
  activeFeatureId,
  items,
  onSelect,
}: SiteContentNavLinksProps): ReactElement {
  return (
    <SidebarMenu className="min-w-0">
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeFeatureId === item.featureId;

        return (
          <SidebarMenuItem key={item.featureId}>
            {item.liveHref ? (
              <SidebarMenuButton
                asChild
                className="data-[active=true]:border-l-0 data-[active=true]:shadow-none"
                isActive={active}
                tooltip={item.description ?? item.label}
              >
                <Link
                  href={item.liveHref}
                  onClick={() => onSelect(item.featureId)}
                >
                  <Icon />
                  <span className="truncate">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                className={cn(
                  "data-[active=true]:border-l-0 data-[active=true]:shadow-none",
                  active && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                isActive={active}
                onClick={() => onSelect(item.featureId)}
                tooltip={item.description ?? item.label}
                type="button"
              >
                <Icon />
                <span className="truncate">{item.label}</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
