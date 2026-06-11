"use client";

import type {
  EnterpriseDropdownMenuItem,
  MetadataActionContract,
  MetadataRenderContext,
} from "@repo/metadata-ui/contracts";
import { createMetadataRenderContext } from "@repo/metadata-ui/contracts";
import { TooltipProvider } from "@repo/ui";
import type { ReactElement, ReactNode } from "react";
import { AppNavTopbarActionsMenu } from "./app-nav-topbar-actions-menu.tsx";
import type { AppNavTopbarNavActionGroup } from "./app-nav-topbar-nav-actions.tsx";
import { AppNavTopbarThemeMenu } from "./app-nav-topbar-theme-menu.tsx";
import {
  AppNavTopbarUtilitiesProvider,
  AppNavTopbarUtilitiesWidgetMenu,
  AppNavTopbarUtilityActions,
} from "./app-nav-topbar-utility-actions.tsx";

export type AppNavTopbarActionsProps = {
  /** DIY nodes inserted after utility actions and before theme/user menus */
  children?: ReactNode;
  footerMenuItems?: readonly EnterpriseDropdownMenuItem[];
  logoutLoading?: boolean;
  navActionGroups?: readonly AppNavTopbarNavActionGroup[];
  notificationsMenu?: ReactNode;
  onHelpClick?: () => void;
  onLogout?: () => void;
  onUserMenuAction?: (action: MetadataActionContract) => void;
  previewUtilities?: boolean;
  tenantId?: string;
  userId?: string;
  themeMenu?: ReactNode;
  userEmail?: string;
  userMenu?: ReactNode;
  userMenuActions?: readonly MetadataActionContract[];
  userMenuContext?: MetadataRenderContext;
  userMenuIconForAction?: (
    action: MetadataActionContract
  ) => ReactNode | undefined;
  userName?: string;
  utilityActions?: ReactNode;
};

export function AppNavTopbarActions({
  children,
  footerMenuItems,
  logoutLoading,
  navActionGroups,
  notificationsMenu,
  onHelpClick,
  onLogout,
  onUserMenuAction,
  previewUtilities = false,
  tenantId,
  userId,
  themeMenu,
  userEmail,
  userMenu,
  userMenuActions = [],
  userMenuContext,
  userMenuIconForAction,
  userName,
  utilityActions,
}: AppNavTopbarActionsProps = {}): ReactElement {
  const resolvedUserMenuContext =
    userMenuContext ??
    createMetadataRenderContext(
      { featureId: "workspace", tenantId: "tenant" },
      { mode: "read", surfaceId: "app-nav-topbar" }
    );

  const topbarActions = (
  <>
    {utilityActions ?? <AppNavTopbarUtilityActions />}
    {utilityActions ? notificationsMenu : null}
    {children}
    {themeMenu ?? <AppNavTopbarThemeMenu />}
    {utilityActions ? null : <AppNavTopbarUtilitiesWidgetMenu />}
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
  </>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex shrink-0 items-center gap-0.5">
        {utilityActions ? (
          topbarActions
        ) : (
          <AppNavTopbarUtilitiesProvider
            onHelpClick={onHelpClick}
            preview={previewUtilities}
            tenantId={tenantId}
            userId={userId}
          >
            {topbarActions}
          </AppNavTopbarUtilitiesProvider>
        )}
      </div>
    </TooltipProvider>
  );
}
