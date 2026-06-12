import type { EmployeeLifecycleManagementPolicyContext } from "@repo/features-employee-management-employee-lifecycle-management/policy";
import type { EmployeeLifecycleRepositoryScope } from "@repo/features-employee-management-employee-lifecycle-management/repository";
import {
  filterHrCapabilityPermissions,
  resolveHrLifecycleRuntimeAccess,
  resolveHrTenantScopedAccess,
} from "../../_lib/access.ts";

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
  const { access, companyId } = await resolveHrTenantScopedAccess();
  const capabilities = resolveHrLifecycleRuntimeAccess(
    access.grantedPermissions
  );
  const grantedCapabilities = filterHrCapabilityPermissions(
    access.grantedPermissions,
    "hr.lifecycle."
  );

  return {
    actorId: access.actorId,
    canRead: capabilities.canRead || grantedCapabilities.length > 0,
    canViewSensitive:
      capabilities.canViewSensitive ||
      grantedCapabilities.includes("hr.lifecycle.sensitive.read"),
    companyId,
    requestId: access.requestId,
    tenantId: access.tenantId,
  };
};

export const createEmployeeLifecycleWriteContext = async (
  request: Request
): Promise<EmployeeLifecycleApiWriteContext> => {
  const readContext = await createEmployeeLifecycleReadContext(request);
  const { access } = await resolveHrTenantScopedAccess();
  const capabilities = resolveHrLifecycleRuntimeAccess(
    access.grantedPermissions
  );
  const grantedCapabilities = filterHrCapabilityPermissions(
    access.grantedPermissions,
    "hr.lifecycle."
  );
  const canWrite =
    capabilities.canWrite ||
    grantedCapabilities.some((capability) => capability.endsWith(".write"));

  return {
    ...readContext,
    canWrite,
    actorId: access.actorId,
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
