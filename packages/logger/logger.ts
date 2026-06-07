import "server-only";

import type { LoggerOptions } from "pino";
import pino, { stdTimeFunctions } from "pino";
import { getRequestContext } from "./context.ts";

export type AppLogger = pino.Logger;

export type LoggerBindings = Record<string, unknown>;

export type RequestLogInput = {
  durationMs: number;
  logger?: AppLogger;
  method: string;
  path: string;
  statusCode: number;
} & LoggerBindings;

export type QueryLogInput = {
  durationMs: number;
  logger?: AppLogger;
  operation: string;
  resource: string;
} & LoggerBindings;

export type EventAction = "ack" | "handle" | "nack" | "publish" | "subscribe";

export type EventLogInput = {
  action: EventAction;
  logger?: AppLogger;
  subject: string;
} & LoggerBindings;

export type TimedOperationLogLevel =
  | "debug"
  | "error"
  | "fatal"
  | "info"
  | "trace"
  | "warn";

const isDevelopment = process.env.NODE_ENV !== "production";
const defaultServiceName = "xforge";
const defaultLogLevel: string = process.env.LOG_LEVEL ?? "info";
const defaultRedactedPaths = [
  "*.accessToken",
  "*.apiKey",
  "*.authorization",
  "*.body",
  "*.cookie",
  "*.creditCard",
  "*.credential",
  "*.cvv",
  "*.identity",
  "*.payment",
  "*.password",
  "*.payload",
  "*.privateKey",
  "*.rawBody",
  "*.refreshToken",
  "*.session",
  "*.secret",
  "*.ssn",
  "*.token",
  "accessToken",
  "apiKey",
  "authorization",
  "body",
  "cookie",
  "creditCard",
  "credential",
  "cvv",
  "identity",
  "payment",
  "password",
  "payload",
  "privateKey",
  "rawBody",
  "refreshToken",
  "session",
  "secret",
  "ssn",
  "token",
];

const transport = isDevelopment
  ? pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "SYS:standard",
      },
    })
  : undefined;

const options: LoggerOptions = {
  level: defaultLogLevel,
  messageKey: "message",
  timestamp: stdTimeFunctions.isoTime,
  redact: {
    paths: defaultRedactedPaths,
    remove: false,
  },
  formatters: {
    level: (label: string) => ({ level: label }),
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
  mixin: (): Record<string, unknown> => {
    const context = getRequestContext();

    if (!context) {
      return {};
    }

    return {
      actorId: context.actorId ?? context.userId,
      correlationId: context.correlationId ?? context.traceId,
      method: context.method,
      operationId: context.operationId,
      organizationId: context.organizationId ?? context.tenantId,
      path: context.path,
      requestId: context.requestId,
      spanId: context.spanId,
      tenantId: context.tenantId,
      traceId: context.traceId,
      userId: context.userId,
      ...context.metadata,
    };
  },
};

export const rootLogger: AppLogger = pino(options, transport);

export const log: AppLogger = rootLogger.child({
  service: defaultServiceName,
});

export const createLogger = (
  service: string,
  bindings: LoggerBindings = {}
): AppLogger =>
  rootLogger.child({
    service,
    ...bindings,
  });

export const createChildLogger = (
  logger: AppLogger,
  bindings: LoggerBindings = {}
): AppLogger => logger.child(bindings);

export const logRequest = ({
  durationMs,
  logger = log,
  method,
  path,
  statusCode,
  ...metadata
}: RequestLogInput): void => {
  let level: "error" | "warn" | "info" = "info";

  if (statusCode >= 500) {
    level = "error";
  } else if (statusCode >= 400) {
    level = "warn";
  }

  logger[level](
    {
      durationMs,
      method,
      path,
      statusCode,
      ...metadata,
    },
    "request completed"
  );
};

export const logQuery = ({
  durationMs,
  logger = log,
  operation,
  resource,
  ...metadata
}: QueryLogInput): void => {
  logger.debug(
    {
      durationMs,
      operation,
      resource,
      ...metadata,
    },
    "database query completed"
  );
};

export const logEvent = ({
  action,
  logger = log,
  subject,
  ...metadata
}: EventLogInput): void => {
  logger.info(
    {
      action,
      subject,
      ...metadata,
    },
    "event processed"
  );
};

export const timeOperation = async <T>(
  label: string,
  run: () => Promise<T>,
  options: {
    failureLevel?: TimedOperationLogLevel;
    level?: TimedOperationLogLevel;
    logger?: AppLogger;
    metadata?: LoggerBindings;
  } = {}
): Promise<T> => {
  const logger = options.logger ?? log;
  const level = options.level ?? "info";
  const failureLevel = options.failureLevel ?? "error";
  const startedAt = Date.now();

  try {
    const result = await run();

    logger[level](
      {
        durationMs: Date.now() - startedAt,
        ...options.metadata,
      },
      `${label} completed`
    );

    return result;
  } catch (error) {
    logger[failureLevel](
      {
        durationMs: Date.now() - startedAt,
        error,
        ...options.metadata,
      },
      `${label} failed`
    );

    throw error;
  }
};
