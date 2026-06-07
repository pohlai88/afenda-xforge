import type { NotificationAudience } from "../shared/types.ts";
import { loadSupabaseNotificationsKeys } from "./keys.ts";

const DEFAULT_CHANNEL_PREFIX = "xforge:notifications";

const normalizeSegment = (value: string): string => encodeURIComponent(value);

export const getSupabaseNotificationsChannelPrefix = (): string =>
  loadSupabaseNotificationsKeys()
    .NEXT_PUBLIC_SUPABASE_NOTIFICATIONS_CHANNEL_PREFIX ??
  DEFAULT_CHANNEL_PREFIX;

export const createTenantNotificationsTopic = ({
  companyId,
  tenantId,
}: {
  readonly companyId?: string | null;
  readonly tenantId: string;
}): string => {
  const segments = [
    getSupabaseNotificationsChannelPrefix(),
    "tenant",
    normalizeSegment(tenantId),
  ];

  if (companyId) {
    segments.push("company", normalizeSegment(companyId));
  }

  return segments.join(":");
};

export const createRecipientNotificationsTopic = ({
  companyId,
  tenantId,
  userId,
}: NotificationAudience): string =>
  [
    createTenantNotificationsTopic({ companyId, tenantId }),
    "user",
    normalizeSegment(userId),
  ].join(":");
