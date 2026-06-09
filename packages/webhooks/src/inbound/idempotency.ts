import { createHash } from "node:crypto";

export const deriveIdempotencyKey = (
  provider: string,
  providerEventId: string,
  tenantId: string,
  eventType: string
): string =>
  createHash("sha256")
    .update(`${provider}:${providerEventId}:${tenantId}:${eventType}`)
    .digest("hex");
