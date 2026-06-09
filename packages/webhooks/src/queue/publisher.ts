import type { WebhookEnvelope } from "../outbound/delivery.ts";
import type {
  QueuePublishResult,
  WebhookQueueKind,
  WebhookQueueMessage,
} from "./contract.ts";

export const createQueueMessage = (
  deliveryId: string,
  provider: string,
  envelope: WebhookEnvelope,
  now = Date.now(),
  kind: WebhookQueueKind = "outbound-delivery"
): WebhookQueueMessage => ({
  attempt: 1,
  availableAt: now,
  deliveryId,
  envelope,
  kind,
  provider,
});

export const createQueuePublishResult = (
  message: WebhookQueueMessage,
  queuedAt = Date.now()
): QueuePublishResult => ({
  deliveryId: message.deliveryId,
  provider: message.provider,
  queuedAt,
});
