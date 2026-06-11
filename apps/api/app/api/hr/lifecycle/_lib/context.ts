import type { EmployeeLifecycleManagementPolicyContext } from "@repo/features-employee-management-employee-lifecycle-management/policy";
import type { EmployeeLifecycleRepositoryScope } from "@repo/features-employee-management-employee-lifecycle-management/repository";
import { resolveHrTenantScopedAccess } from "../../_lib/access.ts";

export type EmployeeLifecycleApiReadContext =
  EmployeeLifecycleManagementPolicyContext;

export type EmployeeLifecycleApiWriteContext =
  EmployeeLifecycleApiReadContext & {
    canWrite: boolean;
    actorId?: string;
  };

export const createEmployeeLifecycleReadContext = async (
  _request: Request
): Promise<EmployeeLifecycleApiReadContext> => {
  const { access, capabilities, companyId } =
    await resolveHrTenantScopedAccess();

  return {
    actorId: access.actorId,
    canRead: capabilities.canRead,
    canViewSensitive: capabilities.canViewSensitive,
    companyId,
    requestId: access.requestId,
    tenantId: access.tenantId,
  };
};

export const createEmployeeLifecycleWriteContext = async (
  request: Request
): Promise<EmployeeLifecycleApiWriteContext> => {
  const readContext = await createEmployeeLifecycleReadContext(request);

  return {
    ...readContext,
    canWrite: readContext.canRead ?? false,
    actorId: readContext.actorId,
  };
};

export const createEmployeeLifecycleRepositoryScope = (
  context: EmployeeLifecycleManagementPolicyContext
): EmployeeLifecycleRepositoryScope => ({
  companyId: context.companyId ?? undefined,
  tenantId: context.tenantId ?? undefined,
});

export const getEmployeeLifecycleQuery = (
  request: Request
): Record<string, string | undefined> => {
  const url = new URL(request.url);
  const query: Record<string, string | undefined> = {};

  for (const [key, value] of url.searchParams.entries()) {
    query[key] = value.trim() || undefined;
  }

  return query;
};
