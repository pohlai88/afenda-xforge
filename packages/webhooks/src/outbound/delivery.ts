import type { WebhookPayload } from "../contract.ts";

export type WebhookRedactionPolicy = "sensitive" | "standard";

export type WebhookEnvelope = Readonly<{
  companyId?: string;
  eventId: string;
  eventType: string;
  occurredAt: string;
  operationId: string;
  organizationId?: string;
  payload: WebhookPayload;
  redactionPolicy: WebhookRedactionPolicy;
  requestId: string;
  schemaVersion: string;
  tenantId: string;
  workspaceId?: string;
}>;

export const validateWebhookEnvelope = (
  envelope: WebhookEnvelope
): WebhookEnvelope => {
  if (!envelope.eventId) {
    throw new Error("Webhook envelope eventId is required");
  }

  if (!envelope.eventType) {
    throw new Error("Webhook envelope eventType is required");
  }

  if (!envelope.tenantId) {
    throw new Error("Webhook envelope tenantId is required");
  }

  if (!envelope.operationId) {
    throw new Error("Webhook envelope operationId is required");
  }

  if (!envelope.requestId) {
    throw new Error("Webhook envelope requestId is required");
  }

  if (!envelope.schemaVersion) {
    throw new Error("Webhook envelope schemaVersion is required");
  }

  return envelope;
};
