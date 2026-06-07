import "server-only";

import { randomUUID } from "node:crypto";
import { auditEvents, database, timeDatabaseQuery } from "@repo/database";
import type {
  AuditChange,
  AuditEvent,
  AuditEventInput,
  AuditRecordMap,
  AuditWriter,
} from "./contract.ts";
import { computeAuditChanges, maskSensitiveAuditData } from "./differ.ts";

type AuditDatabase = Pick<typeof database, "insert">;
type AuditEventInsert = typeof auditEvents.$inferInsert;
type NormalizedAuditEvent = Omit<AuditEvent, "createdAt" | "id">;

const trimToNull = (value: string | undefined | null): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const trimToUndefined = (
  value: string | undefined | null
): string | undefined => {
  const trimmed = trimToNull(value);
  return trimmed ?? undefined;
};

const redactRecord = (
  value: AuditRecordMap | null | undefined
): AuditRecordMap =>
  (maskSensitiveAuditData(value ?? {}) ?? {}) as AuditRecordMap;

const redactDiffValue = (field: string, value: unknown): unknown => {
  const redacted = maskSensitiveAuditData({ [field]: value });
  return redacted ? redacted[field] : value;
};

const redactDiffEntry = (entry: AuditChange): AuditChange => ({
  field: entry.field,
  oldValue: redactDiffValue(entry.field, entry.oldValue),
  newValue: redactDiffValue(entry.field, entry.newValue),
});

const deriveModule = (action: string, module: string | undefined): string =>
  trimToUndefined(module) ?? action.split(".")[0];

const buildAuditTargetLabel = (input: AuditEventInput): string =>
  trimToUndefined(input.targetDisplayName) ??
  `${input.targetType}:${input.targetId}`;

export function resolveAuditEventSummary(input: AuditEventInput): string {
  const summary = trimToUndefined(input.summary);
  if (summary) {
    return summary;
  }

  return `${input.action} executed against ${buildAuditTargetLabel(input)}.`;
}

export function normalizeAuditEvent(
  input: AuditEventInput
): NormalizedAuditEvent {
  const summary = resolveAuditEventSummary(input);
  const reason = trimToUndefined(input.reason) ?? summary;
  const action = input.action.trim();
  const targetType = input.targetType.trim();
  const targetId = input.targetId.trim();
  const actorId = input.actorId.trim();
  const tenantId = input.tenantId.trim();
  const requestId = trimToUndefined(input.requestId) ?? randomUUID();
  const occurredAt = input.occurredAt ?? new Date();
  const actorType = input.actorType ?? "user";
  const outcome = input.outcome ?? "success";
  const companyId = trimToNull(input.companyId ?? null);
  const grantId = trimToNull(input.grantId ?? null);
  const actorRole = trimToNull(input.actorRole);
  const module = deriveModule(action, input.module);
  const surface = trimToNull(input.surface);
  const route = trimToNull(input.route);
  const subjectType = trimToNull(input.subjectType);
  const subjectId = trimToNull(input.subjectId);
  const targetDisplayName = trimToNull(input.targetDisplayName);
  const policyReference = trimToNull(input.policyReference);
  const approvalId = trimToNull(input.approvalId);
  const channel = input.channel ?? null;
  const operationId = trimToUndefined(input.operationId) ?? requestId;
  const metadata = redactRecord(input.metadata);
  const before = redactRecord(input.before);
  const after = redactRecord(input.after);
  let diff: AuditChange[];

  if (Array.isArray(input.diff)) {
    diff = input.diff.map(redactDiffEntry);
  } else if (before || after) {
    diff = computeAuditChanges(before, after).map(redactDiffEntry);
  } else {
    diff = [];
  }

  return {
    ...input,
    action,
    actorId,
    actorRole,
    actorType,
    approvalId,
    after,
    before,
    channel,
    companyId,
    diff,
    grantId,
    metadata,
    module,
    occurredAt,
    operationId,
    outcome,
    policyReference,
    reason,
    requestId,
    route,
    subjectId,
    subjectType,
    summary,
    surface,
    targetDisplayName,
    targetId,
    targetType,
    tenantId,
  };
}

export function createAuditEvent(input: AuditEventInput): AuditEvent {
  const normalizedEvent = normalizeAuditEvent(input);

  return {
    ...normalizedEvent,
    id: randomUUID(),
    createdAt: new Date(),
  };
}

const toDatabaseEvent = (event: AuditEvent): AuditEventInsert => ({
  id: event.id,
  tenantId: event.tenantId,
  companyId: event.companyId,
  grantId: event.grantId,
  actorId: event.actorId,
  actorType: event.actorType,
  actorRole: event.actorRole,
  module: event.module ?? "",
  surface: event.surface,
  route: event.route,
  subjectType: event.subjectType,
  subjectId: event.subjectId,
  action: event.action,
  summary: event.summary,
  outcome: event.outcome,
  targetType: event.targetType,
  targetId: event.targetId,
  targetDisplayName: event.targetDisplayName,
  reason: event.reason,
  policyReference: event.policyReference,
  approvalId: event.approvalId,
  channel: event.channel,
  requestId: event.requestId,
  operationId: event.operationId,
  before: event.before,
  after: event.after,
  diff: event.diff,
  metadata: event.metadata,
  occurredAt: event.occurredAt,
  createdAt: event.createdAt,
});

export const createDatabaseAuditWriter = (
  db: AuditDatabase = database
): AuditWriter => ({
  write: async (event: AuditEvent): Promise<void> => {
    await timeDatabaseQuery(
      () => db.insert(auditEvents).values(toDatabaseEvent(event)),
      {
        operation: "insert",
        resource: "audit_events",
        metadata: {
          action: event.action,
          actorId: event.actorId,
          tenantId: event.tenantId,
        },
      }
    );
  },
});

export const createNoopAuditWriter = (): AuditWriter => ({
  write: async (): Promise<void> => undefined,
});

export const writeAuditEvent = async (
  input: AuditEventInput,
  writer: AuditWriter = createDatabaseAuditWriter()
): Promise<AuditEvent> => {
  const event = createAuditEvent(input);

  await writer.write(event);

  return event;
};

export const writeAuditEventInTransaction = async (
  db: AuditDatabase,
  input: AuditEventInput
): Promise<AuditEvent> => {
  const event = createAuditEvent(input);

  await createDatabaseAuditWriter(db).write(event);

  return event;
};
