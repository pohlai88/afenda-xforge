import assert from "node:assert/strict";
import test from "node:test";

import { createDeadLetterRecord } from "../dead-letter/queue.ts";
import {
  createDeadLetterReplayRequest,
  markDeadLetterReplayed,
} from "../dead-letter/replay.ts";
import { createQueueMessage } from "../queue/publisher.ts";

test("dead-letter records are created after retry exhaustion", () => {
  const message = {
    ...createQueueMessage("delivery_1", "svix", {
      eventId: "evt_1",
      eventType: "customer.created.v1",
      occurredAt: "2026-06-09T00:00:00.000Z",
      operationId: "op_1",
      payload: { customerId: "cus_1" },
      redactionPolicy: "standard",
      requestId: "req_1",
      schemaVersion: "v1",
      tenantId: "tenant_1",
    }),
    attempt: 5,
  };

  const record = createDeadLetterRecord(
    "dlq_1",
    message,
    "terminal failure",
    "2026-06-09T00:00:00.000Z"
  );

  assert.equal(record.deadLetterId, "dlq_1");
  assert.equal(record.attemptCount, 5);
  assert.equal(record.replayStatus, "pending");

  const replayRequest = createDeadLetterReplayRequest(
    record.deadLetterId,
    "2026-06-10T00:00:00.000Z"
  );
  const replayed = markDeadLetterReplayed(record);

  assert.equal(replayRequest.deadLetterId, "dlq_1");
  assert.equal(replayed.replayStatus, "replayed");
});
