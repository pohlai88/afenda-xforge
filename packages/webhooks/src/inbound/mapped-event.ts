import type { WebhookRedactionPolicy } from "../outbound/delivery.ts";

export type MappedInboundWebhookEvent = Readonly<{
  applicationId?: string;
  applicationName?: string;
  eventId: string;
  eventType: string;
  occurredAt: string;
  payload: Record<string, unknown>;
  redactionPolicy: WebhookRedactionPolicy;
  schemaVersion: string;
}>;
