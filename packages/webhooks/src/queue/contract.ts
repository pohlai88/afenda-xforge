import type { WebhookEnvelope } from "../outbound/delivery.ts";
import type { DeliveryFailureClassification } from "../outbound/retry-policy.ts";

export type WebhookQueueKind = "inbound-execution" | "outbound-delivery";

export type WebhookQueueMessage = Readonly<{
  attempt: number;
  availableAt: number;
  deliveryId: string;
  envelope: WebhookEnvelope;
  kind: WebhookQueueKind;
  provider: string;
}>;

export type QueuePublishResult = Readonly<{
  deliveryId: string;
  provider: string;
  queuedAt: number;
}>;

export type QueueConsumeResult = Readonly<
  | {
      classification: DeliveryFailureClassification;
      status: "failed";
    }
  | {
      status: "processed";
    }
>;
