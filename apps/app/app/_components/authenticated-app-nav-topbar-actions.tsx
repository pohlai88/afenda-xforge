"use client";

import { useAuthClient } from "@repo/auth/provider";
import type { MetadataActionContract } from "@repo/metadata-ui/contracts";
import { Bell, CircleUser, CreditCard } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createAppMetadataContext } from "../_lib/metadata-context.ts";
import { useTenantBranding } from "./tenant-branding-context.tsx";
import { AppNavTopbarActions } from "./workspace/app-nav-topbar-actions.tsx";
import { AppNavTopbarNotifications } from "./workspace/app-nav-topbar-notifications.tsx";
import { useWorkspaceShortcuts } from "./workspace/keyboard-shortcuts/use-keyboard-shortcuts.tsx";
import { appNavTopbarIconClassName } from "./workspace/workspace-shell.classes.ts";

const USER_MENU_ICONS: Record<string, ReactNode> = {
  account: <CircleUser className={appNavTopbarIconClassName} />,
  billing: <CreditCard className={appNavTopbarIconClassName} />,
  notifications: <Bell className={appNavTopbarIconClassName} />,
};

export function AuthenticatedAppNavTopbarActions(): ReactElement {
  const client = useAuthClient();
  const router = useRouter();
  const { tenantId } = useTenantBranding();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [name, setName] = useState("User");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("anonymous");

  useEffect(() => {
    let cancelled = false;

    client.auth
      .getUser()
      .then(({ data }) => {
        if (cancelled || !data.user) {
          return;
        }

        const metadata = data.user.user_metadata as Record<
          string,
          unknown
        > | null;
        const fullName =
          typeof metadata?.full_name === "string"
            ? metadata.full_name
            : undefined;
        setName(fullName ?? data.user.email?.split("@")[0] ?? "User");
        setEmail(data.user.email ?? "");
        setUserId(data.user.id);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [client]);

  const handleLogout = async (): Promise<void> => {
    setLogoutLoading(true);

    try {
      await client.auth.signOut();
      router.replace("/sign-in");
    } finally {
      setLogoutLoading(false);
    }
  };

  const userMenuActions: readonly MetadataActionContract[] = [
    {
      key: "account",
      kind: "custom",
      label: "Account",
      surface: "menu",
    },
    {
      key: "billing",
      kind: "custom",
      label: "Billing",
      surface: "menu",
    },
    {
      key: "notifications",
      kind: "custom",
      label: "Notifications",
      surface: "menu",
    },
  ];

  const handleUserMenuAction = (action: MetadataActionContract): void => {
    if (action.key === "account" || action.key === "notifications") {
      router.push("/settings/appearance");
    }
  };

  const { openHelp } = useWorkspaceShortcuts();

  return (
    <AppNavTopbarActions
      logoutLoading={logoutLoading}
      notificationsMenu={
        <AppNavTopbarNotifications tenantId={tenantId} userId={userId} />
      }
      onHelpClick={openHelp}
      onLogout={handleLogout}
      onUserMenuAction={handleUserMenuAction}
      tenantId={tenantId}
      userEmail={email}
      userId={userId}
      userMenuActions={userMenuActions}
      userMenuContext={createAppMetadataContext({
        featureId: "workspace",
        tenantId,
        userId,
      })}
      userMenuIconForAction={(action) => USER_MENU_ICONS[action.key]}
      userName={name}
    />
  );
}
