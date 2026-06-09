import assert from "node:assert/strict";
import test from "node:test";

import { createQueueMessage } from "../queue/publisher.ts";

test("queue contracts preserve event, operation, and tenant context", () => {
  const message = createQueueMessage(
    "delivery_1",
    "svix",
    {
      eventId: "evt_1",
      eventType: "customer.created.v1",
      occurredAt: "2026-06-09T00:00:00.000Z",
      operationId: "op_1",
      payload: { customerId: "cus_1" },
      redactionPolicy: "standard",
      requestId: "req_1",
      schemaVersion: "v1",
      tenantId: "tenant_1",
    },
    123
  );

  assert.equal(message.deliveryId, "delivery_1");
  assert.equal(message.kind, "outbound-delivery");
  assert.equal(message.provider, "svix");
  assert.equal(message.envelope.eventId, "evt_1");
  assert.equal(message.envelope.operationId, "op_1");
  assert.equal(message.envelope.tenantId, "tenant_1");
  assert.equal(message.availableAt, 123);
});
