export type WebhookOperationalEvent =
  | "webhook.circuit.opened"
  | "webhook.circuit.probed"
  | "webhook.delivery.failed"
  | "webhook.delivery.succeeded"
  | "webhook.dlq.replayed"
  | "webhook.enqueued";
