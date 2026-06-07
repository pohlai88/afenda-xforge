import "server-only";

import { createErrorResponse } from "@repo/errors";
import { recordHttpRequest } from "@repo/metrics";
import {
  generateRequestId,
  generateTraceId,
  withRequestContext,
} from "./context.ts";
import type { AppLogger } from "./logger.ts";
import { createChildLogger, log, logRequest } from "./logger.ts";

export type RequestLoggingOptions = {
  logger?: AppLogger;
  metricsApp?: string;
  requestIdHeader?: string;
  tenantIdHeader?: string;
  traceIdHeader?: string;
  userIdHeader?: string;
};

export type RequestLoggingHandler = (
  request: Request,
  logger: AppLogger
) => Promise<Response>;

const withTraceHeaders = (
  response: Response,
  requestId: string,
  traceId: string,
  durationMs: number
): Response => {
  const headers = new Headers(response.headers);

  headers.set("x-request-id", requestId);
  headers.set("x-trace-id", traceId);
  headers.set("x-response-time", `${durationMs}ms`);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const withRequestLogging =
  (handler: RequestLoggingHandler, options: RequestLoggingOptions = {}) =>
  (request: Request): Promise<Response> => {
    const requestIdHeader = options.requestIdHeader ?? "x-request-id";
    const traceIdHeader = options.traceIdHeader ?? "x-trace-id";
    const tenantIdHeader = options.tenantIdHeader ?? "x-tenant-id";
    const userIdHeader = options.userIdHeader ?? "x-user-id";
    const metricsApp = options.metricsApp ?? "app";
    const requestId =
      request.headers.get(requestIdHeader) ?? generateRequestId();
    const traceId = request.headers.get(traceIdHeader) ?? generateTraceId();
    const url = new URL(request.url);

    return withRequestContext(
      {
        method: request.method,
        path: url.pathname,
        requestId,
        tenantId: request.headers.get(tenantIdHeader) ?? undefined,
        traceId,
        userId: request.headers.get(userIdHeader) ?? undefined,
      },
      async () => {
        const logger = createChildLogger(options.logger ?? log, {
          method: request.method,
          path: url.pathname,
        });
        const start = Date.now();

        try {
          const response = await handler(request, logger);
          const durationMs = Date.now() - start;
          const durationSeconds = durationMs / 1000;

          logRequest({
            durationMs,
            logger,
            method: request.method,
            path: url.pathname,
            statusCode: response.status,
          });
          recordHttpRequest({
            app: metricsApp,
            durationSeconds,
            method: request.method,
            route: url.pathname,
            statusCode: response.status,
          });

          return withTraceHeaders(response, requestId, traceId, durationMs);
        } catch (error) {
          const durationMs = Date.now() - start;
          const durationSeconds = durationMs / 1000;

          logger.error(
            {
              durationMs,
              error,
            },
            "unhandled request error"
          );
          recordHttpRequest({
            app: metricsApp,
            durationSeconds,
            method: request.method,
            route: url.pathname,
            statusCode: 500,
          });

          return createErrorResponse(error, {
            headers: {
              "x-request-id": requestId,
              "x-trace-id": traceId,
            },
            requestId,
          });
        }
      }
    );
  };
