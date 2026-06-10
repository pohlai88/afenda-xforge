import { NextResponse } from "next/server";

const extractErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray(error.issues)
  ) {
    const firstIssue = error.issues[0];

    if (
      typeof firstIssue === "object" &&
      firstIssue !== null &&
      "message" in firstIssue &&
      typeof firstIssue.message === "string"
    ) {
      return firstIssue.message;
    }

    return "Invalid request payload";
  }

  return error instanceof Error ? error.message : "Request failed";
};

const resolveStatusCode = (message: string): number => {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("access denied") ||
    normalizedMessage.includes("submission denied") ||
    normalizedMessage.includes("approval denied") ||
    normalizedMessage.includes("rejection denied") ||
    normalizedMessage.includes("outside the current scope")
  ) {
    return 403;
  }

  if (normalizedMessage.includes("not found")) {
    return 404;
  }

  if (normalizedMessage.includes("already exists")) {
    return 409;
  }

  return 400;
};

export const employeeSelfservicePortalErrorResponse = (
  error: unknown
): Response => {
  const message = extractErrorMessage(error);
  return NextResponse.json(
    { ok: false, error: message },
    { status: resolveStatusCode(message) }
  );
};
