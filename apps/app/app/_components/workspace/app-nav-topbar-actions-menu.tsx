"use client";

import { buildEnterpriseDropdownGroupsFromMetadataActions } from "@repo/metadata-ui/components";
import type {
  EnterpriseDropdownMenuGroup,
  EnterpriseDropdownMenuItem,
  MetadataActionContract,
  MetadataRenderContext,
} from "@repo/metadata-ui/contracts";
import { LogOut } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import { appNavTopbarIconClassName } from "./app-nav-topbar-chrome.ts";
import type {
  AppNavTopbarNavActionGroup,
  AppNavTopbarNavActionItem,
} from "./app-nav-topbar-nav-actions.tsx";
import { AppNavTopbarNavActions } from "./app-nav-topbar-nav-actions.tsx";

export type AppNavTopbarActionsMenuProps = {
  email?: string;
  footerMenuItems?: readonly EnterpriseDropdownMenuItem[];
  groups?: readonly AppNavTopbarNavActionGroup[];
  iconForAction?: (action: MetadataActionContract) => ReactNode | undefined;
  logoutLoading?: boolean;
  menuActions?: readonly MetadataActionContract[];
  menuContext: MetadataRenderContext;
  name?: string;
  onAction?: (action: MetadataActionContract) => void;
  onLogout?: () => void;
  triggerLabel?: string;
};

function enterpriseItemToNavAction(
  item: EnterpriseDropdownMenuItem
): AppNavTopbarNavActionItem {
  return {
    destructive: item.destructive,
    disabled: item.disabled,
    icon: item.icon,
    key: item.key,
    label: item.label,
    onSelect: item.onSelect,
  };
}

function enterpriseGroupsToNavGroups(
  groups: readonly EnterpriseDropdownMenuGroup[]
): AppNavTopbarNavActionGroup[] {
  return groups.map((group) => ({
    key: group.key,
    label: group.label,
    items: group.items.map(enterpriseItemToNavAction),
  }));
}

export function AppNavTopbarActionsMenu({
  email = "",
  footerMenuItems,
  groups: groupsProp,
  iconForAction,
  logoutLoading = false,
  menuActions = [],
  menuContext,
  name = "User",
  onAction,
  onLogout,
  triggerLabel = "Actions",
}: AppNavTopbarActionsMenuProps): ReactElement {
  const metadataGroups = buildEnterpriseDropdownGroupsFromMetadataActions({
    actions: menuActions,
    context: menuContext,
    iconForAction,
    onAction,
  });

  const footerItems: EnterpriseDropdownMenuItem[] = useMemo(
    () => [
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
                onLogout();
              },
            } satisfies EnterpriseDropdownMenuItem,
          ]
        : []),
    ],
    [footerMenuItems, logoutLoading, onLogout]
  );

  const resolvedGroups =
    groupsProp ??
    enterpriseGroupsToNavGroups([
      ...metadataGroups,
      ...(footerItems.length > 0
        ? [{ key: "footer-actions", items: footerItems }]
        : []),
    ]);

  return (
    <AppNavTopbarNavActions
      groups={resolvedGroups}
      header={{ email, name }}
      triggerLabel={triggerLabel}
    />
  );
}
