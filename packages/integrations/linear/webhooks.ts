import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { MappedInboundWebhookEvent } from "@repo/webhooks/inbound";
import { loadLinearKeys } from "./keys.ts";
import type {
  LinearWebhookMappingInput,
  LinearWebhookVerificationInput,
} from "./types.ts";

const DEFAULT_MAX_SKEW_MS = 60_000;

const toBuffer = (value: string | Uint8Array): Buffer =>
  typeof value === "string" ? Buffer.from(value, "utf8") : Buffer.from(value);

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
    payload.createdAt ?? payload.updatedAt ?? payload.timestamp;

  return typeof occurredAt === "string" ? occurredAt : new Date().toISOString();
};

export const verifyLinearWebhookSignature = ({
  maxSkewMs = DEFAULT_MAX_SKEW_MS,
  now = Date.now(),
  rawBody,
  secret,
  signature,
  webhookTimestamp,
}: LinearWebhookVerificationInput): boolean => {
  if (!signature) {
    return false;
  }

  if (
    typeof webhookTimestamp === "number" &&
    Math.abs(now - webhookTimestamp) > maxSkewMs
  ) {
    return false;
  }

  const headerSignature = Buffer.from(signature, "hex");
  const computedSignature = createHmac("sha256", secret)
    .update(toBuffer(rawBody))
    .digest();

  try {
    return timingSafeEqual(computedSignature, headerSignature);
  } catch {
    return false;
  }
};

export const assertLinearWebhookSignature = ({
  secret = loadLinearKeys().LINEAR_WEBHOOK_SECRET,
  ...input
}: Omit<LinearWebhookVerificationInput, "secret"> & {
  secret?: string;
}): void => {
  if (!secret) {
    throw new Error("LINEAR_WEBHOOK_SECRET is not set");
  }

  if (!verifyLinearWebhookSignature({ ...input, secret })) {
    throw new Error("Linear webhook verification failed");
  }
};

export const mapLinearWebhookEvent = ({
  applicationId,
  applicationName,
  eventId,
  payload,
  schemaVersion,
}: LinearWebhookMappingInput): MappedInboundWebhookEvent => {
  const normalizedPayload = toRecord(payload);
  const action = normalizeSegment(normalizedPayload.action, "received");
  const entity = normalizeSegment(
    normalizedPayload.type ?? normalizedPayload.object,
    "event"
  );

  return {
    ...(applicationId ? { applicationId } : {}),
    ...(applicationName ? { applicationName } : {}),
    eventId,
    eventType: `linear.${entity}.${action}.v1`,
    occurredAt: resolveOccurredAt(normalizedPayload),
    payload: normalizedPayload,
    redactionPolicy: "standard",
    schemaVersion,
  };
};
