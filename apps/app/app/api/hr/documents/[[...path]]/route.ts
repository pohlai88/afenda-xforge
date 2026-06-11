import type { NextRequest } from "next/server";
import { mapApiRouteError } from "../../../../../lib/api/route-errors.ts";

const LOCAL_API_ORIGIN = "http://127.0.0.1:3002";

const HOP_BY_HOP_HEADERS = [
  "connection",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
] as const;

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

type StreamingRequestInit = RequestInit & {
  duplex?: "half";
};

const trimTrailingSlash = (value: string): string =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const resolveApiOrigin = (): string | null => {
  const configuredOrigin = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredOrigin) {
    return trimTrailingSlash(configuredOrigin);
  }

  return process.env.NODE_ENV === "production" ? null : LOCAL_API_ORIGIN;
};

const createUpstreamHeaders = (request: NextRequest): Headers => {
  const headers = new Headers(request.headers);

  for (const headerName of HOP_BY_HOP_HEADERS) {
    headers.delete(headerName);
  }

  return headers;
};

const createClientResponse = (upstream: Response): Response => {
  const headers = new Headers(upstream.headers);

  for (const headerName of HOP_BY_HOP_HEADERS) {
    headers.delete(headerName);
  }

  return new Response(upstream.body, {
    headers,
    status: upstream.status,
    statusText: upstream.statusText,
  });
};

const proxyRequest = async (
  request: NextRequest,
  context: RouteContext
): Promise<Response> => {
  try {
    const apiOrigin = resolveApiOrigin();

    if (!apiOrigin) {
      return Response.json(
        { ok: false, error: "API origin is not configured" },
        { status: 503 }
      );
    }

    const { path = [] } = await context.params;
    const upstreamUrl = new URL(
      ["/api/hr/documents", ...path].join("/"),
      `${apiOrigin}/`
    );

    upstreamUrl.search = request.nextUrl.search;

    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const upstreamInit: StreamingRequestInit = {
      body: hasBody ? request.body : undefined,
      cache: "no-store",
      duplex: hasBody ? "half" : undefined,
      headers: createUpstreamHeaders(request),
      method: request.method,
      redirect: "manual",
    };
    const upstream = await fetch(upstreamUrl, upstreamInit);

    return createClientResponse(upstream);
  } catch (error) {
    return mapApiRouteError(error, "HR document proxy failed");
  }
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
