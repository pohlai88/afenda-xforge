import type { AuditChange, AuditDiffKind, AuditRecordMap } from "./contract.ts";

const REDACTED = "[redacted]";
const TRUNCATED = "[truncated]";
const MAX_DEPTH = 6;
const MAX_ARRAY_LENGTH = 20;
const MAX_OBJECT_KEYS = 50;

const DEFAULT_IGNORED_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "version",
  "_count",
]);

const DEFAULT_SENSITIVE_FIELD_FRAGMENTS = [
  "password",
  "secret",
  "token",
  "cookie",
  "authorization",
  "privatekey",
  "api_key",
  "apikey",
  "clientsecret",
  "sessiontoken",
  "accesstoken",
  "refreshtoken",
  "requestbody",
  "responsebody",
  "filecontent",
  "documentcontent",
  "payment",
  "card",
  "nationalid",
  "taxid",
  "ssn",
];

type DiffOptions = {
  ignoredFields?: Iterable<string>;
  sensitiveFieldFragments?: Iterable<string>;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.prototype.toString.call(value) === "[object Object]";

const isDate = (value: unknown): value is Date => value instanceof Date;

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

  return REDACTED;
};

const deepEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) {
    return true;
  }

  if (isDate(left) && isDate(right)) {
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

const joinPath = (base: string, segment: string): string => {
  if (!base) {
    return segment;
  }

  if (segment.startsWith("[")) {
    return `${base}${segment}`;
  }

  return `${base}.${segment}`;
};

const resolveDiffKind = (left: unknown, right: unknown): AuditDiffKind => {
  if (left === undefined && right !== undefined) {
    return "added";
  }

  if (left !== undefined && right === undefined) {
    return "removed";
  }

  return "changed";
};

const redactValue = (
  value: unknown,
  key: string | undefined,
  depth: number,
  sensitiveFieldFragments: string[]
): unknown => {
  if (key && isSensitiveField(key, sensitiveFieldFragments)) {
    return maskSensitiveValue(value);
  }

  if (depth >= MAX_DEPTH) {
    return TRUNCATED;
  }

  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) {
      return [
        ...value
          .slice(0, MAX_ARRAY_LENGTH)
          .map((entry) =>
            redactValue(entry, undefined, depth + 1, sensitiveFieldFragments)
          ),
        TRUNCATED,
      ];
    }

    return value.map((entry) =>
      redactValue(entry, undefined, depth + 1, sensitiveFieldFragments)
    );
  }

  if (isDate(value)) {
    return value;
  }

  if (isPlainObject(value)) {
    const output: Record<string, unknown> = {};
    const entries = Object.entries(value);

    for (const [entryKey, entryValue] of entries.slice(0, MAX_OBJECT_KEYS)) {
      output[entryKey] = redactValue(
        entryValue,
        entryKey,
        depth + 1,
        sensitiveFieldFragments
      );
    }

    if (entries.length > MAX_OBJECT_KEYS) {
      output.__truncated = true;
    }

    return output;
  }

  return value;
};

const pushChange = (
  changes: AuditChange[],
  field: string,
  oldValue: unknown,
  newValue: unknown,
  change: AuditDiffKind = resolveDiffKind(oldValue, newValue)
): void => {
  changes.push({
    change,
    field,
    oldValue,
    newValue,
  });
};

const diffArrays = (
  changes: AuditChange[],
  left: unknown[],
  right: unknown[],
  path: string,
  collectDiffs: (left: unknown, right: unknown, path: string) => void
): void => {
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const nextPath = joinPath(path, `[${index}]`);

    if (index >= left.length) {
      pushChange(changes, nextPath, undefined, right[index], "added");
      continue;
    }

    if (index >= right.length) {
      pushChange(changes, nextPath, left[index], undefined, "removed");
      continue;
    }

    collectDiffs(left[index], right[index], nextPath);
  }
};

const diffObjects = (
  changes: AuditChange[],
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  path: string,
  ignoredFields: Set<string>,
  sensitiveFieldFragments: string[],
  collectDiffs: (left: unknown, right: unknown, path: string) => void
): void => {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

  for (const key of keys) {
    if (ignoredFields.has(key)) {
      continue;
    }

    const nextPath = joinPath(path, key);

    if (isSensitiveField(key, sensitiveFieldFragments)) {
      if (!deepEqual(left[key], right[key])) {
        pushChange(
          changes,
          nextPath,
          maskSensitiveValue(left[key]),
          maskSensitiveValue(right[key]),
          resolveDiffKind(left[key], right[key])
        );
      }

      continue;
    }

    if (!(key in left)) {
      pushChange(changes, nextPath, undefined, right[key], "added");
      continue;
    }

    if (!(key in right)) {
      pushChange(changes, nextPath, left[key], undefined, "removed");
      continue;
    }

    collectDiffs(left[key], right[key], nextPath);
  }
};

const diffLeaf = (
  changes: AuditChange[],
  left: unknown,
  right: unknown,
  path: string,
  sensitiveFieldFragments: string[]
): void => {
  const field = path || "*";
  const isSensitive = isSensitiveField(path, sensitiveFieldFragments);

  pushChange(
    changes,
    field,
    isSensitive ? maskSensitiveValue(left) : left,
    isSensitive ? maskSensitiveValue(right) : right,
    resolveDiffKind(left, right)
  );
};

export const maskSensitiveAuditData = <
  T extends AuditRecordMap | null | undefined,
>(
  value: T,
  options: DiffOptions = {}
): T => {
  if (value === null || value === undefined) {
    return value;
  }

  const sensitiveFieldFragments = normalizeFragments(
    options.sensitiveFieldFragments
  );

  return redactValue(value, undefined, 0, sensitiveFieldFragments) as T;
};

export const computeAuditChanges = (
  before: unknown,
  after: unknown,
  options: DiffOptions = {}
): AuditChange[] => {
  const changes: AuditChange[] = [];
  const ignoredFields = normalizeIgnoredFields(options.ignoredFields);
  const sensitiveFieldFragments = normalizeFragments(
    options.sensitiveFieldFragments
  );

  const collectDiffs = (left: unknown, right: unknown, path: string): void => {
    if (deepEqual(left, right)) {
      return;
    }

    if (Array.isArray(left) && Array.isArray(right)) {
      diffArrays(changes, left, right, path, collectDiffs);
      return;
    }

    if (isPlainObject(left) && isPlainObject(right)) {
      diffObjects(
        changes,
        left,
        right,
        path,
        ignoredFields,
        sensitiveFieldFragments,
        collectDiffs
      );
      return;
    }

    diffLeaf(changes, left, right, path, sensitiveFieldFragments);
  };

  collectDiffs(before, after, "");

  return changes;
};

export const getAuditEventChanges = (
  event: Pick<AuditEventInputLike, "before" | "after">
): AuditChange[] => computeAuditChanges(event.before, event.after);

type AuditEventInputLike = {
  before: unknown;
  after: unknown;
};
