import "server-only";

import { randomUUID } from "node:crypto";
import { auditEvents, database } from "@repo/database";
import type { AuditEvent, AuditEventInput, AuditWriter } from "./contract.ts";
import { maskSensitiveAuditData } from "./differ.ts";

export const createAuditEvent = (input: AuditEventInput): AuditEvent => ({
  ...input,
  after: (maskSensitiveAuditData(input.after) ?? {}) as Record<string, unknown>,
  before: (maskSensitiveAuditData(input.before) ?? {}) as Record<
    string,
    unknown
  >,
  id: randomUUID(),
  metadata: (maskSensitiveAuditData(input.metadata ?? null) ?? null) as Record<
    string,
    unknown
  > | null,
  createdAt: new Date(),
});

export const createDatabaseAuditWriter = (): AuditWriter => ({
  write: async (event: AuditEvent): Promise<void> => {
    await database.insert(auditEvents).values({
      id: event.id,
      tenantId: event.tenantId,
      companyId: event.companyId ?? null,
      grantId: event.grantId ?? null,
      actorId: event.actorId,
      action: event.action,
      targetType: event.targetType,
      targetId: event.targetId,
      before: event.before,
      after: event.after,
      reason: event.reason,
      requestId: event.requestId,
      metadata: event.metadata ?? null,
      createdAt: event.createdAt,
    });
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
