export type CircuitBreakerState = "closed" | "half-open" | "open";

export type WebhookCircuitBreaker = Readonly<{
  cooldownUntil: number | null;
  failureCount: number;
  failureThreshold: number;
  state: CircuitBreakerState;
}>;

export const createCircuitBreaker = (
  failureThreshold: number
): WebhookCircuitBreaker => {
  if (failureThreshold < 1) {
    throw new Error("Circuit breaker failureThreshold must be positive");
  }

  return {
    cooldownUntil: null,
    failureCount: 0,
    failureThreshold,
    state: "closed",
  };
};

export const canAttemptCircuit = (
  breaker: WebhookCircuitBreaker,
  now = Date.now()
): boolean =>
  breaker.state !== "open" ||
  breaker.cooldownUntil === null ||
  breaker.cooldownUntil <= now;

export const recordCircuitBreakerFailure = (
  breaker: WebhookCircuitBreaker,
  cooldownMs: number,
  now = Date.now()
): WebhookCircuitBreaker => {
  const failureCount = breaker.failureCount + 1;

  if (failureCount < breaker.failureThreshold) {
    return {
      ...breaker,
      failureCount,
    };
  }

  return {
    ...breaker,
    cooldownUntil: now + cooldownMs,
    failureCount,
    state: "open",
  };
};

export const recordCircuitBreakerSuccess = (
  breaker: WebhookCircuitBreaker
): WebhookCircuitBreaker => ({
  ...breaker,
  cooldownUntil: null,
  failureCount: 0,
  state: "closed",
});

export const advanceCircuitBreaker = (
  breaker: WebhookCircuitBreaker,
  now = Date.now()
): WebhookCircuitBreaker => {
  if (
    breaker.state === "open" &&
    breaker.cooldownUntil !== null &&
    breaker.cooldownUntil <= now
  ) {
    return {
      ...breaker,
      state: "half-open",
    };
  }

  return breaker;
};
