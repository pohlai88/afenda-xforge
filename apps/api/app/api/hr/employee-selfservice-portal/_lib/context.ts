const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const boolHeader = (request: Request, name: string): boolean | undefined => {
  const value = header(request, name);
  if (!value) {
    return;
  }

  return value === "true" || value === "1";
};

export type EmployeeSelfservicePortalApiReadContext = {
  actorEmployeeId?: string;
  actorId?: string;
  canRead: boolean;
  canReadAll: boolean;
  canViewSensitive: boolean;
  companyId?: string;
  organizationId?: string;
  requestId?: string;
  tenantId?: string;
  userId?: string;
};

export type EmployeeSelfservicePortalApiWriteContext =
  EmployeeSelfservicePortalApiReadContext & {
    canWrite: boolean;
  };

export const createEmployeeSelfservicePortalReadContext = (
  request: Request
): EmployeeSelfservicePortalApiReadContext => ({
  actorEmployeeId: header(request, "x-actor-employee-id"),
  actorId: header(request, "x-actor-id"),
  canRead:
    boolHeader(request, "x-can-read-employee-selfservice-portal") ?? false,
  canReadAll:
    boolHeader(request, "x-can-read-all-employee-selfservice-portal") ?? false,
  canViewSensitive:
    boolHeader(request, "x-can-view-sensitive-employee-selfservice-portal") ??
    false,
  companyId: header(request, "x-company-id"),
  organizationId: header(request, "x-organization-id"),
  requestId: header(request, "x-request-id"),
  tenantId: header(request, "x-tenant-id"),
  userId: header(request, "x-user-id"),
});

export const createEmployeeSelfservicePortalWriteContext = (
  request: Request
): EmployeeSelfservicePortalApiWriteContext => ({
  ...createEmployeeSelfservicePortalReadContext(request),
  canWrite:
    boolHeader(request, "x-can-write-employee-selfservice-portal") ?? false,
});
