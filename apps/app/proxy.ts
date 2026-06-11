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
import type { SecurityBoundaryDecision } from "@repo/security";
import {
  assessErpRequestBoundary,
  createSecurityMiddleware,
} from "@repo/security";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import {
  localePrefixFromPathname,
  stripLocalePrefix,
  withLocalePrefix,
} from "./i18n/locale-path";
import { routing } from "./i18n/routing";
import {
  fromPackageNextResponse,
  toPackageNextRequest,
  toPackageNextResponse,
} from "./lib/proxy/next-types.ts";

const handleI18nRouting = createIntlMiddleware(routing);

const evaluateSecurity = createSecurityMiddleware();

const applyBoundaryResponseState = (
  response: NextResponse,
  boundary: SecurityBoundaryDecision
): NextResponse => {
  for (const cookie of boundary.cookies) {
    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      maxAge: cookie.maxAge,
      path: cookie.path,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
    });
  }

  if (boundary.riskSignals.length > 0) {
    response.headers.set(
      "x-security-risk-signals",
      boundary.riskSignals.join(",")
    );
  }

  return response;
};

const PROTECTED_APP_PREFIXES = [
  "/admin",
  "/assistant",
  "/audit",
  "/dashboard",
  "/hr",
  "/settings",
] as const;

const isProtectedAppPath = (pathname: string): boolean =>
  PROTECTED_APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

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

  const pathnameWithoutLocale = stripLocalePrefix(pathname);
  const localePrefix = localePrefixFromPathname(pathname);

  if (isProtectedAppPath(pathnameWithoutLocale) && !isAuthenticated) {
    return createRedirectResponse(
      request,
      withLocalePrefix(
        buildSignInPath(`${pathnameWithoutLocale}${search}`),
        localePrefix
      )
    );
  }

  if (isGuestOnlyPath(pathnameWithoutLocale) && isAuthenticated) {
    const next = request.nextUrl.searchParams.get("next");
    const redirectTo = resolvePostAuthRedirectPath(
      next,
      DEFAULT_AUTHENTICATED_REDIRECT_PATH
    );

    return createRedirectResponse(
      request,
      withLocalePrefix(redirectTo, localePrefix)
    );
  }

  return null;
};

const shouldSkipIntlRouting = (pathname: string): boolean =>
  pathname.startsWith("/api") || pathname.startsWith("/auth");

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const packageRequest = toPackageNextRequest(request);
  const context = createProxyContext(packageRequest);
  // Client-supplied tenant/user identifiers are never authoritative.
  context.tenantId = undefined;
  context.userId = undefined;
  const proxyHeaders = createProxyHeaders(packageRequest);
  const preflightResponse = createPreflightResponse(packageRequest);

  if (preflightResponse) {
    return fromPackageNextResponse(
      applyProxyResponseHeaders(preflightResponse, context, proxyHeaders)
    );
  }

  const pathname = request.nextUrl.pathname;
  let intlResponse: NextResponse | undefined;

  if (!shouldSkipIntlRouting(pathname)) {
    intlResponse = handleI18nRouting(request);

    if (intlResponse.status >= 300 && intlResponse.status < 400) {
      return intlResponse;
    }
  }

  const baseResponse =
    intlResponse ??
    fromPackageNextResponse(createProxyBaseResponse(packageRequest, context));
  const authResult = await authMiddleware(packageRequest);
  const assessment = await evaluateSecurity(packageRequest);
  const boundary = assessErpRequestBoundary(packageRequest, {
    csrf: {
      sessionId: authResult.sessionId,
      userId: authResult.userId,
    },
    enableBotProtection: assessment.policy.enableBotProtection,
    allowedUserAgents: assessment.policy.allowedUserAgents,
    blockedPathPrefixes: assessment.policy.blockedPathPrefixes,
  });

  if (authResult.userId) {
    context.userId = authResult.userId;
  }

  if (!assessment.decision.allow) {
    const response = NextResponse.json(
      {
        error: assessment.decision.reason ?? "forbidden",
      },
      {
        status: 403,
      }
    );

    mergeNextResponses(toPackageNextResponse(response), authResult.response);
    return applyBoundaryResponseState(
      fromPackageNextResponse(
        applyProxyResponseHeaders(toPackageNextResponse(response), context, {
          ...proxyHeaders,
          ...assessment.headers,
        })
      ),
      boundary
    );
  }

  if (!boundary.allow) {
    const response = NextResponse.json(
      {
        error: boundary.reason ?? "forbidden",
      },
      {
        status: 403,
      }
    );

    mergeNextResponses(toPackageNextResponse(response), authResult.response);
    return applyBoundaryResponseState(
      fromPackageNextResponse(
        applyProxyResponseHeaders(toPackageNextResponse(response), context, {
          ...proxyHeaders,
          ...assessment.headers,
        })
      ),
      boundary
    );
  }

  const authRedirect = resolveAuthRedirect(request, authResult.isAuthenticated);

  if (authRedirect) {
    mergeNextResponses(
      toPackageNextResponse(authRedirect),
      authResult.response
    );
    return applyBoundaryResponseState(
      fromPackageNextResponse(
        applyProxyResponseHeaders(
          toPackageNextResponse(authRedirect),
          context,
          {
            ...proxyHeaders,
            ...assessment.headers,
          }
        )
      ),
      boundary
    );
  }

  mergeNextResponses(toPackageNextResponse(baseResponse), authResult.response);

  return applyBoundaryResponseState(
    fromPackageNextResponse(
      applyProxyResponseHeaders(toPackageNextResponse(baseResponse), context, {
        ...proxyHeaders,
        ...assessment.headers,
      })
    ),
    boundary
  );
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)", "/api(.*)"],
};
