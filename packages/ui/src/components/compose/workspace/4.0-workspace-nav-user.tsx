"use client";

import {
  Bell,
  CircleUser,
  CreditCard,
  EllipsisVertical,
  LogOut,
} from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui-shadcn/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui-shadcn/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../ui-shadcn/sidebar";

export type WorkspaceNavUserProfile = {
  avatar?: string | null;
  email: string;
  name: string;
};

export type WorkspaceNavUserAction = {
  icon?: ReactNode;
  label: string;
  onSelect?: () => void;
};

export type WorkspaceNavUserProps = {
  actions?: readonly WorkspaceNavUserAction[];
  fallback?: string;
  logout?: ReactNode;
  logoutLabel?: string;
  logoutLoading?: boolean;
  menuItems?: ReactNode;
  onLogout?: () => void | Promise<void>;
  user: WorkspaceNavUserProfile;
};

const DEFAULT_ACTIONS: readonly WorkspaceNavUserAction[] = [
  { icon: <CircleUser className="size-4" />, label: "Account" },
  { icon: <CreditCard className="size-4" />, label: "Billing" },
  { icon: <Bell className="size-4" />, label: "Notifications" },
];

function resolveInitials(name: string, fallback?: string): string {
  if (fallback) {
    return fallback;
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0]?.slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function UserSummary({
  avatar,
  email,
  fallback,
  name,
}: WorkspaceNavUserProfile & { fallback: string }): ReactElement {
  return (
    <>
      <Avatar className="h-8 w-8 rounded-lg grayscale">
        <AvatarImage alt={name} src={avatar ?? undefined} />
        <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-muted-foreground text-xs">{email}</span>
      </div>
    </>
  );
}

export function WorkspaceNavUser({
  actions = DEFAULT_ACTIONS,
  fallback,
  logout,
  logoutLabel = "Log out",
  logoutLoading = false,
  menuItems,
  onLogout,
  user,
}: WorkspaceNavUserProps): ReactElement {
  const { isMobile } = useSidebar();
  const initials = resolveInitials(user.name, fallback);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <UserSummary {...user} fallback={initials} />
              <EllipsisVertical className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage alt={user.name} src={user.avatar ?? undefined} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-muted-foreground text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {menuItems ?? (
              <DropdownMenuGroup>
                {actions.map((action) => (
                  <DropdownMenuItem
                    key={action.label}
                    onSelect={(event) => {
                      if (!action.onSelect) {
                        return;
                      }

                      event.preventDefault();
                      action.onSelect();
                    }}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
            {logout || onLogout ? (
              <>
                <DropdownMenuSeparator />
                {logout ?? (
                  <DropdownMenuItem
                    disabled={logoutLoading}
                    onSelect={(event) => {
                      event.preventDefault();
                      void onLogout?.();
                    }}
                  >
                    <LogOut className="size-4" />
                    {logoutLoading ? "Signing out..." : logoutLabel}
                  </DropdownMenuItem>
                )}
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
