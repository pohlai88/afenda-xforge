import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { loadLinearKeys } from "./keys.ts";
import type { LinearWebhookVerificationInput } from "./types.ts";

const DEFAULT_MAX_SKEW_MS = 60_000;

const toBuffer = (value: string | Uint8Array): Buffer =>
  typeof value === "string" ? Buffer.from(value, "utf8") : Buffer.from(value);

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
