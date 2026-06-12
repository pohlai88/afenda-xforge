"use client";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@repo/ui";
import type { ReactElement, ReactNode } from "react";

type SiteContentNavSidebarProps = {
  children: ReactNode;
  label?: ReactNode;
};

export function SiteContentNavSidebar({
  children,
  label = "Feature navigation",
}: SiteContentNavSidebarProps): ReactElement {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <SidebarGroupContent>{children}</SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
