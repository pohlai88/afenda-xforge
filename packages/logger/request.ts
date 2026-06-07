import "server-only";

import { createErrorResponse } from "@repo/errors";
import { recordHttpRequest } from "@repo/metrics";
import {
  generateOperationId,
  generateRequestId,
  generateTraceId,
  withRequestContext,
} from "./context.ts";
import type { AppLogger, LoggerBindings } from "./logger.ts";
import { createChildLogger, log, logRequest } from "./logger.ts";
import { getRequestId } from "./server.ts";

export type RequestLoggingCustomPropsContext = {
  actorId?: string;
  method: string;
  operationId: string;
  organizationId?: string;
  path: string;
  request: Request;
  requestId: string;
  tenantId?: string;
  traceId: string;
  url: URL;
  userId?: string;
};

export type RequestLoggingCustomProps = (
  context: RequestLoggingCustomPropsContext
) => LoggerBindings | undefined;

export type RequestLoggingOptions = {
  logger?: AppLogger;
  metricsApp?: string;
  customProps?: RequestLoggingCustomProps;
  operationIdHeader?: string;
  requestIdHeader?: string;
  quietReqLogger?: boolean;
  quietResLogger?: boolean;
  tenantIdHeader?: string;
  traceIdHeader?: string;
  userIdHeader?: string;
};

export type RequestLoggingHandler = (
  request: Request,
  logger: AppLogger
) => Promise<Response>;

const withResponseHeaders = (
  response: Response,
  requestId: string,
  traceId: string,
  operationId: string,
  durationMs: number
): Response => {
  const headers = new Headers(response.headers);

  headers.set("x-request-id", requestId);
  headers.set("x-trace-id", traceId);
  headers.set("x-operation-id", operationId);
  headers.set("x-response-time", `${durationMs}ms`);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const isPlainObject = (value: unknown): value is LoggerBindings => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

const resolveCustomProps = (
  request: Request,
  url: URL,
  options: RequestLoggingOptions,
  requestId: string,
  operationId: string,
  traceId: string,
  tenantId?: string,
  userId?: string
): LoggerBindings => {
  if (!options.customProps) {
    return {};
  }

  try {
    const customProps = options.customProps({
      actorId: userId,
      method: request.method,
      operationId,
      organizationId: tenantId,
      path: url.pathname,
      request,
      requestId,
      tenantId,
      traceId,
      url,
      userId,
    });

    return isPlainObject(customProps) ? customProps : {};
  } catch {
    // Custom request props must never interfere with request handling.
    return {};
  }
};

export const withRequestLogging =
  (handler: RequestLoggingHandler, options: RequestLoggingOptions = {}) =>
  (request: Request): Promise<Response> => {
    const requestIdHeader = options.requestIdHeader ?? "x-request-id";
    const operationIdHeader = options.operationIdHeader ?? "x-operation-id";
    const traceIdHeader = options.traceIdHeader ?? "x-trace-id";
    const tenantIdHeader = options.tenantIdHeader ?? "x-tenant-id";
    const userIdHeader = options.userIdHeader ?? "x-user-id";
    const metricsApp = options.metricsApp ?? "app";
    const requestId =
      getRequestId(request, requestIdHeader) ?? generateRequestId();
    const operationId =
      request.headers.get(operationIdHeader)?.trim() || generateOperationId();
    const traceId = request.headers.get(traceIdHeader) ?? generateTraceId();
    const tenantId = request.headers.get(tenantIdHeader) ?? undefined;
    const userId = request.headers.get(userIdHeader) ?? undefined;
    const url = new URL(request.url);
    const customProps = resolveCustomProps(
      request,
      url,
      options,
      requestId,
      operationId,
      traceId,
      tenantId,
      userId
    );

    return withRequestContext(
      {
        actorId: userId,
        method: request.method,
        path: url.pathname,
        requestId,
        operationId,
        organizationId: tenantId,
        correlationId: traceId,
        quietReqLogger: options.quietReqLogger,
        quietResLogger: options.quietResLogger,
        tenantId,
        traceId,
        userId,
        metadata: customProps,
      },
      async () => {
        const logger = createChildLogger(options.logger ?? log, {
          operationId,
          requestId,
          ...(options.quietReqLogger
            ? {}
            : {
                method: request.method,
                path: url.pathname,
              }),
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
            quiet: options.quietResLogger,
            statusCode: response.status,
          });
          recordHttpRequest({
            app: metricsApp,
            durationSeconds,
            method: request.method,
            route: url.pathname,
            statusCode: response.status,
          });

          return withResponseHeaders(
            response,
            requestId,
            traceId,
            operationId,
            durationMs
          );
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
              "x-operation-id": operationId,
              "x-trace-id": traceId,
            },
            requestId,
          });
        }
      }
    );
  };
