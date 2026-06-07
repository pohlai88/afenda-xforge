import "server-only";

import type { AppLogger, LoggerBindings } from "./logger.ts";
import { createLogger } from "./logger.ts";

export type ServerLogLevel =
  | "debug"
  | "error"
  | "fatal"
  | "info"
  | "trace"
  | "warn";

export type ServerLogContext = {
  actorId?: string;
  auditEventId?: string;
  companyId?: string;
  module: string;
  operation: string;
  operationId?: string;
  organizationId?: string;
  requestId?: string;
  tenantId?: string;
  userId?: string;
};

export type ServerLogMetadata = LoggerBindings;

const isNonEmptyString = (value: string | null): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const createPackageLogger = (
  packageName: string,
  bindings: LoggerBindings = {}
): AppLogger =>
  createLogger(packageName, {
    package: packageName,
    ...bindings,
  });

export const createDomainLogger = (
  domain: string,
  bindings: LoggerBindings = {}
): AppLogger =>
  createLogger(domain, {
    domain,
    ...bindings,
  });

export const getRequestId = (
  request: Request,
  requestIdHeader = "x-request-id"
): string | undefined => {
  const vercelRequestId = request.headers.get("x-vercel-id");

  if (isNonEmptyString(vercelRequestId)) {
    return vercelRequestId;
  }

  const preferredRequestId = request.headers.get(requestIdHeader);

  if (isNonEmptyString(preferredRequestId)) {
    return preferredRequestId;
  }

  const fallbackRequestId =
    requestIdHeader === "x-request-id"
      ? null
      : request.headers.get("x-request-id");

  return isNonEmptyString(fallbackRequestId) ? fallbackRequestId : undefined;
};

export const logServerEvent = (
  logger: AppLogger,
  level: ServerLogLevel,
  message: string,
  context: ServerLogContext,
  metadata: ServerLogMetadata = {}
): void => {
  try {
    logger[level](
      {
        event: `${context.module}.${context.operation}`,
        ...context,
        ...metadata,
      },
      message
    );
  } catch {
    // Runtime diagnostics must never block business execution.
  }
};
