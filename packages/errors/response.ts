import type { AppError } from "./core.js";
import { RateLimitError } from "./http.js";
import { normalizeError } from "./normalize.js";

type ResponseHeaders = Headers | [string, string][] | Record<string, string>;

export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
    requestId?: string;
    timestamp: string;
  };
};

export type ResolvedErrorResponse = {
  error: AppError;
  status: number;
  body: ErrorResponse;
};

export type ResolveErrorResponseOptions = {
  requestId?: string;
};

export type CreateErrorResponseOptions = ResolveErrorResponseOptions & {
  headers?: ResponseHeaders;
};

export type ErrorHandlerOptions = {
  requestIdHeader?: string;
  onError?: (
    error: AppError,
    request: Request,
    originalError: unknown
  ) => Promise<void> | void;
};

export const resolveErrorResponse = (
  error: unknown,
  options: ResolveErrorResponseOptions = {}
): ResolvedErrorResponse => {
  const normalizedError = normalizeError(error);

  return {
    error: normalizedError,
    status: normalizedError.statusCode,
    body: {
      success: false,
      error: normalizedError.toJSON(options.requestId),
    },
  };
};

export const toErrorResponse = (
  error: unknown,
  options: ResolveErrorResponseOptions = {}
): { status: number; body: ErrorResponse } => {
  const { body, status } = resolveErrorResponse(error, options);
  return { body, status };
};

export const createErrorResponse = (
  error: unknown,
  options: CreateErrorResponseOptions = {}
): Response => {
  const resolved = resolveErrorResponse(error, options);
  const headers = new Headers(options.headers);

  headers.set("content-type", "application/json");

  if (options.requestId) {
    headers.set("x-request-id", options.requestId);
  }

  if (resolved.error instanceof RateLimitError) {
    headers.set("retry-after", String(resolved.error.retryAfterSeconds));
  }

  return new Response(JSON.stringify(resolved.body), {
    status: resolved.status,
    headers,
  });
};

export const extractRequestId = (
  request: Request,
  headerName = "x-request-id"
): string | undefined => request.headers.get(headerName) ?? undefined;

export const withErrorHandler =
  (
    handler: (request: Request) => Promise<Response>,
    options: ErrorHandlerOptions = {}
  ) =>
  async (request: Request): Promise<Response> => {
    try {
      return await handler(request);
    } catch (error) {
      const requestId = extractRequestId(
        request,
        options.requestIdHeader ?? "x-request-id"
      );
      const resolved = resolveErrorResponse(error, { requestId });

      await options.onError?.(resolved.error, request, error);

      return createErrorResponse(resolved.error, {
        headers:
          resolved.error instanceof RateLimitError
            ? {
                "retry-after": String(resolved.error.retryAfterSeconds),
              }
            : undefined,
        requestId,
      });
    }
  };
