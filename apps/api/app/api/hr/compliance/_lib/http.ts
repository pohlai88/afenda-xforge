import type { ComplianceMutationResult } from "@repo/features-employee-management-compliance-regulatory-tracking";
import {
  canReadCompliance,
  canWriteCompliance,
} from "@repo/features-employee-management-compliance-regulatory-tracking";
import { NextResponse } from "next/server";

export const complianceRouteResponsePolicy = {
  blocked: 403,
  invalid: 400,
} as const;

export const ensureComplianceReadAccess = (
  context: unknown
): NextResponse | null =>
  canReadCompliance(context)
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Read access denied for compliance",
          ok: false,
        },
        { status: complianceRouteResponsePolicy.blocked }
      );

export const ensureComplianceWriteAccess = (
  context: unknown
): NextResponse | null =>
  canWriteCompliance(context)
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Write access denied for compliance",
          ok: false,
        },
        { status: complianceRouteResponsePolicy.blocked }
      );

export const respondWithComplianceError = (error: unknown): NextResponse => {
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues?: unknown }).issues)
  ) {
    return NextResponse.json(
      {
        code: "validation_error",
        error: "Invalid compliance request",
        issues: (error as { issues: unknown }).issues,
        ok: false,
      },
      { status: complianceRouteResponsePolicy.invalid }
    );
  }

  return NextResponse.json(
    {
      code: "internal_error",
      error: "Compliance request failed",
      ok: false,
    },
    { status: 500 }
  );
};

export const mutationStatusFromComplianceResult = (
  result: ComplianceMutationResult,
  successStatus = 200
): number => {
  if (result.ok) {
    return successStatus;
  }

  const code = (result as { code?: string }).code;
  if (!code) {
    return 400;
  }

  switch (code) {
    case "conflict":
      return 409;
    case "forbidden":
    case "untrusted_scope":
      return 403;
    case "not_found":
      return 404;
    case "validation_error":
      return 400;
    default:
      return 400;
  }
};
