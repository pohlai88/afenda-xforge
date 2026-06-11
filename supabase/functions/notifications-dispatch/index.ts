declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (request: Request) => Response | Promise<Response>): unknown;
};

type NotificationAudience = {
  readonly companyId?: string | null;
  readonly tenantId: string;
  readonly userId: string;
};

type NotificationEnvelope = {
  readonly audience: NotificationAudience;
  readonly event: string;
  readonly notificationId: string;
  readonly occurredAt: string;
  readonly payload: Record<string, unknown>;
};

type NotificationDispatchRequest = {
  readonly event: string;
  readonly notificationId?: string;
  readonly payload: Record<string, unknown>;
  readonly recipients: readonly NotificationAudience[];
};

type NotificationDispatchResult = {
  readonly deliveredTopics: readonly string[];
  readonly notificationId: string;
};

const DEFAULT_CHANNEL_PREFIX = "xforge:notifications";
const DEFAULT_EVENT_NAME = "notification";

const getChannelPrefix = (): string =>
  Deno.env.get("SUPABASE_NOTIFICATIONS_CHANNEL_PREFIX") ??
  DEFAULT_CHANNEL_PREFIX;

const normalizeSegment = (value: string): string => encodeURIComponent(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const assertNonEmptyString = (value: unknown, label: string): string => {
  if (!isNonEmptyString(value)) {
    throw new Error(`Invalid notification payload: ${label}`);
  }

  return value;
};

const normalizeCompanyId = (companyId: unknown): string | null | undefined => {
  if (companyId === undefined) {
    return;
  }

  if (companyId === null) {
    return null;
  }

  return assertNonEmptyString(companyId, "recipient companyId");
};

const parseNotificationDispatchRequest = (
  body: unknown
): NotificationDispatchRequest => {
  if (!isPlainRecord(body)) {
    throw new Error("Invalid notification payload");
  }

  const { event, notificationId, payload, recipients } = body;

  if (
    !(
      isNonEmptyString(event) &&
      isPlainRecord(payload) &&
      Array.isArray(recipients)
    ) ||
    recipients.length === 0
  ) {
    throw new Error("Invalid notification payload");
  }

  const normalizedRecipients: NotificationAudience[] = [];
  const seenRecipients = new Set<string>();

  for (const recipient of recipients) {
    if (!isPlainRecord(recipient)) {
      throw new Error("Invalid notification payload");
    }

    const { companyId, tenantId, userId } = recipient;

    if (
      !(
        isNonEmptyString(tenantId) &&
        isNonEmptyString(userId) &&
        (companyId === undefined ||
          companyId === null ||
          isNonEmptyString(companyId))
      )
    ) {
      throw new Error("Invalid notification payload");
    }

    const normalizedRecipient: NotificationAudience = {
      companyId: normalizeCompanyId(companyId),
      tenantId,
      userId,
    };
    const recipientKey = JSON.stringify([
      normalizedRecipient.tenantId,
      normalizedRecipient.companyId ?? null,
      normalizedRecipient.userId,
    ]);

    if (seenRecipients.has(recipientKey)) {
      continue;
    }

    seenRecipients.add(recipientKey);
    normalizedRecipients.push(normalizedRecipient);
  }

  return {
    event,
    notificationId: isNonEmptyString(notificationId)
      ? notificationId
      : undefined,
    payload,
    recipients: normalizedRecipients,
  };
};

const createRecipientNotificationsTopic = ({
  companyId,
  tenantId,
  userId,
}: NotificationAudience): string => {
  const segments = [getChannelPrefix(), "tenant", normalizeSegment(tenantId)];

  if (companyId) {
    segments.push("company", normalizeSegment(companyId));
  }

  segments.push("user", normalizeSegment(userId));

  return segments.join(":");
};

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!(supabaseUrl && serviceRoleKey)) {
    return new Response("Missing Supabase configuration", { status: 500 });
  }

  let dispatchRequest: NotificationDispatchRequest;

  try {
    dispatchRequest = parseNotificationDispatchRequest(await request.json());
  } catch {
    return new Response("Invalid notification payload", { status: 400 });
  }

  const resolvedNotificationId =
    dispatchRequest.notificationId ?? crypto.randomUUID();
  const occurredAt = new Date().toISOString();
  const messages = dispatchRequest.recipients.map((recipient) => ({
    event: DEFAULT_EVENT_NAME,
    payload: {
      audience: recipient,
      event: dispatchRequest.event,
      notificationId: resolvedNotificationId,
      occurredAt,
      payload: dispatchRequest.payload,
    } satisfies NotificationEnvelope,
    topic: createRecipientNotificationsTopic(recipient),
  }));

  const response = await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
    body: JSON.stringify({ messages }),
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    return new Response(await response.text(), { status: response.status });
  }

  const result: NotificationDispatchResult = {
    deliveredTopics: messages.map(({ topic }) => topic),
    notificationId: resolvedNotificationId,
  };

  return Response.json(result);
});
