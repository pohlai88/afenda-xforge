import type { EmployeeLifecycleManagementPolicyContext } from "@repo/features-employee-management-employee-lifecycle-management/policy";
import type { EmployeeLifecycleRepositoryScope } from "@repo/features-employee-management-employee-lifecycle-management/repository";

const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const boolHeader = (request: Request, name: string): boolean | undefined => {
  const value = header(request, name);
  if (!value) {
    return;
  }

  return value === "true" || value === "1";
};

export type EmployeeLifecycleApiReadContext = EmployeeLifecycleManagementPolicyContext;

export type EmployeeLifecycleApiWriteContext =
  EmployeeLifecycleApiReadContext & {
    canWrite: boolean;
    actorId?: string;
  };

export const createEmployeeLifecycleReadContext = (
  request: Request
): EmployeeLifecycleApiReadContext => ({
  canRead: boolHeader(request, "x-can-read-employee-lifecycle") ?? true,
  canViewSensitive:
    boolHeader(request, "x-can-view-sensitive-employee-lifecycle") ?? false,
  companyId: header(request, "x-company-id"),
  tenantId: header(request, "x-tenant-id"),
  actorId: header(request, "x-actor-id"),
  requestId: header(request, "x-request-id"),
});

export const createEmployeeLifecycleWriteContext = (
  request: Request
): EmployeeLifecycleApiWriteContext => ({
  ...createEmployeeLifecycleReadContext(request),
  canWrite: boolHeader(request, "x-can-write-employee-lifecycle") ?? true,
  actorId: header(request, "x-actor-id") ?? "api",
});

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

