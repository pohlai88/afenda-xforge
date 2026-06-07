import { createSecurityHeaders } from "./headers.ts";
import type { SecurityPolicy, SecurityPolicyOverrides } from "./policy.ts";
import { createSecurityPolicy } from "./policy.ts";
import { createRequestSecurityDecision } from "./request.ts";

export type SecurityAssessment = {
  decision: {
    allow: boolean;
    reason?: string;
  };
  headers: Record<string, string>;
  policy: SecurityPolicy;
};

export const assessSecurityRequest = async (
  request: Request,
  overrides: SecurityPolicyOverrides = {}
): Promise<SecurityAssessment> => {
  const policy = createSecurityPolicy(overrides);
  const providerDecision = await policy.provider.assess({
    request,
    policyName: policy.name,
  });
  const requestDecision = createRequestSecurityDecision(request, {
    blockedPathPrefixes: policy.blockedPathPrefixes,
    allowedUserAgents: policy.allowedUserAgents,
    enableBotProtection: policy.enableBotProtection,
    allowUnsafeMethods: policy.allowUnsafeMethods,
  });

  const decision = providerDecision.allow ? requestDecision : providerDecision;

  return {
    policy,
    decision,
    headers: createSecurityHeaders({
      ...policy.headers,
      strictTransportSecurity: policy.enableStrictHeaders,
    }),
  };
};

export const createSecurityMiddleware =
  (overrides: SecurityPolicyOverrides = {}) =>
  async (request: Request): Promise<SecurityAssessment> =>
    assessSecurityRequest(request, overrides);
