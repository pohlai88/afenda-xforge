"use client";

import type {
  EnterpriseDropdownMenuItem,
  MetadataActionContract,
  MetadataRenderContext,
} from "@repo/metadata-ui/contracts";
import { createMetadataRenderContext } from "@repo/metadata-ui/contracts";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
import { Activity, Bell, Keyboard, MessageCircle } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { AppNavTopbarActionsMenu } from "./app-nav-topbar-actions-menu.tsx";
import {
  appNavTopbarGhostIconButtonClassName,
  appNavTopbarIconClassName,
} from "./app-nav-topbar-chrome.ts";
import type { AppNavTopbarNavActionGroup } from "./app-nav-topbar-nav-actions.tsx";
import { AppNavTopbarThemeMenu } from "./app-nav-topbar-theme-menu.tsx";

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
  navActionGroups?: readonly AppNavTopbarNavActionGroup[];
  notificationsMenu?: ReactNode;
  onLogout?: () => void;
  onUserMenuAction?: (action: MetadataActionContract) => void;
  quickActions?: readonly AppNavTopbarQuickAction[];
  onKeyboardShortcutsClick?: () => void;
  /** Replace the default persisted theme dropdown */
  themeMenu?: ReactNode;
  userEmail?: string;
  userMenu?: ReactNode;
  userMenuActions?: readonly MetadataActionContract[];
  userMenuContext?: MetadataRenderContext;
  userMenuIconForAction?: (
    action: MetadataActionContract
  ) => ReactNode | undefined;
  userName?: string;
};

const DEFAULT_QUICK_ACTIONS: readonly AppNavTopbarQuickAction[] = [
  {
    icon: <Activity className={appNavTopbarIconClassName} />,
    label: "Network diagnosis",
  },
  {
    icon: <MessageCircle className={appNavTopbarIconClassName} />,
    label: "Messenger",
  },
  {
    icon: <Keyboard className={appNavTopbarIconClassName} />,
    label: "Keyboard shortcuts",
  },
];

export function AppNavTopbarIconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
}): ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={appNavTopbarGhostIconButtonClassName}
          onClick={onClick}
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

export function AppNavTopbarActions({
  children,
  footerMenuItems,
  logoutLoading,
  navActionGroups,
  notificationsMenu,
  onKeyboardShortcutsClick,
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
          <AppNavTopbarIconButton
            key={action.label}
            label={action.label}
            onClick={
              action.label === "Keyboard shortcuts"
                ? onKeyboardShortcutsClick
                : undefined
            }
          >
            {action.icon}
          </AppNavTopbarIconButton>
        ))}
        {notificationsMenu ?? (
          <AppNavTopbarIconButton label="Notifications">
            <Bell className={appNavTopbarIconClassName} />
          </AppNavTopbarIconButton>
        )}
        {children}
        {themeMenu ?? <AppNavTopbarThemeMenu />}
        {userMenu ?? (
          <AppNavTopbarActionsMenu
            email={userEmail}
            footerMenuItems={footerMenuItems}
            groups={navActionGroups}
            iconForAction={userMenuIconForAction}
            logoutLoading={logoutLoading}
            menuActions={userMenuActions}
            menuContext={resolvedUserMenuContext}
            name={userName}
            onAction={onUserMenuAction}
            onLogout={onLogout}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
