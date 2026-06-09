export type WebhookMetricsSnapshot = Readonly<{
  deadLetterCount: number;
  duplicateEventCount: number;
  failedDeliveryCount: number;
  queueLagMs: number;
  replayFailureCount: number;
  replaySuccessCount: number;
  successfulDeliveryCount: number;
}>;

export const createEmptyWebhookMetricsSnapshot =
  (): WebhookMetricsSnapshot => ({
    deadLetterCount: 0,
    duplicateEventCount: 0,
    failedDeliveryCount: 0,
    queueLagMs: 0,
    replayFailureCount: 0,
    replaySuccessCount: 0,
    successfulDeliveryCount: 0,
  });
