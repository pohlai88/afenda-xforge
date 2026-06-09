import { verifyHmacSignature } from "../security/signatures.ts";
import type { InboundWebhookEnvelope } from "./envelope.ts";
import { assertReplayWindow } from "./replay-window.ts";

export const verifyInboundWebhook = (
  envelope: InboundWebhookEnvelope,
  secret: string,
  now = Date.now()
): boolean => {
  assertReplayWindow(envelope.timestamp, now);

  return verifyHmacSignature(secret, envelope.rawBody, envelope.signature);
};

export const assertInboundWebhook = (
  envelope: InboundWebhookEnvelope,
  secret: string,
  now = Date.now()
): void => {
  if (!verifyInboundWebhook(envelope, secret, now)) {
    throw new Error("Inbound webhook verification failed");
  }
};
