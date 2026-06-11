"use client";

import { SignOut } from "@repo/auth/components/sign-out";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@repo/ui";
import { Badge } from "@repo/ui/components/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { AuthenticatedFeatureScope } from "./authenticated-feature-scope.tsx";
import { PersistedModeToggle } from "./persisted-mode-toggle.tsx";

type ShellNavItem = {
  featureId: string;
  href: string;
  label: string;
};

const PRIMARY_NAV: ShellNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    featureId: "system-admin.overview",
  },
  {
    href: "/assistant",
    label: "Assistant",
    featureId: "system-admin.overview",
  },
  {
    href: "/audit",
    label: "Audit",
    featureId: "system-admin.audit",
  },
  {
    href: "/hr",
    label: "HR hub",
    featureId: "hr-suite.employee-management.documents-management",
  },
  {
    href: "/hr/documents",
    label: "Documents",
    featureId: "hr-suite.employee-management.documents-management",
  },
];

const SETTINGS_NAV: ShellNavItem[] = [
  {
    href: "/settings/appearance",
    label: "My appearance",
    featureId: "system-admin.tenant-settings",
  },
  {
    href: "/admin/branding",
    label: "Tenant branding",
    featureId: "system-admin.tenant-settings",
  },
];

const ALL_NAV = [...PRIMARY_NAV, ...SETTINGS_NAV];

type AuthenticatedShellProps = {
  children: ReactNode;
};

function resolveActiveFeatureId(pathname: string): string {
  const match = ALL_NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return match?.featureId ?? "system-admin.overview";
}

export function AuthenticatedShell({
  children,
}: AuthenticatedShellProps): ReactElement {
  const pathname = usePathname();
  const activeFeatureId = resolveActiveFeatureId(pathname);

  return (
    <SidebarProvider>
      <AuthenticatedFeatureScope featureId={activeFeatureId}>
        <Sidebar collapsible="icon" variant="inset">
          <SidebarHeader className="border-sidebar-border border-b px-4 py-4">
            <div className="space-y-2">
              <Badge variant="lane">Afenda XForge</Badge>
              <p className="font-semibold text-sm tracking-tight">Workspace</p>
              <p className="text-muted-foreground text-xs">
                Lane accents follow the active module
              </p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Modules</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {PRIMARY_NAV.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          pathname === item.href ||
                          pathname.startsWith(`${item.href}/`)
                        }
                      >
                        <Link href={item.href}>{item.label}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Theme</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {SETTINGS_NAV.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          pathname === item.href ||
                          pathname.startsWith(`${item.href}/`)
                        }
                      >
                        <Link href={item.href}>{item.label}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-sidebar-border border-t p-2">
            <SignOut />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
      </AuthenticatedFeatureScope>
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-border border-b px-4">
          <SidebarTrigger />
          <p className="text-muted-foreground text-sm">
            Authenticated workspace
          </p>
          <div className="ms-auto">
            <PersistedModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-8 p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
