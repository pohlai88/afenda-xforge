import type { Audit7W1HEvent } from "../../../../../audit/index.ts";
import { createAuditEvent } from "../../../../../audit/index.ts";
import { appendEmployeeSelfservicePortalAuditEvent } from "./repository.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

type EmployeeSelfservicePortalAuditInput = {
  action: string;
  after?: Record<string, unknown>;
  before?: Record<string, unknown>;
  context?: HrSuiteFeatureContext;
  employeeId?: string;
  metadata?: Record<string, unknown>;
  reason?: string;
  summary: string;
  targetDisplayName?: string;
  targetId: string;
  targetType: string;
};

const trimToNull = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const trimToUndefined = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const buildChannel = (
  context: HrSuiteFeatureContext | undefined
): "api" | "server_action" => (context?.requestId ? "api" : "server_action");

export function createEmployeeSelfservicePortalAuditEvent(
  input: EmployeeSelfservicePortalAuditInput
): Audit7W1HEvent {
  return createAuditEvent({
    action: input.action,
    actorId: contextActorId(input.context),
    actorRole: input.context?.canReadAll ? "manager" : "employee",
    after: input.after,
    before: input.before,
    channel: buildChannel(input.context),
    companyId: trimToNull(input.context?.companyId),
    metadata: input.metadata,
    module: "hr",
    reason: input.reason,
    requestId: trimToUndefined(input.context?.requestId),
    route: "/api/hr/employee-selfservice-portal",
    subjectId: trimToUndefined(
      input.employeeId ?? input.context?.actorEmployeeId
    ),
    subjectType:
      (input.employeeId ?? input.context?.actorEmployeeId)
        ? "employee"
        : undefined,
    summary: input.summary,
    surface: "employee-selfservice-portal",
    targetDisplayName: trimToUndefined(input.targetDisplayName),
    targetId: input.targetId,
    targetType: input.targetType,
    tenantId: input.context?.tenantId?.trim() ?? "unscoped",
  });
}

function contextActorId(context?: HrSuiteFeatureContext): string {
  return context?.actorId?.trim() || context?.userId?.trim() || "system";
}

export function recordEmployeeSelfservicePortalAuditEvent(
  input: EmployeeSelfservicePortalAuditInput
): Audit7W1HEvent {
  const event = createEmployeeSelfservicePortalAuditEvent(input);
  appendEmployeeSelfservicePortalAuditEvent(event);
  return event;
}
