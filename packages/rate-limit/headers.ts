import type { RateLimitDecision } from "./policy.ts";

export const createRateLimitHeaders = (
  decision: RateLimitDecision
): Headers => {
  const headers = new Headers();
  const resetSeconds = Math.ceil(decision.resetAt.getTime() / 1000);

  if (decision.policy.includeHeaders) {
    headers.set("RateLimit-Limit", String(decision.limit));
    headers.set("RateLimit-Remaining", String(decision.remaining));
    headers.set("RateLimit-Reset", String(resetSeconds));
    headers.set(
      "RateLimit-Policy",
      `${decision.policy.namespace};w=${decision.policy.windowSeconds};scope=${decision.policy.scope}`
    );
  }

  if (!decision.success && decision.retryAfterSeconds > 0) {
    headers.set("Retry-After", String(decision.retryAfterSeconds));
  }

  return headers;
};

export const applyRateLimitHeaders = <T extends Response>(
  response: T,
  headers: Headers
): T => {
  for (const [name, value] of headers.entries()) {
    response.headers.set(name, value);
  }

  return response;
};
