import {
  AUTH_ERROR_PATH,
  AUTH_REDIRECT_SEARCH_PARAM,
  DEFAULT_AUTHENTICATED_REDIRECT_PATH,
  resolvePostAuthRedirectPath,
  verifyOtpCode,
} from "@repo/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type VerifyOtpType = Parameters<typeof verifyOtpCode>[0]["type"];

const createRedirect = (request: NextRequest, pathname: string): NextResponse =>
  NextResponse.redirect(new URL(pathname, request.nextUrl.origin));

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as VerifyOtpType | null;
  const next = request.nextUrl.searchParams.get(AUTH_REDIRECT_SEARCH_PARAM);
  const redirectTo = resolvePostAuthRedirectPath(
    next,
    DEFAULT_AUTHENTICATED_REDIRECT_PATH
  );

  if (!(tokenHash && type && (await verifyOtpCode({ tokenHash, type })))) {
    return createRedirect(request, `${AUTH_ERROR_PATH}?reason=confirm`);
  }

  return createRedirect(request, redirectTo);
}
