import type { LamAuditEvent } from "../schema.ts";
import { lamAuditEventSchema } from "../schema.ts";

export const projectLamAuditTrailEvents = (
  events: readonly LamAuditEvent[]
): LamAuditEvent[] =>
  [...events]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .map((entry) => lamAuditEventSchema.parse(entry));
