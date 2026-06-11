"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
import {
  buildEnterpriseDropdownGroupsFromMetadataActions,
  EnterpriseDropdownMenu,
  type EnterpriseDropdownMenuItem,
} from "@repo/metadata-ui/components";
import type {
  MetadataActionContract,
  MetadataRenderContext,
} from "@repo/metadata-ui/contracts";
import { createMetadataRenderContext } from "@repo/metadata-ui/contracts";
import {
  Activity,
  Bell,
  Keyboard,
  LogOut,
  MessageCircle,
} from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { AppNavTopbarThemeMenu } from "./app-nav-topbar-theme-menu.tsx";
import {
  appNavTopbarAvatarTriggerClassName,
  appNavTopbarGhostIconButtonClassName,
  appNavTopbarIconClassName,
} from "./app-nav-topbar-chrome.ts";

export type AppNavTopbarQuickAction = {
  icon: ReactNode;
  label: string;
};

export type AppNavTopbarActionsProps = {
  avatarUrl?: string | null;
  /** DIY nodes inserted after quick actions and before theme/user menus */
  children?: ReactNode;
  footerMenuItems?: readonly EnterpriseDropdownMenuItem[];
  logoutLoading?: boolean;
  onLogout?: () => void;
  onUserMenuAction?: (action: MetadataActionContract) => void;
  quickActions?: readonly AppNavTopbarQuickAction[];
  /** Replace the default persisted theme dropdown */
  themeMenu?: ReactNode;
  userEmail?: string;
  userMenu?: ReactNode;
  userMenuActions?: readonly MetadataActionContract[];
  userMenuContext?: MetadataRenderContext;
  userMenuIconForAction?: (action: MetadataActionContract) => ReactNode | undefined;
  userName?: string;
};

const DEFAULT_QUICK_ACTIONS: readonly AppNavTopbarQuickAction[] = [
  { icon: <Activity className={appNavTopbarIconClassName} />, label: "Network diagnosis" },
  { icon: <MessageCircle className={appNavTopbarIconClassName} />, label: "Messenger" },
  { icon: <Keyboard className={appNavTopbarIconClassName} />, label: "Keyboard shortcuts" },
  { icon: <Bell className={appNavTopbarIconClassName} />, label: "Notifications" },
];

export function AppNavTopbarIconButton({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}): ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={appNavTopbarGhostIconButtonClassName}
          size="icon"
          type="button"
          variant="ghost"
        >
          {children}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

function resolveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function AppNavTopbarUserMenu({
  avatarUrl,
  context,
  email = "",
  footerMenuItems,
  iconForAction,
  logoutLoading = false,
  menuActions = [],
  name = "User",
  onAction,
  onLogout,
}: {
  avatarUrl?: string | null;
  context: MetadataRenderContext;
  email?: string;
  footerMenuItems?: readonly EnterpriseDropdownMenuItem[];
  iconForAction?: (action: MetadataActionContract) => ReactNode | undefined;
  logoutLoading?: boolean;
  menuActions?: readonly MetadataActionContract[];
  name?: string;
  onAction?: (action: MetadataActionContract) => void;
  onLogout?: () => void;
}): ReactElement {
  const initials = resolveInitials(name);
  const groups = buildEnterpriseDropdownGroupsFromMetadataActions({
    actions: menuActions,
    context,
    iconForAction,
    onAction,
  });
  const footerItems: EnterpriseDropdownMenuItem[] = [
    ...(footerMenuItems ?? []),
    ...(onLogout
      ? [
          {
            destructive: true,
            disabled: logoutLoading,
            icon: <LogOut className={appNavTopbarIconClassName} />,
            key: "logout",
            label: logoutLoading ? "Signing out..." : "Log out",
            onSelect: () => {
              void onLogout();
            },
          } satisfies EnterpriseDropdownMenuItem,
        ]
      : []),
  ];

  return (
    <EnterpriseDropdownMenu
      footerItems={footerItems.length > 0 ? footerItems : undefined}
      groups={groups.length > 0 ? groups : undefined}
      header={{
        avatarFallback: initials,
        avatarUrl,
        subtitle: email,
        title: name,
      }}
      trigger={
        <Button
          aria-haspopup="menu"
          className={appNavTopbarAvatarTriggerClassName}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Avatar className="size-7 rounded-md">
            <AvatarImage alt={name} src={avatarUrl ?? undefined} />
            <AvatarFallback className="rounded-md text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="sr-only">{name}</span>
        </Button>
      }
    />
  );
}

export function AppNavTopbarActions({
  avatarUrl,
  children,
  footerMenuItems,
  logoutLoading,
  onLogout,
  onUserMenuAction,
  quickActions = DEFAULT_QUICK_ACTIONS,
  themeMenu,
  userEmail,
  userMenu,
  userMenuActions = [],
  userMenuContext,
  userMenuIconForAction,
  userName,
}: AppNavTopbarActionsProps = {}): ReactElement {
  const resolvedUserMenuContext =
    userMenuContext ??
    createMetadataRenderContext(
      { featureId: "workspace", tenantId: "tenant" },
      { mode: "read", surfaceId: "app-nav-topbar" }
    );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex shrink-0 items-center gap-0.5">
        {quickActions.map((action) => (
          <AppNavTopbarIconButton key={action.label} label={action.label}>
            {action.icon}
          </AppNavTopbarIconButton>
        ))}
        {children}
        {themeMenu ?? <AppNavTopbarThemeMenu />}
        {userMenu ?? (
          <AppNavTopbarUserMenu
            avatarUrl={avatarUrl}
            context={resolvedUserMenuContext}
            email={userEmail}
            footerMenuItems={footerMenuItems}
            iconForAction={userMenuIconForAction}
            logoutLoading={logoutLoading}
            menuActions={userMenuActions}
            name={userName}
            onAction={onUserMenuAction}
            onLogout={onLogout}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
