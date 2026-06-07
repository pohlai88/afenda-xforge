/**
 * Server-only public door for audit reads and writes.
 */
import "server-only";

export type {
  AuditActorType,
  AuditChange,
  AuditChannel,
  AuditDiffKind,
  AuditEvent,
  AuditEventInput,
  AuditExportFormat,
  AuditOutcome,
  AuditQueryOptions,
  AuditQueryResult,
  AuditRecordMap,
  AuditWriter,
} from "./contract.ts";
export {
  computeAuditChanges,
  getAuditEventChanges,
  maskSensitiveAuditData,
} from "./differ.ts";
export {
  countAuditEventsByAction,
  exportAuditEvents,
  getAuditEventsForActor,
  getAuditEventsForRequest,
  getAuditEventsForTarget,
  listAuditEvents,
} from "./query.ts";
export {
  createAuditEvent,
  createDatabaseAuditWriter,
  createNoopAuditWriter,
  normalizeAuditEvent,
  resolveAuditEventSummary,
  writeAuditEvent,
  writeAuditEventInTransaction,
} from "./writer.ts";
