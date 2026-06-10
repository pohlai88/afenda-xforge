import type {
  OffboardingReadContext,
  OffboardingWriteContext,
} from "@repo/features-employee-management-offboarding-exit-management";
import { NextResponse } from "next/server";

const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const boolHeader = (request: Request, name: string): boolean | undefined => {
  const value = header(request, name);
  if (!value) {
    return;
  }

  return value === "true" || value === "1";
};

const parseListHeader = (
  request: Request,
  name: string
): string[] | undefined =>
  header(request, name)
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const parseQueryParam = (value: string | undefined): string | undefined => {
  if (value === undefined) {
    return;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const createOffboardingReadContext = (
  request: Request
): OffboardingReadContext => ({
  actorId: header(request, "x-actor-id") ?? header(request, "x-user-id"),
  canRead: boolHeader(request, "x-can-read-offboarding") ?? true,
  companyId: header(request, "x-company-id"),
  grantedCapabilities: parseListHeader(request, "x-granted-capabilities"),
  grantedPermissions: parseListHeader(request, "x-granted-permissions"),
  requestId: header(request, "x-request-id"),
  sensitiveReadGranted:
    boolHeader(request, "x-can-read-sensitive-offboarding") ?? false,
  tenantId: header(request, "x-tenant-id"),
});

export const createOffboardingWriteContext = (
  request: Request
): OffboardingWriteContext => ({
  ...createOffboardingReadContext(request),
  actorId:
    header(request, "x-actor-id") ?? header(request, "x-user-id") ?? "api",
  canWrite: boolHeader(request, "x-can-write-offboarding") ?? true,
});

export const getOffboardingQuery = (
  request: Request
): Record<string, string | number> => {
  const url = new URL(request.url);
  const query: Record<string, string | number> = {};

  for (const [key, value] of url.searchParams.entries()) {
    if (key === "page" || key === "pageSize") {
      query[key] = Number(value);
      continue;
    }

    const parsedValue = parseQueryParam(value);
    if (parsedValue !== undefined) {
      query[key] = parsedValue;
    }
  }

  return query;
};

export const toOffboardingErrorResponse = (error: unknown): Response => {
  const message =
    error instanceof Error ? error.message : "Unexpected offboarding error";
  const normalizedMessage = message.toLowerCase();

  let status = 400;

  if (normalizedMessage.includes("not found")) {
    status = 404;
  } else if (normalizedMessage.includes("denied")) {
    status = 403;
  } else if (normalizedMessage.includes("already exists")) {
    status = 409;
  }

  return NextResponse.json({ ok: false, error: message }, { status });
};
