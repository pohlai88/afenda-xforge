import {
  canReadHrOrg,
  canWriteHrOrg,
} from "@repo/features-employee-management-organizational-chart-hierarchy";
import { NextResponse } from "next/server";

export const hrOrgRouteResponsePolicy = {
  blocked: 403,
  invalid: 400,
} as const;

export const ensureHrOrgReadAccess = (context: unknown): NextResponse | null =>
  canReadHrOrg(context)
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Read access denied for organization structure",
          ok: false,
        },
        { status: hrOrgRouteResponsePolicy.blocked }
      );

export const ensureHrOrgWriteAccess = (context: unknown): NextResponse | null =>
  canWriteHrOrg(context)
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Write access denied for organization structure",
          ok: false,
        },
        { status: hrOrgRouteResponsePolicy.blocked }
      );

export const respondWithHrOrgError = (error: unknown): NextResponse => {
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues?: unknown }).issues)
  ) {
    return NextResponse.json(
      {
        code: "validation_error",
        error: "Invalid organization structure request",
        issues: (error as { issues: unknown }).issues,
        ok: false,
      },
      { status: hrOrgRouteResponsePolicy.invalid }
    );
  }

  return NextResponse.json(
    {
      code: "internal_error",
      error: "Organization structure request failed",
      ok: false,
    },
    { status: 500 }
  );
};
