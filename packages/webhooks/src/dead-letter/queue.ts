import type { WebhookQueueMessage } from "../queue/contract.ts";
import type { DeadLetterRecord } from "./contract.ts";

export const createDeadLetterRecord = (
  deadLetterId: string,
  message: WebhookQueueMessage,
  failureReason: string,
  failedAt: string
): DeadLetterRecord => ({
  attemptCount: message.attempt,
  deadLetterId,
  envelope: message.envelope,
  failureReason,
  firstFailedAt: failedAt,
  kind: message.kind,
  lastFailedAt: failedAt,
  provider: message.provider,
  replayStatus: "pending",
});
