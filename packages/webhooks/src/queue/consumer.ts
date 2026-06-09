import type { WebhookQueueMessage } from "./contract.ts";

export const incrementQueueAttempt = (
  message: WebhookQueueMessage,
  availableAt: number
): WebhookQueueMessage => ({
  ...message,
  attempt: message.attempt + 1,
  availableAt,
});

export const isQueueMessageReady = (
  message: WebhookQueueMessage,
  now = Date.now()
): boolean => message.availableAt <= now;
