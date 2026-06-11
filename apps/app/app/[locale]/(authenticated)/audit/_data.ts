import { listAuditEvents } from "@repo/audit";
import { ForbiddenError } from "@repo/errors";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import type { DashboardTableRow } from "@repo/ui";
import type { RuntimeTenantAccess } from "../../../_runtime-access.ts";
import {
  createRuntimePermissionContext,
  resolveRuntimeTenantAccess,
} from "../../../_runtime-access.ts";

type LoadState<T> =
  | {
      data: T;
      status: "ready";
    }
  | {
      message: string;
      status: "error";
    }
  | {
      status: "forbidden";
    };

type AuditTableRow = DashboardTableRow & {
  action: string;
  actorId: string;
  actorRole: string;
  actorType: string;
  approvalId: string;
  channel: string;
  companyId: string;
  diffCount: number;
  module: string;
  operationId: string;
  outcome: string;
  occurredAt: Date;
  policyReference: string;
  reason: string;
  requestId: string;
  route: string;
  subjectId: string;
  subjectType: string;
  summary: string;
  surface: string;
  targetDisplayName: string;
  targetId: string;
  targetType: string;
  tenantId: string;
  grantId: string;
};

export type AuditPageData = {
  actorId: string;
  events: readonly AuditTableRow[];
  grantedPermissions: readonly string[];
  latestEvent: AuditTableRow | null;
  tenantId: string;
  tenantRole: string;
  total: number;
  userEmail: string | null;
};

const isForbiddenError = (error: unknown): boolean =>
  error instanceof ForbiddenError;

const toErrorState = (error: unknown): LoadState<never> => ({
  message: error instanceof Error ? error.message : "Unable to load audit",
  status: "error",
});

const toAuditRow = (
  event: Awaited<ReturnType<typeof listAuditEvents>>["events"][number]
): AuditTableRow => ({
  action: event.action,
  actorId: event.actorId,
  actorRole: event.actorRole ?? "",
  actorType: event.actorType,
  approvalId: event.approvalId ?? "",
  channel: event.channel ?? "",
  companyId: event.companyId ?? "",
  diffCount: event.diff.length,
  id: event.id,
  grantId: event.grantId ?? "",
  module: event.module ?? "",
  operationId: event.operationId ?? "",
  outcome: event.outcome,
  occurredAt: event.occurredAt,
  policyReference: event.policyReference ?? "",
  reason: event.reason,
  requestId: event.requestId,
  route: event.route ?? "",
  subjectId: event.subjectId ?? "",
  subjectType: event.subjectType ?? "",
  summary: event.summary,
  surface: event.surface ?? "",
  targetDisplayName: event.targetDisplayName ?? "",
  targetId: event.targetId,
  targetType: event.targetType,
  tenantId: event.tenantId,
});

const loadAuditEvents = async (
  access: RuntimeTenantAccess
): Promise<LoadState<AuditPageData>> => {
  try {
    requirePermission(
      createRuntimePermissionContext(access, "audit.view", "audit"),
      {
        allOf: [permissionCatalog.audit.read],
      }
    );

    const result = await listAuditEvents({
      limit: 50,
      offset: 0,
      tenantId: access.tenantId,
    });
    const events = result.events.map(toAuditRow);

    return {
      data: {
        actorId: access.actorId,
        events,
        grantedPermissions: access.grantedPermissions,
        latestEvent: events[0] ?? null,
        tenantId: access.tenantId,
        tenantRole: access.role,
        total: result.total,
        userEmail: access.userEmail,
      },
      status: "ready",
    };
  } catch (error) {
    if (isForbiddenError(error)) {
      return {
        status: "forbidden",
      };
    }

    return toErrorState(error);
  }
};

export const loadAuditPageData = async (): Promise<
  LoadState<AuditPageData>
> => {
  const access = await resolveRuntimeTenantAccess();
  return loadAuditEvents(access);
};
