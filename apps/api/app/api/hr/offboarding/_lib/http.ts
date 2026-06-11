import type { OffboardingMutationResult } from "@repo/features-employee-management-offboarding-exit-management";
import {
  offboardingAuditTrailProjectionSchema,
  offboardingCaseProjectionSchema,
  offboardingFoundationSnapshotSchema,
} from "@repo/features-employee-management-offboarding-exit-management";
import {
  canReadOffboardingExitManagement,
  canWriteOffboardingExitManagement,
} from "@repo/features-employee-management-offboarding-exit-management/policy";
import { NextResponse } from "next/server";

type ParsableSchema<T> = {
  parse(value: unknown): T;
};

export const offboardingRouteResponsePolicy = {
  blocked: 403,
  invalid: 400,
} as const;

export const offboardingCaseListResponseSchema =
  offboardingCaseProjectionSchema.array();
export const offboardingAuditTrailListResponseSchema =
  offboardingAuditTrailProjectionSchema.array();

export const parseOffboardingRequestBody = async <T>(
  request: Request,
  schema: ParsableSchema<T>
): Promise<T> => {
  const body = (await request.json()) as unknown;
  return schema.parse(body);
};

export const parseOffboardingRouteParams = <T>(
  params: T,
  schema: ParsableSchema<T>
): T => schema.parse(params);

export const validateOffboardingResponse = <T>(
  payload: T,
  schema: ParsableSchema<T>
): T => schema.parse(payload);

export const ensureOffboardingReadAccess = (
  context: unknown
): NextResponse | null =>
  canReadOffboardingExitManagement(context)
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Read access denied for offboarding",
          ok: false,
        },
        { status: offboardingRouteResponsePolicy.blocked }
      );

export const ensureOffboardingWriteAccess = (
  context: unknown
): NextResponse | null =>
  canWriteOffboardingExitManagement(context)
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Write access denied for offboarding",
          ok: false,
        },
        { status: offboardingRouteResponsePolicy.blocked }
      );

export const respondWithOffboardingError = (error: unknown): NextResponse => {
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues?: unknown }).issues)
  ) {
    return NextResponse.json(
      {
        code: "validation_error",
        error: "Invalid offboarding request",
        issues: (error as { issues: unknown }).issues,
        ok: false,
      },
      { status: offboardingRouteResponsePolicy.invalid }
    );
  }

  return NextResponse.json(
    {
      code: "internal_error",
      error: "Offboarding request failed",
      ok: false,
    },
    { status: 500 }
  );
};

export const mutationStatusFromResult = (
  result: OffboardingMutationResult,
  successStatus = 200
): number => {
  if (result.ok) {
    return successStatus;
  }

  switch (result.code) {
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

export const validateOffboardingOverview = (payload: unknown) =>
  offboardingFoundationSnapshotSchema.nullable().parse(payload);
