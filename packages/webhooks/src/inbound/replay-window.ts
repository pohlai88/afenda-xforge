const DEFAULT_MAX_SKEW_MS = 60_000;

export const isReplayWindowValid = (
  timestamp: number | undefined,
  now = Date.now(),
  maxSkewMs = DEFAULT_MAX_SKEW_MS
): boolean => timestamp === undefined || Math.abs(now - timestamp) <= maxSkewMs;

export const assertReplayWindow = (
  timestamp: number | undefined,
  now = Date.now(),
  maxSkewMs = DEFAULT_MAX_SKEW_MS
): void => {
  if (!isReplayWindowValid(timestamp, now, maxSkewMs)) {
    throw new Error("Webhook replay window validation failed");
  }
};
