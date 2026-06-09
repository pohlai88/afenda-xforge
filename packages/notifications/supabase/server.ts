import "server-only";

import { createClient } from "@supabase/supabase-js";
import type {
  NotificationDispatchRequest,
  NotificationDispatchResult,
} from "../shared/types.ts";
import { loadSupabaseNotificationsKeys } from "./keys.ts";
import { normalizeNotificationDispatchRequest } from "./request.ts";

const DEFAULT_EDGE_FUNCTION_NAME = "notifications-dispatch";

type SupabaseNotificationsConfig = {
  readonly functionName: string;
  readonly serviceRoleKey: string;
  readonly url: string;
};

type AdminNotificationsClient = ReturnType<typeof createClient>;

let cachedAdminNotificationsClient: AdminNotificationsClient | null = null;

const getSupabaseNotificationsConfig =
  (): SupabaseNotificationsConfig | null => {
    const {
      NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_NOTIFICATIONS_EDGE_FUNCTION,
      SUPABASE_SERVICE_ROLE_KEY,
    } = loadSupabaseNotificationsKeys();

    if (!(NEXT_PUBLIC_SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)) {
      return null;
    }

    return {
      functionName:
        SUPABASE_NOTIFICATIONS_EDGE_FUNCTION ?? DEFAULT_EDGE_FUNCTION_NAME,
      serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
      url: NEXT_PUBLIC_SUPABASE_URL,
    };
  };

export const createSupabaseNotificationsAdminClient =
  (): AdminNotificationsClient | null => {
    const config = getSupabaseNotificationsConfig();

    if (!config) {
      return null;
    }

    cachedAdminNotificationsClient ??= createClient(
      config.url,
      config.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    return cachedAdminNotificationsClient;
  };

export const invokeSupabaseNotificationsDispatch = async <
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>(
  request: NotificationDispatchRequest<TPayload>
): Promise<NotificationDispatchResult | null> => {
  const normalizedRequest = normalizeNotificationDispatchRequest(request);
  const supabase = createSupabaseNotificationsAdminClient();
  const config = getSupabaseNotificationsConfig();

  if (!(supabase && config)) {
    return null;
  }

  const { data, error } =
    await supabase.functions.invoke<NotificationDispatchResult>(
      config.functionName,
      {
        body: normalizedRequest,
      }
    );

  if (error) {
    console.error("Supabase notifications dispatch failed", {
      error,
      functionName: config.functionName,
    });
    return null;
  }

  return data ?? null;
};
