import type {
  HrEmployeeStatusHistoryRecord,
  HrEmployeeStatusHistoryView,
} from "../schema.ts";
import { hrEmployeeStatusHistoryViewSchema } from "../schema.ts";

const toIsoString = (value: Date): string => value.toISOString();

const compareStatusHistoryRecords = (
  left: HrEmployeeStatusHistoryRecord,
  right: HrEmployeeStatusHistoryRecord
): number =>
  right.effectiveAt.getTime() - left.effectiveAt.getTime() ||
  right.createdAt.getTime() - left.createdAt.getTime() ||
  right.updatedAt.getTime() - left.updatedAt.getTime() ||
  right.id.localeCompare(left.id);

export function projectHrEmployeeStatusHistory(
  record: HrEmployeeStatusHistoryRecord,
  input?: {
    isCurrent?: boolean;
  }
): HrEmployeeStatusHistoryView {
  return hrEmployeeStatusHistoryViewSchema.parse({
    id: record.id,
    organizationId: record.organizationId,
    employeeId: record.employeeId,
    status: record.status,
    previousStatus: record.previousStatus,
    effectiveAt: toIsoString(record.effectiveAt),
    source: record.source,
    reason: record.reason,
    actorId: record.actorId,
    isCurrent: input?.isCurrent ?? false,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt),
  });
}

export function sortHrEmployeeStatusHistory(
  history: readonly HrEmployeeStatusHistoryRecord[]
): readonly HrEmployeeStatusHistoryRecord[] {
  return [...history].sort(compareStatusHistoryRecords);
}

export function resolveCurrentHrEmployeeStatusHistory(
  history: readonly HrEmployeeStatusHistoryRecord[],
  asOf = new Date()
): HrEmployeeStatusHistoryRecord | null {
  const eligible = history.filter(
    (entry) => entry.effectiveAt.getTime() <= asOf.getTime()
  );

  return eligible.sort(compareStatusHistoryRecords)[0] ?? null;
}

export function projectHrEmployeeStatusHistoryViews(
  history: readonly HrEmployeeStatusHistoryRecord[],
  currentHistoryId?: string | null
): readonly HrEmployeeStatusHistoryView[] {
  return sortHrEmployeeStatusHistory(history).map((entry) =>
    projectHrEmployeeStatusHistory(entry, {
      isCurrent: currentHistoryId ? entry.id === currentHistoryId : false,
    })
  );
}
