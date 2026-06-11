import {
  AUTH_ERROR_PATH,
  AUTH_REDIRECT_SEARCH_PARAM,
  DEFAULT_AUTHENTICATED_REDIRECT_PATH,
  resolvePostAuthRedirectPath,
} from "@repo/auth/routes";
import { exchangeCodeForSession } from "@repo/auth/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const createRedirect = (request: NextRequest, pathname: string): NextResponse =>
  NextResponse.redirect(new URL(pathname, request.nextUrl.origin));

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const next = request.nextUrl.searchParams.get(AUTH_REDIRECT_SEARCH_PARAM);
    const redirectTo = resolvePostAuthRedirectPath(
      next,
      DEFAULT_AUTHENTICATED_REDIRECT_PATH
    );

    if (!(code && (await exchangeCodeForSession(code)))) {
      return createRedirect(request, `${AUTH_ERROR_PATH}?reason=callback`);
    }

    return createRedirect(request, redirectTo);
  } catch {
    return createRedirect(request, `${AUTH_ERROR_PATH}?reason=callback`);
  }
}
