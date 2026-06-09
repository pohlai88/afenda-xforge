import "server-only";

import type { MappedInboundWebhookEvent } from "@repo/webhooks/inbound";
import type { WorkdayWebhookMappingInput } from "./types.ts";

const toRecord = (payload: unknown): Record<string, unknown> =>
  typeof payload === "object" && payload !== null
    ? (payload as Record<string, unknown>)
    : {
        payload,
      };

const normalizeSegment = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || fallback;
};

const resolveOccurredAt = (payload: Record<string, unknown>): string => {
  const occurredAt =
    payload.eventTime ?? payload.timestamp ?? payload.lastUpdated;

  return typeof occurredAt === "string" ? occurredAt : new Date().toISOString();
};

export const mapWorkdayWebhookEvent = ({
  applicationId,
  applicationName,
  eventId,
  payload,
  schemaVersion,
}: WorkdayWebhookMappingInput): MappedInboundWebhookEvent => {
  const normalizedPayload = toRecord(payload);
  const category = normalizeSegment(
    normalizedPayload.eventType ?? normalizedPayload.topic,
    "event"
  );
  const action = normalizeSegment(
    normalizedPayload.changeType ?? normalizedPayload.action,
    "received"
  );

  return {
    ...(applicationId ? { applicationId } : {}),
    ...(applicationName ? { applicationName } : {}),
    eventId,
    eventType: `workday.${category}.${action}.v1`,
    occurredAt: resolveOccurredAt(normalizedPayload),
    payload: normalizedPayload,
    redactionPolicy: "standard",
    schemaVersion,
  };
};
