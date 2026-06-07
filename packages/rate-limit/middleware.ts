import { createErrorResponse, RateLimitError } from "@repo/errors";
import { createRateLimitHeaders } from "./headers.js";
import { loadRateLimitKeys } from "./keys.js";
import type {
  RateLimitContext,
  RateLimitDecision,
  RateLimitPolicy,
  RateLimitPolicyOverrides,
} from "./policy.js";
import { createRateLimitPolicy, resolveRateLimitKey } from "./policy.js";
import type { RateLimitProvider } from "./provider.js";
import { createConfiguredRateLimitProvider } from "./provider.js";
import { createRateLimitContextFromRequest } from "./request.js";

export type RateLimitAssessment = {
  allowed: boolean;
  decision: RateLimitDecision;
  headers: Headers;
  response?: Response;
};

export type RateLimitMiddlewareOptions = {
  provider?: RateLimitProvider;
  policy?: RateLimitPolicyOverrides;
  context?: RateLimitContext;
  onDenied?: (assessment: RateLimitAssessment) => Response;
};

const createDefaultPolicy = (
  overrides: RateLimitPolicyOverrides = {}
): RateLimitPolicy => {
  const env = loadRateLimitKeys();

  return createRateLimitPolicy(overrides, {
    namespace: env.RATE_LIMIT_NAMESPACE,
    limit: env.RATE_LIMIT_DEFAULT_LIMIT,
    windowSeconds: env.RATE_LIMIT_DEFAULT_WINDOW_SECONDS,
  });
};

export const assessRateLimitRequest = async (
  request: Request,
  options: RateLimitMiddlewareOptions = {}
): Promise<RateLimitAssessment> => {
  const provider = options.provider ?? createConfiguredRateLimitProvider();
  const policy = createDefaultPolicy(options.policy);
  const context = createRateLimitContextFromRequest(request, options.context);
  const key = resolveRateLimitKey(policy, context);
  const result = await provider.consume({
    key,
    namespace: policy.namespace,
    limit: policy.limit,
    windowSeconds: policy.windowSeconds,
  });

  const decision: RateLimitDecision = {
    key,
    policy,
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    resetAt: result.resetAt,
    retryAfterSeconds: result.retryAfterSeconds,
  };

  const headers = createRateLimitHeaders(decision);
  const assessment: RateLimitAssessment = {
    allowed: decision.success,
    decision,
    headers,
  };

  if (!decision.success && policy.blockOnExhaustion) {
    assessment.response =
      options.onDenied?.(assessment) ??
      createErrorResponse(new RateLimitError(decision.retryAfterSeconds), {
        headers,
      });
  }

  return assessment;
};

export const createRateLimitMiddleware =
  (options: RateLimitMiddlewareOptions = {}) =>
  async (request: Request): Promise<Response | null> => {
    const assessment = await assessRateLimitRequest(request, options);

    if (assessment.allowed) {
      return null;
    }

    return (
      assessment.response ??
      createErrorResponse(
        new RateLimitError(assessment.decision.retryAfterSeconds),
        {
          headers: assessment.headers,
        }
      )
    );
  };
