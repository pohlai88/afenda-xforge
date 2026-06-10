import type {
  OffboardingReadContext,
  OffboardingWriteContext,
} from "@repo/features-employee-management-offboarding-exit-management";

const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const boolHeader = (request: Request, name: string): boolean | undefined => {
  const value = header(request, name);
  if (!value) {
    return;
  }

  return value === "true" || value === "1";
};

const listHeader = (request: Request, name: string): string[] | undefined => {
  const value = header(request, name);
  if (!value) {
    return;
  }

  const entries = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return entries.length > 0 ? entries : undefined;
};

export const createOffboardingReadContext = (
  request: Request
): OffboardingReadContext & { tenantId?: string } => ({
  canRead: boolHeader(request, "x-can-read-offboarding"),
  canViewSensitive: boolHeader(request, "x-can-view-sensitive") ?? false,
  companyId: header(request, "x-company-id"),
  grantedCapabilities: listHeader(request, "x-offboarding-capabilities"),
  tenantId: header(request, "x-tenant-id"),
});

export const createOffboardingWriteContext = (
  request: Request
): OffboardingWriteContext & { actorId?: string; tenantId?: string } => ({
  actorId: header(request, "x-actor-id") ?? "api",
  canRead: boolHeader(request, "x-can-read-offboarding"),
  canViewSensitive: boolHeader(request, "x-can-view-sensitive") ?? false,
  canWrite: boolHeader(request, "x-can-write-offboarding"),
  companyId: header(request, "x-company-id"),
  grantedCapabilities: listHeader(request, "x-offboarding-capabilities"),
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
