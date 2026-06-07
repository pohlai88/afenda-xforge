"use client";

import type { ColorMode } from "@knocklabs/react";
import { KnockFeedProvider, KnockProvider } from "@knocklabs/react";
import type { ReactElement, ReactNode } from "react";
import { loadNotificationsKeys } from "../keys.js";

const knockKeys = loadNotificationsKeys();

interface NotificationsProviderProps {
  children: ReactNode;
  theme: ColorMode;
  userId: string;
}

export const NotificationsProvider = ({
  children,
  theme,
  userId,
}: NotificationsProviderProps): ReactElement | ReactNode => {
  const knockApiKey = knockKeys.NEXT_PUBLIC_KNOCK_API_KEY;
  const knockFeedChannelId = knockKeys.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;

  if (!(knockApiKey && knockFeedChannelId)) {
    return children;
  }

  return (
    <KnockProvider apiKey={knockApiKey} userId={userId}>
      <KnockFeedProvider colorMode={theme} feedId={knockFeedChannelId}>
        {children}
      </KnockFeedProvider>
    </KnockProvider>
  );
};
