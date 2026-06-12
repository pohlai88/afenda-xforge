"use client";

import { useAuthClient } from "@repo/auth/provider";
import type { WorkspaceNavUserProfile } from "@repo/ui/components/compose/workspace";
import { WorkspaceNavUser } from "@repo/ui/components/compose/workspace";
import { Bell, CircleUser, CreditCard } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";

const LOADING_USER: WorkspaceNavUserProfile = {
  name: "Loading...",
  email: "Please wait",
  avatar: null,
};

export function AuthenticatedNavUser(): ReactElement {
  const client = useAuthClient();
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [user, setUser] = useState<WorkspaceNavUserProfile>(LOADING_USER);

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
        const avatarUrl =
          typeof metadata?.avatar_url === "string" ? metadata.avatar_url : null;

        setUser({
          name: fullName ?? data.user.email?.split("@")[0] ?? "User",
          email: data.user.email ?? "",
          avatar: avatarUrl,
        });
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

  return (
    <WorkspaceNavUser
      actions={[
        {
          icon: <CircleUser className="size-4" />,
          label: "Account",
          onSelect: () => {
            router.push("/settings/appearance");
          },
        },
        {
          icon: <CreditCard className="size-4" />,
          label: "Billing",
        },
        {
          icon: <Bell className="size-4" />,
          label: "Notifications",
        },
      ]}
      logoutLoading={logoutLoading}
      onLogout={handleLogout}
      user={user}
    />
  );
}
