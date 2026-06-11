import type { HrOrgReadContext } from "@repo/features-employee-management-organizational-chart-hierarchy";
import {
  resolveHrOperatorCapabilities,
  resolveHrTenantScopedAccess,
} from "../../_lib/access.ts";

const parseQueryParam = (value: string | undefined): string | undefined => {
  if (value === undefined) {
    return;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const createHrOrgReadContext = async (
  _request: Request
): Promise<HrOrgReadContext> => {
  const { access, companyId } = await resolveHrTenantScopedAccess();
  const capabilities = resolveHrOperatorCapabilities(access);

  return {
    actorId: access.actorId,
    canRead: capabilities.canRead,
    canViewSensitive: capabilities.canViewSensitive,
    companyId,
    grantedCapabilities: capabilities.canRead
      ? ["hr.organization_structure.read"]
      : [],
    tenantId: access.tenantId,
  };
};

export const getHrOrgQuery = (
  request: Request
): Record<string, string | number> => {
  const url = new URL(request.url);
  const query: Record<string, string | number> = {};

  for (const [key, value] of url.searchParams.entries()) {
    if (key === "page" || key === "pageSize") {
      query[key] = Number(value);
      continue;
    }

    const parsed = parseQueryParam(value);
    if (parsed !== undefined) {
      query[key] = parsed;
    }
  }

  return query;
};
