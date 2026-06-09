import { createErrorResponse, RateLimitError } from "@repo/errors";
import { applyRateLimitHeaders, createRateLimitHeaders } from "./headers.ts";
import { loadRateLimitKeys } from "./keys.ts";
import type {
  RateLimitContext,
  RateLimitDecision,
  RateLimitPolicy,
  RateLimitPolicyOverrides,
} from "./policy.ts";
import { createRateLimitPolicy, resolveRateLimitKey } from "./policy.ts";
import type { RateLimitProvider } from "./provider.ts";
import { createConfiguredRateLimitProvider } from "./provider.ts";
import type { RateLimitRequestOptions } from "./request.ts";
import { createRateLimitContextFromRequest } from "./request.ts";

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
  trustProxy?: RateLimitRequestOptions["trustProxy"];
  onAllowed?:
    | ((
        assessment: RateLimitAssessment
      ) => Response | null | Promise<Response | null>)
    | undefined;
  onDenied?:
    | ((assessment: RateLimitAssessment) => Response | Promise<Response>)
    | undefined;
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

const resolveAssessment = async (
  request: Request,
  options: RateLimitMiddlewareOptions,
  mode: "consume" | "inspect"
): Promise<RateLimitAssessment> => {
  const provider = options.provider ?? createConfiguredRateLimitProvider();
  const policy = createDefaultPolicy(options.policy);
  const context = createRateLimitContextFromRequest(request, options.context, {
    trustProxy: options.trustProxy,
  });
  const key = resolveRateLimitKey(policy, context);
  const input = {
    key,
    namespace: policy.namespace,
    limit: policy.limit,
    windowSeconds: policy.windowSeconds,
  };
  const result =
    mode === "inspect"
      ? await provider.get(input)
      : await provider.consume(input);

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
    const deniedResponse = options.onDenied
      ? await options.onDenied(assessment)
      : createErrorResponse(new RateLimitError(decision.retryAfterSeconds), {
          headers,
        });

    assessment.response = applyRateLimitHeaders(deniedResponse, headers);
  }

  return assessment;
};

export const assessRateLimitRequest = async (
  request: Request,
  options: RateLimitMiddlewareOptions = {}
): Promise<RateLimitAssessment> =>
  resolveAssessment(request, options, "consume");

export const inspectRateLimitRequest = async (
  request: Request,
  options: RateLimitMiddlewareOptions = {}
): Promise<RateLimitAssessment> =>
  resolveAssessment(request, options, "inspect");

export const resetRateLimitRequest = async (
  request: Request,
  options: RateLimitMiddlewareOptions = {}
): Promise<void> => {
  const provider = options.provider ?? createConfiguredRateLimitProvider();
  const policy = createDefaultPolicy(options.policy);
  const context = createRateLimitContextFromRequest(request, options.context, {
    trustProxy: options.trustProxy,
  });
  const key = resolveRateLimitKey(policy, context);

  await provider.reset({
    key,
    namespace: policy.namespace,
    limit: policy.limit,
    windowSeconds: policy.windowSeconds,
  });
};

export const createRateLimitMiddleware =
  (options: RateLimitMiddlewareOptions = {}) =>
  async (request: Request): Promise<Response | null> => {
    const assessment = await assessRateLimitRequest(request, options);

    if (assessment.allowed) {
      const allowedResponse = await options.onAllowed?.(assessment);

      return allowedResponse
        ? applyRateLimitHeaders(allowedResponse, assessment.headers)
        : null;
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
