import type { HrRecordsActionResult } from "@repo/features-employee-management-employee-records-management";
import { resolveHrTenantScopedAccess } from "../../_lib/access.ts";

export type HrRecordsApiReadContext = {
  canRead: boolean;
  canViewSensitive: boolean;
  organizationId?: string;
  userId?: string;
};

export type HrRecordsApiWriteContext = HrRecordsApiReadContext & {
  canWrite: boolean;
};

export const createHrRecordsReadContext = async (
  _request: Request
): Promise<HrRecordsApiReadContext> => {
  const { access, capabilities } = await resolveHrTenantScopedAccess();

  return {
    canRead: capabilities.canRead,
    canViewSensitive: capabilities.canViewSensitive,
    organizationId: access.tenantId,
    userId: access.actorId,
  };
};

export const createHrRecordsWriteContext = async (
  request: Request
): Promise<HrRecordsApiWriteContext> => {
  const readContext = await createHrRecordsReadContext(request);

  return {
    ...readContext,
    canWrite: readContext.canRead,
  };
};

export const toHrRecordsJsonResponse = (
  result: HrRecordsActionResult
): Response =>
  new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 400,
    headers: { "content-type": "application/json" },
  });
