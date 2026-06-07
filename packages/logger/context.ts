import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";
import { randomBytes, randomUUID } from "node:crypto";

export type RequestContext = {
  actorId?: string;
  correlationId?: string;
  method?: string;
  metadata: Record<string, unknown>;
  path?: string;
  requestId: string;
  operationId?: string;
  organizationId?: string;
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

export const generateOperationId = (): string => randomUUID();

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
  const resolvedRequestId =
    input.requestId ?? existingContext?.requestId ?? generateRequestId();
  const resolvedTraceId =
    input.traceId ?? existingContext?.traceId ?? generateTraceId();
  const resolvedOperationId =
    input.operationId ?? existingContext?.operationId ?? generateOperationId();
  const resolvedTenantId = input.tenantId ?? existingContext?.tenantId;
  const resolvedUserId = input.userId ?? existingContext?.userId;
  const resolvedOrganizationId =
    input.organizationId ?? existingContext?.organizationId ?? resolvedTenantId;
  const resolvedActorId =
    input.actorId ?? existingContext?.actorId ?? resolvedUserId;

  return {
    actorId: resolvedActorId,
    correlationId:
      input.correlationId ?? existingContext?.correlationId ?? resolvedTraceId,
    method: input.method ?? existingContext?.method,
    metadata: {
      ...existingContext?.metadata,
      ...input.metadata,
    },
    path: input.path ?? existingContext?.path,
    requestId: resolvedRequestId,
    operationId: resolvedOperationId,
    organizationId: resolvedOrganizationId,
    spanId: input.spanId ?? generateSpanId(),
    startedAt: input.startedAt ?? existingContext?.startedAt ?? Date.now(),
    tenantId: resolvedTenantId,
    traceId: resolvedTraceId,
    userId: resolvedUserId,
  };
};

export const withRequestContext = <T>(
  input: RequestContextInput,
  run: () => T
): T => requestContextStore.run(createRequestContext(input), run);
