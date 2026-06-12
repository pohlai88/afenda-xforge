import type { DocumentsManagementPolicyContext } from "@repo/features-employee-management-documents-management";
import {
  canDownloadDocumentsManagement,
  canReadDocumentsManagement,
  canWriteDocumentsManagement,
} from "@repo/features-employee-management-documents-management";
import { NextResponse } from "next/server";

export const documentsRouteResponsePolicy = {
  blocked: 403,
  invalid: 400,
} as const;

export const ensureDocumentsManagementReadAccess = (
  context: DocumentsManagementPolicyContext
): NextResponse | null =>
  canReadDocumentsManagement(context)
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Read access denied for documents management",
          ok: false,
        },
        { status: documentsRouteResponsePolicy.blocked }
      );

export const ensureDocumentsManagementWriteAccess = (
  context: DocumentsManagementPolicyContext
): NextResponse | null =>
  canWriteDocumentsManagement(context)
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Write access denied for documents management",
          ok: false,
        },
        { status: documentsRouteResponsePolicy.blocked }
      );

export const ensureDocumentsManagementDownloadAccess = (
  context: DocumentsManagementPolicyContext
): NextResponse | null =>
  canDownloadDocumentsManagement(context)
    ? null
    : NextResponse.json(
        {
          code: "forbidden",
          error: "Document download access denied",
          ok: false,
        },
        { status: documentsRouteResponsePolicy.blocked }
      );

export const respondWithDocumentsManagementError = (
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
        error: "Invalid documents management request",
        issues: (error as { issues: unknown }).issues,
        ok: false,
      },
      { status: documentsRouteResponsePolicy.invalid }
    );
  }

  return NextResponse.json(
    {
      code: "internal_error",
      error: "Documents management request failed",
      ok: false,
    },
    { status: 500 }
  );
};
