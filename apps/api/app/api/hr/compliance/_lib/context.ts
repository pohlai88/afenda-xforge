import type {
  ComplianceReadContext,
  ComplianceWriteContext,
} from "@repo/features-employee-management-compliance-regulatory-tracking";
import {
  filterHrCapabilityPermissions,
  resolveHrComplianceRuntimeAccess,
  resolveHrTenantScopedAccess,
} from "../../_lib/access.ts";

export const createComplianceReadContext = async (
  _request: Request
): Promise<ComplianceReadContext & { tenantId?: string }> => {
  const { access, companyId } = await resolveHrTenantScopedAccess();
  const capabilities = resolveHrComplianceRuntimeAccess(
    access.grantedPermissions
  );
  const grantedCapabilities = filterHrCapabilityPermissions(
    access.grantedPermissions,
    "hr.compliance."
  );

  return {
    canRead: capabilities.canRead || grantedCapabilities.length > 0,
    canViewSensitive:
      capabilities.canViewSensitive ||
      grantedCapabilities.includes("hr.compliance.evidence.sensitive.read"),
    companyId,
    grantedCapabilities,
    tenantId: access.tenantId,
  };
};

export const createComplianceWriteContext = async (
  request: Request
): Promise<
  ComplianceWriteContext & {
    actorId?: string;
    canWrite?: boolean;
    tenantId?: string;
  }
> => {
  const readContext = await createComplianceReadContext(request);
  const { access } = await resolveHrTenantScopedAccess();
  const capabilities = resolveHrComplianceRuntimeAccess(
    access.grantedPermissions
  );
  const grantedCapabilities = filterHrCapabilityPermissions(
    access.grantedPermissions,
    "hr.compliance."
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
    tenantId: access.tenantId,
    grantedCapabilities,
  } as ComplianceWriteContext & {
    actorId?: string;
    canWrite?: boolean;
    tenantId?: string;
    grantedCapabilities?: string[];
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
