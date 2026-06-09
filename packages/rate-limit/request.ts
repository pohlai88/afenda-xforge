import type { RateLimitContext } from "./policy.ts";

export type RateLimitRequestOptions = {
  trustProxy?: boolean;
};

const trimHeader = (request: Request, headerName: string): string | null =>
  request.headers.get(headerName)?.trim() || null;

export const getClientIp = (
  request: Request,
  options: RateLimitRequestOptions = {}
): string | null => {
  for (const headerName of [
    "cf-connecting-ip",
    "fly-client-ip",
    "true-client-ip",
  ]) {
    const value = trimHeader(request, headerName);

    if (value) {
      return value;
    }
  }

  if (!options.trustProxy) {
    return null;
  }

  const realIp = trimHeader(request, "x-real-ip");

  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers.get("x-forwarded-for");

  if (!forwarded) {
    return null;
  }

  const firstHop = forwarded.split(",")[0]?.trim();
  return firstHop || null;
};

export const getRequestPath = (request: Request): string => {
  try {
    return new URL(request.url).pathname;
  } catch {
    return "/";
  }
};

export const createRateLimitContextFromRequest = (
  request: Request,
  overrides: RateLimitContext = {},
  options: RateLimitRequestOptions = {}
): RateLimitContext => ({
  ip: overrides.ip ?? getClientIp(request, options) ?? undefined,
  userId: overrides.userId,
  actorId: overrides.actorId,
  tenantId: overrides.tenantId,
  companyId: overrides.companyId,
  grantId: overrides.grantId,
  route: overrides.route ?? getRequestPath(request),
  method: overrides.method ?? request.method,
  keySuffix: overrides.keySuffix,
});
