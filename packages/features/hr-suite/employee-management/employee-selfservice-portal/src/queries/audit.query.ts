import type { Audit7W1HEvent } from "../../../../../../audit/index.ts";
import { listEmployeeSelfservicePortalRepositoryAuditEvents } from "../repository.ts";
import type { ListEmployeeSelfservicePortalAuditQuery } from "../schema.ts";
import { listEmployeeSelfservicePortalAuditQuerySchema } from "../schema.ts";
import type { HrSuiteFeatureContext } from "../shared/index.ts";

const DEFAULT_PAGE_SIZE = 25;

const normalizePositiveInteger = (
  value: number | undefined,
  fallback: number
): number => {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  const parsedValue = Math.floor(value);
  return parsedValue > 0 ? parsedValue : fallback;
};

const canReadScopedAuditEvent = (
  context: HrSuiteFeatureContext | undefined,
  event: Audit7W1HEvent
): boolean => {
  if (
    !(
      context?.canRead &&
      context.tenantId &&
      context.companyId &&
      event.tenantId === context.tenantId &&
      event.companyId === context.companyId
    )
  ) {
    return false;
  }

  if (context.canReadAll && context.userId) {
    return true;
  }

  return Boolean(
    context.actorEmployeeId &&
      event.subjectType === "employee" &&
      event.subjectId === context.actorEmployeeId
  );
};

export function listEmployeeSelfservicePortalAuditTrailEvents(
  query: ListEmployeeSelfservicePortalAuditQuery = {},
  context?: HrSuiteFeatureContext
): readonly Audit7W1HEvent[] {
  const parsedQuery =
    listEmployeeSelfservicePortalAuditQuerySchema.parse(query);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );

  const filteredEvents = listEmployeeSelfservicePortalRepositoryAuditEvents()
    .filter((event) => canReadScopedAuditEvent(context, event))
    .filter((event) =>
      parsedQuery.employeeId ? event.subjectId === parsedQuery.employeeId : true
    )
    .filter((event) =>
      parsedQuery.action ? event.action === parsedQuery.action : true
    )
    .filter((event) =>
      parsedQuery.targetType
        ? event.targetType === parsedQuery.targetType
        : true
    )
    .sort(
      (leftEvent, rightEvent) =>
        rightEvent.occurredAt.getTime() - leftEvent.occurredAt.getTime()
    );

  const startIndex = (page - 1) * pageSize;
  return filteredEvents.slice(startIndex, startIndex + pageSize);
}
