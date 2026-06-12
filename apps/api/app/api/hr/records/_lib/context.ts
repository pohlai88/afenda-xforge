import type { HrRecordsActionResult } from "@repo/features-employee-management-employee-records-management";
import {
  resolveHrEmployeeRecordsRuntimeAccess,
  resolveHrTenantScopedAccess,
} from "../../_lib/access.ts";

export type HrRecordsApiReadContext = {
  canRead: boolean;
  canViewSensitive: boolean;
  organizationId?: string;
  tenantId: string;
  userId?: string;
};

export type HrRecordsApiWriteContext = HrRecordsApiReadContext & {
  canWrite: boolean;
};

export const createHrRecordsReadContext = async (
  _request: Request
): Promise<HrRecordsApiReadContext> => {
  const { access } = await resolveHrTenantScopedAccess();
  const capabilities = resolveHrEmployeeRecordsRuntimeAccess(
    access.grantedPermissions
  );

  return {
    canRead: capabilities.canRead,
    canViewSensitive: capabilities.canViewSensitive,
    organizationId: access.tenantId,
    tenantId: access.tenantId,
    userId: access.actorId,
  };
};

export const createHrRecordsWriteContext = async (
  request: Request
): Promise<HrRecordsApiWriteContext> => {
  const readContext = await createHrRecordsReadContext(request);
  const { access } = await resolveHrTenantScopedAccess();
  const capabilities = resolveHrEmployeeRecordsRuntimeAccess(
    access.grantedPermissions
  );

  return {
    ...readContext,
    canWrite: capabilities.canWrite,
  };
};

export const toHrRecordsJsonResponse = (
  result: HrRecordsActionResult
): Response =>
  new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 400,
    headers: { "content-type": "application/json" },
  });
