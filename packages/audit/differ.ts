import type { AuditChange, AuditEvent, AuditRecordMap } from "./contract.ts";

const DEFAULT_IGNORED_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "version",
  "_count",
]);

const DEFAULT_SENSITIVE_FIELD_FRAGMENTS = [
  "password",
  "token",
  "secret",
  "apiKey",
  "apikey",
  "refreshToken",
  "accessToken",
  "privateKey",
  "sessionToken",
];

type DiffOptions = {
  ignoredFields?: Iterable<string>;
  sensitiveFieldFragments?: Iterable<string>;
};

type NormalizedDiffOptions = {
  ignoredFields: Set<string>;
  sensitiveFieldFragments: string[];
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeFragments = (fragments?: Iterable<string>): string[] =>
  Array.from(fragments ?? DEFAULT_SENSITIVE_FIELD_FRAGMENTS, (fragment) =>
    fragment.toLowerCase()
  );

const normalizeIgnoredFields = (fields?: Iterable<string>): Set<string> =>
  new Set(fields ?? DEFAULT_IGNORED_FIELDS);

const isSensitiveField = (
  field: string,
  sensitiveFieldFragments: string[]
): boolean => {
  const lowerCaseField = field.toLowerCase();

  return sensitiveFieldFragments.some((fragment) =>
    lowerCaseField.includes(fragment)
  );
};

const maskSensitiveValue = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string" && value.length > 0) {
    return "***";
  }

  return "***";
};

const deepEqual = (left: unknown, right: unknown): boolean => {
  if (left === right) {
    return true;
  }

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false;
    }

    return left.every((value, index) => deepEqual(value, right[index]));
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    return leftKeys.every((key) => deepEqual(left[key], right[key]));
  }

  return false;
};

export const maskSensitiveAuditData = (
  value: unknown,
  options: DiffOptions = {}
): unknown => {
  const sensitiveFieldFragments = normalizeFragments(
    options.sensitiveFieldFragments
  );

  if (Array.isArray(value)) {
    return value.map((entry) => maskSensitiveAuditData(entry, options));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const masked: AuditRecordMap = {};

  for (const [key, entry] of Object.entries(value)) {
    if (isSensitiveField(key, sensitiveFieldFragments)) {
      masked[key] = maskSensitiveValue(entry);
      continue;
    }

    masked[key] =
      isPlainObject(entry) || Array.isArray(entry)
        ? maskSensitiveAuditData(entry, options)
        : entry;
  }

  return masked;
};

const collectObjectDiffs = (
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  path: string,
  changes: AuditChange[],
  options: NormalizedDiffOptions
): void => {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of keys) {
    if (options.ignoredFields.has(key)) {
      continue;
    }

    const nextPath = path ? `${path}.${key}` : key;

    if (isSensitiveField(key, options.sensitiveFieldFragments)) {
      if (!deepEqual(before[key], after[key])) {
        changes.push({
          field: nextPath,
          oldValue: maskSensitiveValue(before[key]),
          newValue: maskSensitiveValue(after[key]),
        });
      }

      continue;
    }

    collectDiffs(before[key], after[key], nextPath, changes, options);
  }
};

const collectDiffs = (
  before: unknown,
  after: unknown,
  path: string,
  changes: AuditChange[],
  options: NormalizedDiffOptions
): void => {
  if (deepEqual(before, after)) {
    return;
  }

  if (Array.isArray(before) || Array.isArray(after)) {
    changes.push({
      field: path || "*",
      oldValue: before,
      newValue: after,
    });
    return;
  }

  if (isPlainObject(before) && isPlainObject(after)) {
    collectObjectDiffs(before, after, path, changes, options);
    return;
  }

  changes.push({
    field: path || "*",
    oldValue: before,
    newValue: after,
  });
};

export const computeAuditChanges = (
  before: unknown,
  after: unknown,
  options: DiffOptions = {}
): AuditChange[] => {
  const changes: AuditChange[] = [];

  collectDiffs(before, after, "", changes, {
    ignoredFields: normalizeIgnoredFields(options.ignoredFields),
    sensitiveFieldFragments: normalizeFragments(
      options.sensitiveFieldFragments
    ),
  });

  return changes;
};

export const getAuditEventChanges = (
  event: Pick<AuditEvent, "before" | "after">
): AuditChange[] => computeAuditChanges(event.before, event.after);
