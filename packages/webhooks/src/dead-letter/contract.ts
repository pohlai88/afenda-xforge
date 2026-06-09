import type { WebhookEnvelope } from "../outbound/delivery.ts";
import type { WebhookQueueKind } from "../queue/contract.ts";

export type DeadLetterReplayStatus =
  | "discarded"
  | "pending"
  | "replayed"
  | "replay-failed";

export type DeadLetterRecord = Readonly<{
  attemptCount: number;
  envelope: WebhookEnvelope;
  failureReason: string;
  firstFailedAt: string;
  kind: WebhookQueueKind;
  lastFailedAt: string;
  provider: string;
  replayStatus: DeadLetterReplayStatus;
  deadLetterId: string;
}>;

export type DeadLetterReplayRequest = Readonly<{
  deadLetterId: string;
  requestedAt: string;
}>;
