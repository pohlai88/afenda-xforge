import type {
  OffboardingReadContext,
  OffboardingWriteContext,
} from "@repo/features-employee-management-offboarding-exit-management";
import {
  filterHrCapabilityPermissions,
  resolveHrOperatorCapabilities,
  resolveHrTenantScopedAccess,
} from "../../_lib/access.ts";

export const createOffboardingReadContext = async (
  _request: Request
): Promise<OffboardingReadContext & { tenantId?: string }> => {
  const { access, companyId } = await resolveHrTenantScopedAccess();
  const capabilities = resolveHrOperatorCapabilities(access);
  const grantedCapabilities = filterHrCapabilityPermissions(
    access.grantedPermissions,
    "hr.offboarding."
  );

  return {
    canRead: capabilities.canRead || grantedCapabilities.length > 0,
    canViewSensitive:
      capabilities.canViewSensitive ||
      grantedCapabilities.includes("hr.offboarding.sensitive.read"),
    companyId,
    grantedCapabilities,
    tenantId: access.tenantId,
  };
};

export const createOffboardingWriteContext = async (
  request: Request
): Promise<OffboardingWriteContext & { actorId?: string; tenantId?: string }> => {
  const readContext = await createOffboardingReadContext(request);
  const { access } = await resolveHrTenantScopedAccess();
  const capabilities = resolveHrOperatorCapabilities(access);
  const grantedCapabilities = filterHrCapabilityPermissions(
    access.grantedPermissions,
    "hr.offboarding."
  );
  const canWrite =
    capabilities.canWrite ||
    grantedCapabilities.some((capability) => capability.endsWith(".write"));

  return {
    actorId: access.actorId,
    canRead: readContext.canRead,
    canViewSensitive: readContext.canViewSensitive,
    canWrite,
    companyId: readContext.companyId,
    grantedCapabilities,
    tenantId: access.tenantId,
  };
};

export const getQuery = (request: Request): Record<string, string | number> => {
  const url = new URL(request.url);
  const query: Record<string, string | number> = {};

  for (const [key, value] of url.searchParams.entries()) {
    query[key] = key === "page" || key === "pageSize" ? Number(value) : value;
  }

  return query;
};
