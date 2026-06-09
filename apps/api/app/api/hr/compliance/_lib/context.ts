import type {
  ComplianceReadContext,
  ComplianceWriteContext,
} from "@repo/features-employee-management-compliance-regulatory-tracking";

const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const boolHeader = (request: Request, name: string): boolean | undefined => {
  const value = header(request, name);
  if (!value) {
    return;
  }

  return value === "true" || value === "1";
};

export const createComplianceReadContext = (
  request: Request
): ComplianceReadContext & { tenantId?: string } => ({
  canRead: boolHeader(request, "x-can-read-compliance") ?? true,
  canViewSensitive: boolHeader(request, "x-can-view-sensitive") ?? false,
  companyId: header(request, "x-company-id"),
  tenantId: header(request, "x-tenant-id"),
});

export const createComplianceWriteContext = (
  request: Request
): ComplianceWriteContext & {
  actorId?: string;
  canWrite?: boolean;
  tenantId?: string;
} => ({
  actorId: header(request, "x-actor-id") ?? "api",
  canRead: true,
  canViewSensitive: boolHeader(request, "x-can-view-sensitive") ?? false,
  canWrite: boolHeader(request, "x-can-write-compliance") ?? true,
  companyId: header(request, "x-company-id"),
  tenantId: header(request, "x-tenant-id"),
});

export const getQuery = (request: Request): Record<string, string | number> => {
  const url = new URL(request.url);
  const query: Record<string, string | number> = {};

  for (const [key, value] of url.searchParams.entries()) {
    query[key] = key === "page" || key === "pageSize" ? Number(value) : value;
  }

  return query;
};
