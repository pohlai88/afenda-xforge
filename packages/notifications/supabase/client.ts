"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type {
  NotificationAudience,
  NotificationEnvelope,
} from "../shared/types.ts";
import { loadSupabaseNotificationsKeys } from "./keys.ts";
import { createRecipientNotificationsTopic } from "./topics.ts";

type BrowserNotificationsClient = ReturnType<typeof createBrowserClient>;

let cachedBrowserNotificationsClient: BrowserNotificationsClient | null = null;

export const createSupabaseNotificationsBrowserClient =
  (): BrowserNotificationsClient | null => {
    const { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_URL } =
      loadSupabaseNotificationsKeys();

    if (!(NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && NEXT_PUBLIC_SUPABASE_URL)) {
      return null;
    }

    cachedBrowserNotificationsClient ??= createBrowserClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    return cachedBrowserNotificationsClient;
  };

export const subscribeToRecipientNotifications = <
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>({
  event = "notification",
  onMessage,
  recipient,
}: {
  readonly event?: string;
  readonly onMessage: (message: NotificationEnvelope<TPayload>) => void;
  readonly recipient: NotificationAudience;
}): RealtimeChannel | null => {
  const supabase = createSupabaseNotificationsBrowserClient();

  if (!supabase) {
    return null;
  }

  const channel = supabase.channel(
    createRecipientNotificationsTopic(recipient),
    {
      config: {
        private: true,
      },
    }
  );

  channel
    .on("broadcast", { event }, (payload: { payload: unknown }) => {
      onMessage(payload.payload as NotificationEnvelope<TPayload>);
    })
    .subscribe();

  return channel;
};

export const unsubscribeFromRecipientNotifications = async (
  channel: RealtimeChannel | null | undefined
): Promise<void> => {
  if (!channel) {
    return;
  }

  const supabase = createSupabaseNotificationsBrowserClient();

  if (!supabase) {
    return;
  }

  await supabase.removeChannel(channel);
};
