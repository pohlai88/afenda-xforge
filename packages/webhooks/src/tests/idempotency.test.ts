import assert from "node:assert/strict";
import test from "node:test";

import { deriveIdempotencyKey } from "../inbound/idempotency.ts";
import { isReplayWindowValid } from "../inbound/replay-window.ts";

test("deriveIdempotencyKey is deterministic", () => {
  const first = deriveIdempotencyKey(
    "svix",
    "evt_1",
    "tenant_1",
    "customer.created.v1"
  );
  const second = deriveIdempotencyKey(
    "svix",
    "evt_1",
    "tenant_1",
    "customer.created.v1"
  );

  assert.equal(first, second);
});

test("isReplayWindowValid rejects stale timestamps", () => {
  assert.equal(isReplayWindowValid(Date.now() - 61_000, Date.now()), false);
});
