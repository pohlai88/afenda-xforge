"use client";

import { useAuthClient } from "@repo/auth";
import type { MetadataActionContract } from "@repo/metadata-ui/contracts";
import { Bell, CircleUser, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";
import { createAppMetadataContext } from "../_lib/metadata-context.ts";
import { useTenantBranding } from "./tenant-branding-context.tsx";
import { AppNavTopbarActions } from "./workspace/app-nav-topbar-actions.tsx";
import { appNavTopbarIconClassName } from "./workspace/app-nav-topbar-chrome.ts";

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState("anonymous");

  useEffect(() => {
    let cancelled = false;

    void client.auth.getUser().then(({ data }) => {
      if (cancelled || !data.user) {
        return;
      }

      const metadata = data.user.user_metadata as Record<string, unknown> | null;
      const fullName =
        typeof metadata?.full_name === "string" ? metadata.full_name : undefined;
      const avatar =
        typeof metadata?.avatar_url === "string" ? metadata.avatar_url : null;

      setName(fullName ?? data.user.email?.split("@")[0] ?? "User");
      setEmail(data.user.email ?? "");
      setAvatarUrl(avatar);
      setUserId(data.user.id);
    });

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
    if (action.key === "account") {
      router.push("/settings/appearance");
    }
  };

  return (
    <AppNavTopbarActions
      avatarUrl={avatarUrl}
      logoutLoading={logoutLoading}
      onLogout={handleLogout}
      onUserMenuAction={handleUserMenuAction}
      userEmail={email}
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
