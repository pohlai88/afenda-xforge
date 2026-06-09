import assert from "node:assert/strict";
import test from "node:test";

import {
  advanceCircuitBreaker,
  canAttemptCircuit,
  createCircuitBreaker,
  recordCircuitBreakerFailure,
  recordCircuitBreakerSuccess,
} from "../outbound/circuit-breaker.ts";
import { classifyDeliveryFailure } from "../outbound/retry-policy.ts";

test("circuit breaker opens, half-opens, and closes under deterministic conditions", () => {
  const created = createCircuitBreaker(2);
  const afterFirstFailure = recordCircuitBreakerFailure(created, 10_000, 100);
  const afterSecondFailure = recordCircuitBreakerFailure(
    afterFirstFailure,
    10_000,
    100
  );
  const halfOpen = advanceCircuitBreaker(afterSecondFailure, 10_100);
  const recovered = recordCircuitBreakerSuccess(halfOpen);

  assert.equal(created.state, "closed");
  assert.equal(afterFirstFailure.state, "closed");
  assert.equal(afterSecondFailure.state, "open");
  assert.equal(canAttemptCircuit(afterSecondFailure, 101), false);
  assert.equal(halfOpen.state, "half-open");
  assert.equal(recovered.state, "closed");
});

test("retry policy classifies retryable and terminal failures", () => {
  assert.equal(classifyDeliveryFailure({ status: 503 }), "retryable");
  assert.equal(classifyDeliveryFailure({ statusCode: 400 }), "terminal");
});
