import type { HrRecordsActionResult } from "@repo/features-employee-management-employee-records-management";

const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const boolHeader = (request: Request, name: string): boolean | undefined => {
  const value = header(request, name);
  if (!value) {
    return;
  }

  return value === "true" || value === "1";
};

export type HrRecordsApiReadContext = {
  canRead: boolean;
  canViewSensitive: boolean;
  organizationId?: string;
  userId?: string;
};

export type HrRecordsApiWriteContext = HrRecordsApiReadContext & {
  canWrite: boolean;
};

export const createHrRecordsReadContext = (
  request: Request
): HrRecordsApiReadContext => ({
  canRead: boolHeader(request, "x-can-read-employee-records") ?? true,
  canViewSensitive:
    boolHeader(request, "x-can-view-sensitive-employee-records") ?? false,
  organizationId: header(request, "x-organization-id"),
  userId: header(request, "x-user-id"),
});

export const createHrRecordsWriteContext = (
  request: Request
): HrRecordsApiWriteContext =>
  ({
    ...createHrRecordsReadContext(request),
    canWrite: boolHeader(request, "x-can-write-employee-records") ?? true,
  }) satisfies HrRecordsApiWriteContext;

export const toHrRecordsJsonResponse = (
  result: HrRecordsActionResult
): Response =>
  new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 400,
    headers: { "content-type": "application/json" },
  });
