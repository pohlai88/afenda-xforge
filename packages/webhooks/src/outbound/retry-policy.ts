export type DeliveryFailureClassification = "retryable" | "terminal";

export type WebhookRetryPolicy = Readonly<{
  initialDelayMs: number;
  maxAttempts: number;
  maxDelayMs: number;
}>;

const DEFAULT_RETRYABLE_STATUS_CODES = new Set([
  408, 409, 425, 429, 500, 502, 503, 504,
]);

export const DEFAULT_WEBHOOK_RETRY_POLICY: WebhookRetryPolicy = {
  initialDelayMs: 1000,
  maxAttempts: 5,
  maxDelayMs: 30_000,
};

export const classifyDeliveryFailure = (
  error: unknown
): DeliveryFailureClassification => {
  let statusCode: number | null = null;

  if (typeof error === "object" && error !== null) {
    if ("statusCode" in error && typeof error.statusCode === "number") {
      statusCode = error.statusCode;
    } else if ("status" in error && typeof error.status === "number") {
      statusCode = error.status;
    }
  }

  if (statusCode !== null && DEFAULT_RETRYABLE_STATUS_CODES.has(statusCode)) {
    return "retryable";
  }

  return statusCode === null ? "retryable" : "terminal";
};

export const getRetryDelayMs = (
  attempt: number,
  policy: WebhookRetryPolicy = DEFAULT_WEBHOOK_RETRY_POLICY
): number =>
  Math.min(
    policy.initialDelayMs * 2 ** Math.max(attempt - 1, 0),
    policy.maxDelayMs
  );
