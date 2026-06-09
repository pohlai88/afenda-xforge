import {
  createCSRFDecision,
  createSignedCSRFToken,
  validateSignedCSRFToken,
} from "./csrf.ts";
import { loadSecurityKeys } from "./keys.ts";
import { createRequestSecurityDecision, isSafeMethod } from "./request.ts";

export const DEFAULT_CSRF_COOKIE_NAME = "xforge_csrf";
export const DEFAULT_CSRF_HEADER_NAME = "x-csrf-token";

type SecurityBoundaryCookie = {
  httpOnly?: boolean;
  maxAge?: number;
  name: string;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  value: string;
};

export type SecurityBoundaryOptions = {
  allowedUserAgents?: string[];
  blockedPathPrefixes?: string[];
  csrf?: {
    cookieName?: string;
    enabled?: boolean;
    headerName?: string;
    maxAgeMs?: number;
    secret?: string;
    sessionId?: string;
    userId?: string;
  };
  enableBotProtection?: boolean;
  now?: number;
};

export type SecurityBoundaryDecision = {
  allow: boolean;
  cookies: SecurityBoundaryCookie[];
  headers: Record<string, string>;
  reason?: string;
  riskSignals: string[];
};

const parseCookieHeader = (
  cookieHeader: string | null
): Map<string, string> => {
  const cookies = new Map<string, string>();

  for (const segment of cookieHeader?.split(";") ?? []) {
    const [rawName, ...rawValue] = segment.split("=");
    const name = rawName?.trim();

    if (!name) {
      continue;
    }

    cookies.set(name, decodeURIComponent(rawValue.join("=").trim()));
  }

  return cookies;
};

const isHttpsRequest = (request: Request): boolean =>
  new URL(request.url).protocol === "https:";

const isBrowserStateChangingRequest = (request: Request): boolean =>
  Boolean(
    request.headers.get("origin") ??
      request.headers.get("sec-fetch-site") ??
      request.headers.get("cookie")
  );

const resolveCsrfSecret = (configuredSecret?: string): string | undefined => {
  const env = loadSecurityKeys();

  return (
    configuredSecret ??
    env.SECURITY_CSRF_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY
  );
};

const createCsrfCookie = ({
  maxAgeMs,
  name,
  request,
  value,
}: {
  maxAgeMs: number;
  name: string;
  request: Request;
  value: string;
}): SecurityBoundaryCookie => ({
  httpOnly: false,
  maxAge: Math.floor(maxAgeMs / 1000),
  name,
  path: "/",
  sameSite: "lax",
  secure: isHttpsRequest(request),
  value,
});

const createCsrfRefreshCookie = ({
  maxAgeMs,
  name,
  request,
  secret,
  sessionId,
  userId,
}: {
  maxAgeMs: number;
  name: string;
  request: Request;
  secret: string;
  sessionId: string;
  userId?: string;
}): SecurityBoundaryCookie =>
  createCsrfCookie({
    maxAgeMs,
    name,
    request,
    value: createSignedCSRFToken({
      maxAgeMs,
      secret,
      sessionId,
      userId,
    }),
  });

export const assessErpRequestBoundary = (
  request: Request,
  options: SecurityBoundaryOptions = {}
): SecurityBoundaryDecision => {
  const env = loadSecurityKeys();
  const requestDecision = createRequestSecurityDecision(request, {
    allowedUserAgents: options.allowedUserAgents,
    allowUnsafeMethods: true,
    blockedPathPrefixes: options.blockedPathPrefixes,
    enableBotProtection: options.enableBotProtection,
  });

  if (!requestDecision.allow) {
    return {
      allow: false,
      cookies: [],
      headers: {},
      reason: requestDecision.reason,
      riskSignals: requestDecision.riskSignals,
    };
  }

  const csrfEnabled = options.csrf?.enabled ?? true;
  const sessionId = options.csrf?.sessionId;
  const secret = resolveCsrfSecret(options.csrf?.secret);
  const maxAgeMs = options.csrf?.maxAgeMs ?? 24 * 60 * 60 * 1000;
  const cookieName =
    options.csrf?.cookieName ??
    env.SECURITY_CSRF_COOKIE_NAME ??
    DEFAULT_CSRF_COOKIE_NAME;
  const headerName =
    options.csrf?.headerName ??
    env.SECURITY_CSRF_HEADER_NAME ??
    DEFAULT_CSRF_HEADER_NAME;

  if (!(csrfEnabled && sessionId)) {
    return {
      allow: true,
      cookies: [],
      headers: {},
      reason: requestDecision.reason,
      riskSignals: requestDecision.riskSignals,
    };
  }

  if (!secret) {
    return {
      allow: false,
      cookies: [],
      headers: {},
      reason: "csrf-unconfigured",
      riskSignals: requestDecision.riskSignals,
    };
  }

  if (isSafeMethod(request.method)) {
    const cookies = parseCookieHeader(request.headers.get("cookie"));
    const existingToken = cookies.get(cookieName);
    const shouldReuseToken =
      existingToken &&
      validateSignedCSRFToken({
        maxAgeMs,
        secret,
        sessionId,
        token: existingToken,
        userId: options.csrf?.userId,
      });

    return {
      allow: true,
      cookies: shouldReuseToken
        ? []
        : [
            createCsrfRefreshCookie({
              maxAgeMs,
              name: cookieName,
              request,
              secret,
              sessionId,
              userId: options.csrf?.userId,
            }),
          ],
      headers: {},
      reason: "csrf-issued",
      riskSignals: requestDecision.riskSignals,
    };
  }

  if (!isBrowserStateChangingRequest(request)) {
    return {
      allow: true,
      cookies: [],
      headers: {},
      reason: "non-browser-unsafe-request",
      riskSignals: requestDecision.riskSignals,
    };
  }

  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const cookieToken = cookies.get(cookieName);
  const headerToken = request.headers.get(headerName);

  if (!(cookieToken && headerToken && cookieToken === headerToken)) {
    return {
      allow: false,
      cookies: [],
      headers: {},
      reason: "csrf-double-submit-mismatch",
      riskSignals: requestDecision.riskSignals,
    };
  }

  const csrfDecision = createCSRFDecision({
    maxAgeMs,
    method: request.method,
    now: options.now,
    secret,
    sessionId,
    token: headerToken,
    userId: options.csrf?.userId,
  });

  if (!csrfDecision.allow) {
    return {
      allow: false,
      cookies: [],
      headers: {},
      reason: csrfDecision.reason,
      riskSignals: requestDecision.riskSignals,
    };
  }

  return {
    allow: true,
    cookies: csrfDecision.token
      ? [
          createCsrfCookie({
            maxAgeMs,
            name: cookieName,
            request,
            value: csrfDecision.token,
          }),
        ]
      : [],
    headers: {},
    reason: csrfDecision.reason,
    riskSignals: requestDecision.riskSignals,
  };
};
