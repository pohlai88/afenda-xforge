import type { EmployeeLifecycleManagementPolicyContext } from "@repo/features-employee-management-employee-lifecycle-management/policy";
import {
  canReadEmployeeLifecycleManagement,
  canWriteEmployeeLifecycleManagement,
} from "@repo/features-employee-management-employee-lifecycle-management/policy";
import { NextResponse } from "next/server";

export const employeeLifecycleRouteResponsePolicy = {
  blocked: 403,
  invalid: 400,
} as const;

export const ensureEmployeeLifecycleReadAccess = (
  context: EmployeeLifecycleManagementPolicyContext
): NextResponse | null =>
  canReadEmployeeLifecycleManagement(context)
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Read access denied for employee lifecycle",
          ok: false,
        },
        { status: employeeLifecycleRouteResponsePolicy.blocked }
      );

export const ensureEmployeeLifecycleWriteAccess = (
  context: EmployeeLifecycleManagementPolicyContext
): NextResponse | null =>
  canWriteEmployeeLifecycleManagement(context)
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Write access denied for employee lifecycle",
          ok: false,
        },
        { status: employeeLifecycleRouteResponsePolicy.blocked }
      );

export const respondWithEmployeeLifecycleError = (
  error: unknown
): NextResponse => {
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues?: unknown }).issues)
  ) {
    return NextResponse.json(
      {
        code: "validation_error",
        error: "Invalid employee lifecycle request",
        issues: (error as { issues: unknown }).issues,
        ok: false,
      },
      { status: employeeLifecycleRouteResponsePolicy.invalid }
    );
  }

  return NextResponse.json(
    {
      code: "internal_error",
      error: "Employee lifecycle request failed",
      ok: false,
    },
    { status: 500 }
  );
};
