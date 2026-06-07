import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";
import { randomBytes, randomUUID } from "node:crypto";

export type RequestContext = {
  method?: string;
  metadata: Record<string, unknown>;
  path?: string;
  requestId: string;
  spanId: string;
  startedAt: number;
  tenantId?: string;
  traceId: string;
  userId?: string;
};

export type RequestContextInput = Partial<Omit<RequestContext, "metadata">> & {
  metadata?: Record<string, unknown>;
};

const requestContextStore = new AsyncLocalStorage<RequestContext>();

export const generateRequestId = (): string => randomUUID();

export const generateTraceId = (): string => randomUUID();

export const generateSpanId = (): string => randomBytes(8).toString("hex");

export const getRequestContext = (): RequestContext | undefined =>
  requestContextStore.getStore();

export const appendRequestContextMetadata = (
  metadata: Record<string, unknown>
): RequestContext | undefined => {
  const context = getRequestContext();

  if (!context) {
    return;
  }

  context.metadata = {
    ...context.metadata,
    ...metadata,
  };

  return context;
};

const createRequestContext = (input: RequestContextInput): RequestContext => {
  const existingContext = getRequestContext();

  return {
    method: input.method ?? existingContext?.method,
    metadata: {
      ...existingContext?.metadata,
      ...input.metadata,
    },
    path: input.path ?? existingContext?.path,
    requestId:
      input.requestId ?? existingContext?.requestId ?? generateRequestId(),
    spanId: input.spanId ?? generateSpanId(),
    startedAt: input.startedAt ?? existingContext?.startedAt ?? Date.now(),
    tenantId: input.tenantId ?? existingContext?.tenantId,
    traceId: input.traceId ?? existingContext?.traceId ?? generateTraceId(),
    userId: input.userId ?? existingContext?.userId,
  };
};

export const withRequestContext = <T>(
  input: RequestContextInput,
  run: () => T
): T => requestContextStore.run(createRequestContext(input), run);
