const REDACTED_VALUE = "[redacted]";
const SENSITIVE_KEY_PATTERN =
  /(authorization|cookie|password|private[_-]?key|secret|signature|token)/i;

export const redactSensitiveData = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item));
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  const entries = Object.entries(value).map(([key, entryValue]) => [
    key,
    SENSITIVE_KEY_PATTERN.test(key)
      ? REDACTED_VALUE
      : redactSensitiveData(entryValue),
  ]);

  return Object.fromEntries(entries);
};
