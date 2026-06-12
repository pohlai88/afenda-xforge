import { NextResponse } from "next/server";

import type {
  EmployeeSelfservicePortalApiReadContext,
  EmployeeSelfservicePortalApiWriteContext,
} from "./context.ts";

export const employeeSelfservicePortalRouteResponsePolicy = {
  blocked: 403,
  invalid: 400,
} as const;

export const ensureEmployeeSelfservicePortalReadAccess = (
  context: EmployeeSelfservicePortalApiReadContext
): NextResponse | null =>
  context.canRead
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Read access denied for employee self-service portal",
          ok: false,
        },
        { status: employeeSelfservicePortalRouteResponsePolicy.blocked }
      );

export const ensureEmployeeSelfservicePortalWriteAccess = (
  context: EmployeeSelfservicePortalApiWriteContext
): NextResponse | null =>
  context.canWrite
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Write access denied for employee self-service portal",
          ok: false,
        },
        { status: employeeSelfservicePortalRouteResponsePolicy.blocked }
      );

export const ensureEmployeeSelfservicePortalActorReadAccess = (
  context: EmployeeSelfservicePortalApiReadContext
): NextResponse | null => {
  const readDenied = ensureEmployeeSelfservicePortalReadAccess(context);

  if (readDenied) {
    return readDenied;
  }

  if (!context.actorEmployeeId) {
    return NextResponse.json(
      {
        code: "forbidden",
        error: "Employee portal actor context is unavailable",
        ok: false,
      },
      { status: employeeSelfservicePortalRouteResponsePolicy.blocked }
    );
  }

  return null;
};

export const requireEmployeeSelfservicePortalActorEmployeeId = (
  context: EmployeeSelfservicePortalApiReadContext
): string => {
  if (!context.actorEmployeeId) {
    throw new Error("Employee portal actor context is unavailable");
  }

  return context.actorEmployeeId;
};

export const employeeSelfservicePortalReadDeniedResponse = (): NextResponse =>
  NextResponse.json(
    {
      code: "forbidden",
      error: "Read access denied for employee self-service portal",
      ok: false,
    },
    { status: employeeSelfservicePortalRouteResponsePolicy.blocked }
  );
