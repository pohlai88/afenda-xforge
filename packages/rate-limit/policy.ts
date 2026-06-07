export type RateLimitScope =
  | "ip"
  | "user"
  | "tenant"
  | "company"
  | "route"
  | "composite";

export type RateLimitContext = {
  ip?: string;
  userId?: string;
  actorId?: string;
  tenantId?: string;
  companyId?: string;
  grantId?: string;
  route?: string;
  method?: string;
  keySuffix?: string;
};

export type RateLimitPolicy = {
  namespace: string;
  scope: RateLimitScope;
  limit: number;
  windowSeconds: number;
  blockOnExhaustion: boolean;
  includeHeaders: boolean;
  route?: string;
  keySuffix?: string;
};

export type RateLimitPolicyOverrides = Partial<
  Omit<RateLimitPolicy, "blockOnExhaustion" | "includeHeaders">
> & {
  blockOnExhaustion?: boolean;
  includeHeaders?: boolean;
};

export type RateLimitDecision = {
  key: string;
  policy: RateLimitPolicy;
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds: number;
};

const normalizeSegment = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "unknown";

export const createRateLimitPolicy = (
  overrides: RateLimitPolicyOverrides = {},
  defaults: Pick<RateLimitPolicy, "namespace" | "limit" | "windowSeconds"> = {
    namespace: "xforge",
    limit: 100,
    windowSeconds: 60,
  }
): RateLimitPolicy => ({
  namespace: overrides.namespace ?? defaults.namespace,
  scope: overrides.scope ?? "ip",
  limit: overrides.limit ?? defaults.limit,
  windowSeconds: overrides.windowSeconds ?? defaults.windowSeconds,
  blockOnExhaustion: overrides.blockOnExhaustion ?? true,
  includeHeaders: overrides.includeHeaders ?? true,
  route: overrides.route,
  keySuffix: overrides.keySuffix,
});

export const resolveRateLimitKey = (
  policy: RateLimitPolicy,
  context: RateLimitContext
): string => {
  const parts = [policy.namespace, policy.scope];

  switch (policy.scope) {
    case "ip":
      parts.push(context.ip ?? "anonymous-ip");
      break;
    case "user":
      parts.push(
        context.actorId ?? context.userId ?? context.ip ?? "anonymous"
      );
      break;
    case "tenant":
      parts.push(
        context.tenantId ?? context.userId ?? context.ip ?? "anonymous"
      );
      break;
    case "company":
      parts.push(
        context.tenantId ?? "anonymous-tenant",
        context.companyId ?? "anonymous-company",
        context.grantId ?? "no-grant"
      );
      break;
    case "route":
      parts.push(context.route ?? policy.route ?? "unknown-route");
      parts.push(context.method ?? "any");
      break;
    case "composite":
      parts.push(context.route ?? policy.route ?? "unknown-route");
      parts.push(context.method ?? "any");
      parts.push(context.tenantId ?? "anonymous-tenant");
      parts.push(context.companyId ?? "anonymous-company");
      parts.push(
        context.actorId ?? context.userId ?? context.ip ?? "anonymous"
      );
      break;
    default: {
      const unknownScope: never = policy.scope;
      throw new Error(`Unsupported rate-limit scope: ${unknownScope}`);
    }
  }

  if (policy.route) {
    parts.push(policy.route);
  }

  if (context.keySuffix) {
    parts.push(context.keySuffix);
  }

  if (policy.keySuffix) {
    parts.push(policy.keySuffix);
  }

  return parts.map(normalizeSegment).join(":");
};
