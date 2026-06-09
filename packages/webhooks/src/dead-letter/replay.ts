import type { DeadLetterRecord, DeadLetterReplayRequest } from "./contract.ts";

export const createDeadLetterReplayRequest = (
  deadLetterId: string,
  requestedAt: string
): DeadLetterReplayRequest => ({
  deadLetterId,
  requestedAt,
});

export const markDeadLetterReplayed = (
  record: DeadLetterRecord
): DeadLetterRecord => ({
  ...record,
  replayStatus: "replayed",
});
