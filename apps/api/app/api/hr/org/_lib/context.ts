import type { HrOrgReadContext } from "@repo/features-employee-management-organizational-chart-hierarchy";

const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const boolHeader = (request: Request, name: string): boolean | undefined => {
  const value = header(request, name);
  if (!value) {
    return;
  }

  return value === "true" || value === "1";
};

const parseQueryParam = (value: string | undefined): string | undefined => {
  if (value === undefined) {
    return;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const createHrOrgReadContext = (request: Request): HrOrgReadContext => ({
  actorId: header(request, "x-actor-id"),
  canRead: boolHeader(request, "x-can-read-organization-structure") ?? true,
  canViewSensitive:
    boolHeader(request, "x-can-view-sensitive-organization-structure") ?? false,
  companyId: header(request, "x-company-id"),
  grantedCapabilities: header(request, "x-granted-capabilities")
    ?.split(",")
    .map((capability) => capability.trim())
    .filter(Boolean),
  tenantId: header(request, "x-tenant-id"),
});

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
