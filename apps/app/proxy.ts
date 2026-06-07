import {
  applyProxyResponseHeaders,
  createPreflightResponse,
  createProxyBaseResponse,
  createProxyContext,
  createProxyHeaders,
  mergeNextResponses,
} from "@repo/api-proxy";
import { authMiddleware } from "@repo/auth/proxy";
import {
  AUTH_ERROR_PATH,
  buildSignInPath,
  DEFAULT_AUTHENTICATED_REDIRECT_PATH,
  resolvePostAuthRedirectPath,
} from "@repo/auth/routes";
import { createSecurityMiddleware } from "@repo/security";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const evaluateSecurity = createSecurityMiddleware();

const isProtectedAppPath = (pathname: string): boolean =>
  pathname === "/dashboard" || pathname.startsWith("/dashboard/");

const isGuestOnlyPath = (pathname: string): boolean =>
  pathname === "/sign-in" ||
  pathname.startsWith("/sign-in/") ||
  pathname === "/sign-up" ||
  pathname.startsWith("/sign-up/");

const createRedirectResponse = (
  request: NextRequest,
  pathname: string
): NextResponse => {
  const url = request.nextUrl.clone();
  const target = new URL(pathname, url.origin);

  return NextResponse.redirect(target);
};

const resolveAuthRedirect = (
  request: NextRequest,
  isAuthenticated: boolean
): NextResponse | null => {
  if (request.method !== "GET") {
    return null;
  }

  const { pathname, search } = request.nextUrl;

  if (pathname === AUTH_ERROR_PATH || pathname.startsWith("/api/")) {
    return null;
  }

  if (isProtectedAppPath(pathname) && !isAuthenticated) {
    return createRedirectResponse(
      request,
      buildSignInPath(`${pathname}${search}`)
    );
  }

  if (isGuestOnlyPath(pathname) && isAuthenticated) {
    const next = request.nextUrl.searchParams.get("next");
    const redirectTo = resolvePostAuthRedirectPath(
      next,
      DEFAULT_AUTHENTICATED_REDIRECT_PATH
    );

    return createRedirectResponse(request, redirectTo);
  }

  return null;
};

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const context = createProxyContext(request);
  const proxyHeaders = createProxyHeaders(request);
  const preflightResponse = createPreflightResponse(request);

  if (preflightResponse) {
    return applyProxyResponseHeaders(preflightResponse, context, proxyHeaders);
  }

  const baseResponse = createProxyBaseResponse(request, context);
  const authResult = await authMiddleware(request);
  const assessment = await evaluateSecurity(request);

  if (!assessment.decision.allow) {
    const response = NextResponse.json(
      {
        error: assessment.decision.reason ?? "forbidden",
      },
      {
        status: 403,
      }
    );

    mergeNextResponses(response, authResult.response);
    return applyProxyResponseHeaders(response, context, {
      ...proxyHeaders,
      ...assessment.headers,
    });
  }

  const authRedirect = resolveAuthRedirect(request, authResult.isAuthenticated);

  if (authRedirect) {
    mergeNextResponses(authRedirect, authResult.response);
    return applyProxyResponseHeaders(authRedirect, context, {
      ...proxyHeaders,
      ...assessment.headers,
    });
  }

  mergeNextResponses(baseResponse, authResult.response);

  return applyProxyResponseHeaders(baseResponse, context, {
    ...proxyHeaders,
    ...assessment.headers,
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/api(.*)"],
};
