import type { RateLimitContext } from "./policy.js";

export const getClientIp = (request: Request): string | null => {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const firstHop = forwarded.split(",")[0]?.trim();

    if (firstHop) {
      return firstHop;
    }
  }

  return (
    request.headers.get("cf-connecting-ip")?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    null
  );
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
  overrides: RateLimitContext = {}
): RateLimitContext => ({
  ip: overrides.ip ?? getClientIp(request) ?? undefined,
  userId: overrides.userId,
  actorId: overrides.actorId,
  tenantId: overrides.tenantId,
  companyId: overrides.companyId,
  grantId: overrides.grantId,
  route: overrides.route ?? getRequestPath(request),
  method: overrides.method ?? request.method,
  keySuffix: overrides.keySuffix,
});
