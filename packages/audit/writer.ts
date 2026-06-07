import "server-only";

import { randomUUID } from "node:crypto";
import { auditEvents, database, timeDatabaseQuery } from "@repo/database";
import type {
  Audit7W1HChange,
  Audit7W1HEvent,
  Audit7W1HEventInput,
  Audit7W1HRecordMap,
  Audit7W1HWriter,
} from "./contract.ts";
import { audit7w1hEventInputSchema, audit7w1hEventSchema } from "./contract.ts";
import { computeAuditChanges, maskSensitiveAuditData } from "./differ.ts";

type AuditDatabase = Pick<typeof database, "insert">;
type AuditEventInsert = typeof auditEvents.$inferInsert;
type NormalizedAudit7W1HEvent = Omit<Audit7W1HEvent, "createdAt" | "id">;

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
  value: Audit7W1HRecordMap | null | undefined
): Audit7W1HRecordMap =>
  (maskSensitiveAuditData(value ?? {}) ?? {}) as Audit7W1HRecordMap;

const redactDiffValue = (field: string, value: unknown): unknown => {
  const redacted = maskSensitiveAuditData({ [field]: value });
  return redacted ? redacted[field] : value;
};

const redactDiffEntry = (entry: Audit7W1HChange): Audit7W1HChange => ({
  change: entry.change,
  field: entry.field,
  oldValue: redactDiffValue(entry.field, entry.oldValue),
  newValue: redactDiffValue(entry.field, entry.newValue),
});

const deriveModule = (action: string, module: string | undefined): string =>
  trimToUndefined(module) ?? action.split(".")[0];

const buildAuditTargetLabel = (input: Audit7W1HEventInput): string =>
  trimToUndefined(input.targetDisplayName) ??
  `${input.targetType}:${input.targetId}`;

export function resolveAuditEventSummary(input: Audit7W1HEventInput): string {
  const summary = trimToUndefined(input.summary);
  if (summary) {
    return summary;
  }

  return `${input.action} executed against ${buildAuditTargetLabel(input)}.`;
}

export function normalizeAuditEvent(
  input: Audit7W1HEventInput
): NormalizedAudit7W1HEvent {
  const normalizedInput = audit7w1hEventInputSchema.parse(input);
  const summary = resolveAuditEventSummary(normalizedInput);
  const reason = trimToUndefined(normalizedInput.reason) ?? summary;
  const action = normalizedInput.action.trim();
  const targetType = normalizedInput.targetType.trim();
  const targetId = normalizedInput.targetId.trim();
  const actorId = normalizedInput.actorId.trim();
  const tenantId = normalizedInput.tenantId.trim();
  const requestId = trimToUndefined(normalizedInput.requestId) ?? randomUUID();
  const occurredAt = normalizedInput.occurredAt ?? new Date();
  const actorType = normalizedInput.actorType ?? "user";
  const outcome = normalizedInput.outcome ?? "success";
  const companyId = trimToNull(normalizedInput.companyId ?? null);
  const grantId = trimToNull(normalizedInput.grantId ?? null);
  const actorRole = trimToNull(normalizedInput.actorRole);
  const module = deriveModule(action, normalizedInput.module);
  const surface = trimToNull(normalizedInput.surface);
  const route = trimToNull(normalizedInput.route);
  const subjectType = trimToNull(normalizedInput.subjectType);
  const subjectId = trimToNull(normalizedInput.subjectId);
  const targetDisplayName = trimToNull(normalizedInput.targetDisplayName);
  const policyReference = trimToNull(normalizedInput.policyReference);
  const approvalId = trimToNull(normalizedInput.approvalId);
  const channel = normalizedInput.channel ?? null;
  const operationId = trimToUndefined(normalizedInput.operationId) ?? requestId;
  const metadata = redactRecord(normalizedInput.metadata);
  const before = redactRecord(normalizedInput.before);
  const after = redactRecord(normalizedInput.after);
  let diff: Audit7W1HChange[];

  if (Array.isArray(normalizedInput.diff)) {
    diff = normalizedInput.diff.map(redactDiffEntry);
  } else if (before || after) {
    diff = computeAuditChanges(before, after).map(redactDiffEntry);
  } else {
    diff = [];
  }

  return {
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

export function createAuditEvent(input: Audit7W1HEventInput): Audit7W1HEvent {
  const normalizedEvent = normalizeAuditEvent(input);

  return audit7w1hEventSchema.parse({
    ...normalizedEvent,
    createdAt: new Date(),
    id: randomUUID(),
  });
}

const toDatabaseEvent = (event: Audit7W1HEvent): AuditEventInsert => ({
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
): Audit7W1HWriter => ({
  write: async (event: Audit7W1HEvent): Promise<void> => {
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

export const createNoopAuditWriter = (): Audit7W1HWriter => ({
  write: async (): Promise<void> => undefined,
});

export const writeAuditEvent = async (
  input: Audit7W1HEventInput,
  writer: Audit7W1HWriter = createDatabaseAuditWriter()
): Promise<Audit7W1HEvent> => {
  const event = createAuditEvent(input);

  await writer.write(event);

  return event;
};

export const writeAuditEventInTransaction = async (
  db: AuditDatabase,
  input: Audit7W1HEventInput
): Promise<Audit7W1HEvent> => {
  const event = createAuditEvent(input);

  await createDatabaseAuditWriter(db).write(event);

  return event;
};
