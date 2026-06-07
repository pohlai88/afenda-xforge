export type NotificationAudience = {
  readonly companyId?: string | null;
  readonly tenantId: string;
  readonly userId: string;
};

export type NotificationEnvelope<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> = {
  readonly audience: NotificationAudience;
  readonly event: string;
  readonly notificationId: string;
  readonly occurredAt: string;
  readonly payload: TPayload;
};

export type NotificationDispatchRequest<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> = {
  readonly event: string;
  readonly notificationId?: string;
  readonly payload: TPayload;
  readonly recipients: readonly NotificationAudience[];
};

export type NotificationDispatchResult = {
  readonly deliveredTopics: readonly string[];
  readonly notificationId: string;
};

export type NotificationInboxEntry<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> = {
  readonly archivedAt: string | null;
  readonly companyId: string | null;
  readonly createdAt: string;
  readonly dispatchedAt: string;
  readonly event: string;
  readonly id: string;
  readonly notificationId: string;
  readonly payload: TPayload;
  readonly readAt: string | null;
  readonly seenAt: string | null;
  readonly tenantId: string;
  readonly topic: string;
  readonly updatedAt: string;
  readonly userId: string;
};

export type NotificationInboxListResult<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> = {
  readonly items: readonly NotificationInboxEntry<TPayload>[];
  readonly unreadCount: number;
};

export type PersistAndDispatchNotificationsResult<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> = {
  readonly dispatch: NotificationDispatchResult | null;
  readonly items: readonly NotificationInboxEntry<TPayload>[];
  readonly notificationId: string;
};
