import {
  defaultLocale,
  localeHeaderName,
  resolveLocaleFromHeader,
  supportedLocales,
} from "@repo/internationalization";
import type {
  SecurityCorsOptions,
  SecurityHeadersOptions,
} from "@repo/security";
import {
  applySecurityCorsHeaders,
  createSecurityCorsConfig,
  createSecurityHeaders,
} from "@repo/security";
import { generateId } from "@repo/shared";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export type ProxyContext = {
  apiVersion: string;
  locale: string;
  method: string;
  path: string;
  requestId: string;
  startTime: number;
  tenantId?: string;
  traceId: string;
  userId?: string;
};

export type ProxyContextOptions = {
  apiVersionHeader?: string;
  defaultApiVersion?: string;
  defaultLocale?: string;
  localeHeader?: string;
  requestIdHeader?: string;
  supportedLocales?: string[];
  tenantIdHeader?: string;
  traceIdHeader?: string;
  userIdHeader?: string;
};

export type ProxyHeaderOptions = {
  cors?: SecurityCorsOptions;
  security?: SecurityHeadersOptions;
};

const DEFAULT_API_VERSION = "v1";

const isTruthy = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const generateRequestId = (): string => generateId("req");

export const generateTraceId = (): string => generateId("trc");

const extractApiVersionFromPath = (pathname: string): string | undefined => {
  const match = pathname.match(/\/api\/(v\d+)(?:\/|$)/i);

  return match?.[1];
};

export const isApiProxyRequest = (request: NextRequest): boolean => {
  const pathname = new URL(request.url).pathname;

  return pathname.startsWith("/api/");
};

export const isProxyPreflightRequest = (request: NextRequest): boolean =>
  request.method === "OPTIONS" && isApiProxyRequest(request);

export const createProxyContext = (
  request: NextRequest,
  options: ProxyContextOptions = {}
): ProxyContext => {
  const pathname = new URL(request.url).pathname;
  const requestIdHeader = options.requestIdHeader ?? "x-request-id";
  const traceIdHeader = options.traceIdHeader ?? "x-trace-id";
  const tenantIdHeader = options.tenantIdHeader ?? "x-tenant-id";
  const userIdHeader = options.userIdHeader ?? "x-user-id";
  const localeHeader = options.localeHeader ?? "accept-language";
  const apiVersionHeader = options.apiVersionHeader ?? "x-api-version";
  const availableLocales = options.supportedLocales ?? supportedLocales;
  const fallbackLocale = options.defaultLocale ?? defaultLocale;
  const defaultApiVersion = options.defaultApiVersion ?? DEFAULT_API_VERSION;
  const headerLocale =
    request.headers.get(localeHeaderName) ??
    request.headers.get(localeHeader) ??
    undefined;
  const requestId = request.headers.get(requestIdHeader) ?? undefined;
  const traceId = request.headers.get(traceIdHeader) ?? undefined;
  const tenantId = request.headers.get(tenantIdHeader) ?? undefined;
  const userId = request.headers.get(userIdHeader) ?? undefined;
  const apiVersion =
    request.headers.get(apiVersionHeader) ??
    extractApiVersionFromPath(pathname) ??
    defaultApiVersion;

  return {
    apiVersion,
    locale: resolveLocaleFromHeader(headerLocale, {
      fallbackLocale,
      supportedLocales: availableLocales,
    }),
    method: request.method,
    path: pathname,
    requestId: isTruthy(requestId) ? requestId : generateRequestId(),
    startTime: Date.now(),
    tenantId: isTruthy(tenantId) ? tenantId : undefined,
    traceId: isTruthy(traceId) ? traceId : generateTraceId(),
    userId: isTruthy(userId) ? userId : undefined,
  };
};

export const createProxyRequestHeaders = (
  request: NextRequest,
  context: ProxyContext,
  options: ProxyContextOptions = {}
): Headers => {
  const headers = new Headers(request.headers);
  const tenantIdHeader = options.tenantIdHeader ?? "x-tenant-id";
  const userIdHeader = options.userIdHeader ?? "x-user-id";
  const requestIdHeader = options.requestIdHeader ?? "x-request-id";
  const traceIdHeader = options.traceIdHeader ?? "x-trace-id";
  const apiVersionHeader = options.apiVersionHeader ?? "x-api-version";

  headers.set(requestIdHeader, context.requestId);
  headers.set(traceIdHeader, context.traceId);
  headers.set(apiVersionHeader, context.apiVersion);
  headers.set("x-locale", context.locale);

  if (context.tenantId) {
    headers.set(tenantIdHeader, context.tenantId);
  }

  if (context.userId) {
    headers.set(userIdHeader, context.userId);
  }

  return headers;
};

export const createProxyBaseResponse = (
  request: NextRequest,
  context: ProxyContext,
  options: ProxyContextOptions = {}
): NextResponse =>
  NextResponse.next({
    request: {
      headers: createProxyRequestHeaders(request, context, options),
    },
  });

const shouldCopyHeader = (name: string): boolean => {
  const normalized = name.toLowerCase();

  return normalized !== "set-cookie" && !normalized.startsWith("x-middleware-");
};

export const mergeNextResponses = (
  target: NextResponse,
  ...sources: NextResponse[]
): NextResponse => {
  for (const source of sources) {
    for (const [key, value] of source.headers.entries()) {
      if (shouldCopyHeader(key)) {
        target.headers.set(key, value);
      }
    }

    for (const cookie of source.cookies.getAll()) {
      const { name, value, ...options } = cookie;
      target.cookies.set(name, value, options);
    }
  }

  return target;
};

export const createCorsHeaders = (
  request: NextRequest,
  options: SecurityCorsOptions = {}
): Record<string, string> => {
  const config = createSecurityCorsConfig(options);
  const origin = request.headers.get("origin") ?? undefined;
  const headers = applySecurityCorsHeaders({}, config, origin);

  if (headers["Access-Control-Allow-Origin"]) {
    const vary = headers.Vary;

    headers.Vary = vary ? `${vary}, Origin` : "Origin";
  }

  return headers;
};

export const createProxyHeaders = (
  request: NextRequest,
  options: ProxyHeaderOptions = {}
): Record<string, string> => {
  const headers: Record<string, string> = {
    ...createSecurityHeaders(options.security),
  };

  if (isApiProxyRequest(request)) {
    Object.assign(headers, createCorsHeaders(request, options.cors));
  }

  return headers;
};

export const createPreflightResponse = (
  request: NextRequest,
  options: ProxyHeaderOptions = {}
): NextResponse | null => {
  if (!isProxyPreflightRequest(request)) {
    return null;
  }

  return new NextResponse(null, {
    status: 204,
    headers: createProxyHeaders(request, options),
  });
};

export const applyProxyResponseHeaders = (
  response: NextResponse,
  context: ProxyContext,
  headers: Record<string, string> = {}
): NextResponse => {
  response.headers.set("x-request-id", context.requestId);
  response.headers.set("x-trace-id", context.traceId);
  response.headers.set(
    "x-response-time",
    `${Date.now() - context.startTime}ms`
  );
  response.headers.set("x-api-version", context.apiVersion);
  response.headers.set("x-locale", context.locale);

  if (context.tenantId) {
    response.headers.set("x-tenant-id", context.tenantId);
  }

  if (context.userId) {
    response.headers.set("x-user-id", context.userId);
  }

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
};

export type {
  SecurityCorsOptions,
  SecurityHeadersOptions,
} from "@repo/security";
export {
  applySecurityCorsHeaders,
  createSecurityCorsConfig,
  createSecurityHeaders,
  developmentSecurityCors,
  productionSecurityCors,
} from "@repo/security";
