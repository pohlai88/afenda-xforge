import "server-only";

import { writeAuditEvent } from "@repo/audit";
import { requireActiveTenantAccess } from "@repo/auth/server";
import { createTrustedTenantContext } from "@repo/auth/trusted";
import {
  companies,
  database,
  tenants,
  timeDatabaseQuery,
  webhookEndpoints,
} from "@repo/database";
import { createCompanyBodySchema } from "@repo/features-master-data-companies/contract";
import { createCompany } from "@repo/features-master-data-companies/server";
import { createCustomerBodySchema } from "@repo/features-master-data-customers/contract";
import { createCustomer } from "@repo/features-master-data-customers/server";
import { mapLinearWebhookEvent } from "@repo/integrations-linear";
import { mapWorkdayWebhookEvent } from "@repo/integrations-workday";
import {
  permissionCatalog,
  requirePermission,
  resolvePermissionsForTenantRole,
} from "@repo/permissions";
import { getRedisClient } from "@repo/redis";
import type {
  InboundWebhookEnvelope,
  MappedInboundWebhookEvent,
  PublishSvixWebhookInput,
  RegisteredWebhookEvent,
  ResolvedWebhookTenantContext,
  TrustedWebhookTenantLookupInput,
  WebhookQueueMessage,
} from "@repo/webhooks";
import {
  acknowledgeWebhookQueueMessage,
  advanceCircuitBreaker,
  assertInboundWebhook,
  claimReadyWebhookQueueMessage,
  claimWebhookIdempotencyKey,
  classifyDeliveryFailure,
  createCircuitBreaker,
  createDeadLetterRecord,
  createQueueMessage,
  createWebhookRedisKeys,
  deriveIdempotencyKey,
  discardDeadLetterRecord,
  enqueueWebhookQueueMessage,
  getCircuitBreakerState,
  getDeadLetterRecord,
  getRetryDelayMs,
  incrementQueueAttempt,
  markDeadLetterReplayed,
  publishSvixWebhook,
  recordCircuitBreakerFailure,
  recordCircuitBreakerSuccess,
  resolveTrustedWebhookTenantContext,
  setCircuitBreakerState,
  storeDeadLetterRecord,
  updateDeadLetterRecord,
} from "@repo/webhooks";
import { and, eq } from "drizzle-orm";

const ACTIVE_WEBHOOK_ENDPOINT_STATUS = "active";
const DEFAULT_CIRCUIT_BREAKER_COOLDOWN_MS = 60_000;
const DEFAULT_CIRCUIT_BREAKER_FAILURE_THRESHOLD = 3;
const DEFAULT_SCHEDULED_DISPATCH_BATCH_SIZE = 10;
const DEFAULT_WEBHOOK_ADMIN_ROUTE = "apps/api/webhooks";
const WEBHOOK_SYSTEM_ACTOR_PREFIX = "system:webhook";

type TrustedWebhookEndpoint = Readonly<{
  applicationId?: string;
  applicationName?: string;
  companyId?: string;
  endpointId: string;
  eventOwner: string;
  provider: string;
  schemaVersion: string;
  secret: string;
  tenantId: string;
}>;

const findTrustedWebhookEndpoint = async (
  provider: string,
  endpointId: string
): Promise<TrustedWebhookEndpoint> => {
  const [endpoint] = await timeDatabaseQuery(
    () =>
      database
        .select({
          applicationId: webhookEndpoints.applicationId,
          applicationName: webhookEndpoints.applicationName,
          companyId: webhookEndpoints.companyId,
          endpointId: webhookEndpoints.endpointId,
          eventOwner: webhookEndpoints.eventOwner,
          provider: webhookEndpoints.provider,
          schemaVersion: webhookEndpoints.schemaVersion,
          secret: webhookEndpoints.secret,
          tenantId: webhookEndpoints.tenantId,
        })
        .from(webhookEndpoints)
        .where(
          and(
            eq(webhookEndpoints.provider, provider),
            eq(webhookEndpoints.endpointId, endpointId),
            eq(webhookEndpoints.status, ACTIVE_WEBHOOK_ENDPOINT_STATUS)
          )
        )
        .limit(1),
    {
      operation: "select",
      resource: "webhook_endpoints",
      metadata: {
        endpointId,
        provider,
      },
    }
  );

  if (!endpoint) {
    throw new Error("Trusted webhook endpoint is not configured");
  }

  return {
    ...(endpoint.applicationId
      ? {
          applicationId: endpoint.applicationId,
        }
      : {}),
    ...(endpoint.applicationName
      ? {
          applicationName: endpoint.applicationName,
        }
      : {}),
    ...(endpoint.companyId
      ? {
          companyId: endpoint.companyId,
        }
      : {}),
    endpointId: endpoint.endpointId,
    eventOwner: endpoint.eventOwner,
    provider: endpoint.provider,
    schemaVersion: endpoint.schemaVersion,
    secret: endpoint.secret,
    tenantId: endpoint.tenantId,
  };
};

const extractCompanyIdHint = (payload: unknown): string | undefined => {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "companyId" in payload &&
    typeof payload.companyId === "string"
  ) {
    return payload.companyId;
  }

  return;
};

const mapProviderInboundWebhook = (
  endpoint: TrustedWebhookEndpoint,
  envelope: InboundWebhookEnvelope
): MappedInboundWebhookEvent => {
  switch (envelope.provider) {
    case "linear":
      return mapLinearWebhookEvent({
        applicationId: endpoint.applicationId,
        applicationName: endpoint.applicationName,
        eventId: envelope.eventId,
        payload: envelope.payload,
        schemaVersion: endpoint.schemaVersion,
      });
    case "workday":
      return mapWorkdayWebhookEvent({
        applicationId: endpoint.applicationId,
        applicationName: endpoint.applicationName,
        eventId: envelope.eventId,
        payload: envelope.payload,
        schemaVersion: endpoint.schemaVersion,
      });
    default:
      throw new Error(
        `No inbound webhook mapper is registered for provider: ${envelope.provider}`
      );
  }
};

const createOperationalPermissionContext = (
  tenantId: string,
  userId: string,
  role: string
): {
  action: string;
  actorId: string;
  grantedPermissions: string[];
  resource: string;
  tenantId: string;
} => ({
  action: "webhooks.manage",
  actorId: userId,
  grantedPermissions: resolvePermissionsForTenantRole(role),
  resource: "webhooks",
  tenantId,
});

export const requireWebhookManagementAccess = async (): Promise<{
  grantedPermissions: string[];
  role: string;
  tenantId: string;
  userId: string;
}> => {
  const access = await requireActiveTenantAccess();
  const grantedPermissions = resolvePermissionsForTenantRole(
    access.membership.role
  );

  requirePermission(
    createOperationalPermissionContext(
      access.membership.tenantId,
      access.user.id,
      access.membership.role
    ),
    {
      allOf: [permissionCatalog.webhooks.manage],
    }
  );

  return {
    grantedPermissions,
    role: access.membership.role,
    tenantId: access.membership.tenantId,
    userId: access.user.id,
  };
};

const validateTenantExists = async (tenantId: string): Promise<boolean> => {
  const [tenant] = await timeDatabaseQuery(
    () =>
      database
        .select({ id: tenants.id })
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1),
    {
      operation: "select",
      resource: "tenants",
      metadata: {
        tenantId,
      },
    }
  );

  return Boolean(tenant);
};

const validateCompanyInTenant = async (
  tenantId: string,
  companyId: string
): Promise<boolean> => {
  const [company] = await timeDatabaseQuery(
    () =>
      database
        .select({ id: companies.id })
        .from(companies)
        .where(
          and(eq(companies.id, companyId), eq(companies.tenantId, tenantId))
        )
        .limit(1),
    {
      operation: "select",
      resource: "companies",
      metadata: {
        companyId,
        tenantId,
      },
    }
  );

  return Boolean(company);
};

const toTerminalWebhookError = (
  message: string,
  statusCode = 422
): Error & { statusCode: number } =>
  Object.assign(new Error(message), {
    statusCode,
  });

const getPayloadRecord = (
  payload: Record<string, unknown>
): Record<string, unknown> => {
  const nestedPayload = payload.payload;

  return typeof nestedPayload === "object" && nestedPayload !== null
    ? (nestedPayload as Record<string, unknown>)
    : payload;
};

const extractStringField = (
  payload: Record<string, unknown>,
  candidateKeys: string[]
): string | undefined => {
  for (const key of candidateKeys) {
    const value = payload[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return;
};

const createWebhookSystemActorId = (
  provider: string,
  eventOwner: string
): string =>
  `${WEBHOOK_SYSTEM_ACTOR_PREFIX}:${provider}:${eventOwner.replaceAll(".", "_")}`;

const buildCompanyWebhookInput = (
  payload: Record<string, unknown>
): ReturnType<typeof createCompanyBodySchema.parse> => {
  const normalizedPayload = getPayloadRecord(payload);
  const code = extractStringField(normalizedPayload, [
    "code",
    "companyCode",
    "externalId",
    "id",
  ]);
  const name = extractStringField(normalizedPayload, [
    "name",
    "companyName",
    "displayName",
    "title",
  ]);

  if (!(code && name)) {
    throw toTerminalWebhookError(
      "Webhook company payload is missing required code or name"
    );
  }

  return createCompanyBodySchema.parse({
    code,
    name,
  });
};

const buildCustomerWebhookInput = (
  payload: Record<string, unknown>
): ReturnType<typeof createCustomerBodySchema.parse> => {
  const normalizedPayload = getPayloadRecord(payload);
  const code = extractStringField(normalizedPayload, [
    "code",
    "customerCode",
    "externalId",
    "id",
  ]);
  const name = extractStringField(normalizedPayload, [
    "name",
    "customerName",
    "displayName",
    "fullName",
  ]);
  const email = extractStringField(normalizedPayload, [
    "email",
    "primaryEmail",
  ]);

  if (!(code && name)) {
    throw toTerminalWebhookError(
      "Webhook customer payload is missing required code or name"
    );
  }

  return createCustomerBodySchema.parse({
    code,
    ...(email ? { email } : {}),
    name,
  });
};

const executeInboundDomainWebhook = async (
  message: WebhookQueueMessage
): Promise<void> => {
  const eventOwner = extractStringField(message.envelope.payload, [
    "eventOwner",
  ]);

  if (!eventOwner) {
    throw toTerminalWebhookError("Webhook inbound event owner is missing");
  }

  const systemActorId = createWebhookSystemActorId(
    message.provider,
    eventOwner
  );

  switch (eventOwner) {
    case "master-data.companies.create":
      await createCompany(buildCompanyWebhookInput(message.envelope.payload), {
        grantedPermissions: [permissionCatalog.companies.write],
        operationId: message.envelope.operationId,
        requestId: message.envelope.requestId,
        tenantId: message.envelope.tenantId,
        trustedSystem: createTrustedTenantContext({
          actorType: "integration",
          channel: "webhook",
          reason: "webhook company sync",
          tenantId: message.envelope.tenantId,
        }),
        userId: systemActorId,
      });
      return;
    case "master-data.customers.create":
      await createCustomer(
        buildCustomerWebhookInput(message.envelope.payload),
        {
          grantedPermissions: [permissionCatalog.customers.write],
          operationId: message.envelope.operationId,
          requestId: message.envelope.requestId,
          tenantId: message.envelope.tenantId,
          trustedSystem: createTrustedTenantContext({
            actorType: "integration",
            channel: "webhook",
            reason: "validated inbound webhook endpoint tenant",
            tenantId: message.envelope.tenantId,
          }),
          userId: systemActorId,
        }
      );
      return;
    default:
      throw toTerminalWebhookError(
        `No inbound domain handler is registered for event owner: ${eventOwner}`
      );
  }
};

export const resolveWebhookTenantContextFromEndpoint = async (
  input: TrustedWebhookTenantLookupInput
): Promise<{
  endpoint: TrustedWebhookEndpoint;
  tenantContext: ResolvedWebhookTenantContext;
}> => {
  const endpoint = await findTrustedWebhookEndpoint(
    input.provider,
    input.endpointId
  );
  const tenantContext = await resolveTrustedWebhookTenantContext(input, {
    resolveTenantId: async (): Promise<string> => {
      if (!(await validateTenantExists(endpoint.tenantId))) {
        throw new Error("Trusted webhook tenant is not configured");
      }

      return endpoint.tenantId;
    },
    validateCompanyId: (
      tenantId: string,
      companyId: string,
      _input: TrustedWebhookTenantLookupInput
    ): boolean | Promise<boolean> => {
      if (endpoint.companyId && endpoint.companyId !== companyId) {
        return false;
      }

      return validateCompanyInTenant(tenantId, companyId);
    },
  });

  return {
    endpoint,
    tenantContext,
  };
};

export const queueInboundWebhook = async ({
  endpointId,
  envelope,
}: {
  endpointId: string;
  envelope: InboundWebhookEnvelope;
}): Promise<{
  deliveryId: string;
  duplicate: boolean;
  tenantId: string;
}> => {
  const { endpoint, tenantContext } =
    await resolveWebhookTenantContextFromEndpoint({
      companyId: extractCompanyIdHint(envelope.payload),
      endpointId,
      provider: envelope.provider,
    });

  assertInboundWebhook(envelope, endpoint.secret);
  const mappedEvent = mapProviderInboundWebhook(endpoint, envelope);

  const redisClient = await getRedisClient();
  const redisKeys = createWebhookRedisKeys(tenantContext.tenantId);
  const idempotencyKey = deriveIdempotencyKey(
    envelope.provider,
    mappedEvent.eventId,
    tenantContext.tenantId,
    mappedEvent.eventType
  );
  const claimed = await claimWebhookIdempotencyKey(
    redisClient,
    redisKeys,
    idempotencyKey
  );

  if (!claimed) {
    return {
      deliveryId: mappedEvent.eventId,
      duplicate: true,
      tenantId: tenantContext.tenantId,
    };
  }

  const deliveryId = mappedEvent.eventId;
  const queueMessage = createQueueMessage(
    deliveryId,
    envelope.provider,
    {
      companyId: tenantContext.companyId,
      eventId: mappedEvent.eventId,
      eventType: mappedEvent.eventType,
      occurredAt: mappedEvent.occurredAt,
      operationId: mappedEvent.eventId,
      organizationId: tenantContext.organizationId,
      payload: {
        ...mappedEvent.payload,
        ...(mappedEvent.applicationId
          ? {
              applicationId: mappedEvent.applicationId,
            }
          : {}),
        ...(mappedEvent.applicationName
          ? {
              applicationName: mappedEvent.applicationName,
            }
          : {}),
        eventOwner: endpoint.eventOwner,
      },
      redactionPolicy: mappedEvent.redactionPolicy,
      requestId: mappedEvent.eventId,
      schemaVersion: mappedEvent.schemaVersion,
      tenantId: tenantContext.tenantId,
      workspaceId: tenantContext.workspaceId,
    },
    Date.now(),
    "inbound-execution"
  );

  await enqueueWebhookQueueMessage(redisClient, redisKeys, queueMessage);

  return {
    deliveryId,
    duplicate: false,
    tenantId: tenantContext.tenantId,
  };
};

const buildEventRegistry = (
  message: WebhookQueueMessage
): Map<string, RegisteredWebhookEvent> =>
  new Map<string, RegisteredWebhookEvent>([
    [
      message.envelope.eventType,
      {
        eventType: message.envelope.eventType,
        owner:
          typeof message.envelope.payload.eventOwner === "string"
            ? message.envelope.payload.eventOwner
            : "external",
        schemaVersion: message.envelope.schemaVersion,
        scopes: ["tenant"],
        sensitivity: message.envelope.redactionPolicy,
        state: "active",
      },
    ],
  ]);

const buildSchemaRegistry = (
  message: WebhookQueueMessage
): Map<
  string,
  {
    eventType: string;
    schemaVersion: string;
    validate: (payload: unknown) => payload is Record<string, unknown>;
  }
> =>
  new Map([
    [
      `${message.envelope.eventType}@${message.envelope.schemaVersion}`,
      {
        eventType: message.envelope.eventType,
        schemaVersion: message.envelope.schemaVersion,
        validate: (payload: unknown): payload is Record<string, unknown> =>
          typeof payload === "object" && payload !== null,
      },
    ],
  ]);

export const dispatchQueuedWebhook = async (
  tenantId: string
): Promise<{
  deliveryId?: string;
  status: "empty" | "failed" | "processed";
}> => {
  const redisClient = await getRedisClient();
  const redisKeys = createWebhookRedisKeys(tenantId);
  const queuedMessage = await claimReadyWebhookQueueMessage(
    redisClient,
    redisKeys
  );

  if (!queuedMessage) {
    return {
      status: "empty",
    };
  }

  const providerState =
    (await getCircuitBreakerState(
      redisClient,
      redisKeys,
      queuedMessage.provider
    )) ?? createCircuitBreaker(DEFAULT_CIRCUIT_BREAKER_FAILURE_THRESHOLD);
  const advancedState = advanceCircuitBreaker(providerState);

  if (advancedState.state === "open") {
    await enqueueWebhookQueueMessage(redisClient, redisKeys, queuedMessage);

    return {
      deliveryId: queuedMessage.deliveryId,
      status: "failed",
    };
  }

  try {
    if (queuedMessage.kind === "inbound-execution") {
      await executeInboundDomainWebhook(queuedMessage);
      await acknowledgeWebhookQueueMessage(
        redisClient,
        redisKeys,
        queuedMessage.deliveryId
      );
      await setCircuitBreakerState(
        redisClient,
        redisKeys,
        queuedMessage.provider,
        recordCircuitBreakerSuccess(advancedState)
      );

      return {
        deliveryId: queuedMessage.deliveryId,
        status: "processed",
      };
    }

    await publishSvixWebhook(
      {
        create: async (
          applicationId: string,
          request: PublishSvixWebhookInput["envelope"] extends never
            ? never
            : {
                application: {
                  name: string;
                  uid: string;
                };
                eventType: string;
                payload: Record<string, unknown>;
              }
        ): Promise<unknown> => {
          const { sendWebhook } = await import("@repo/webhooks/lib/svix");

          return sendWebhook(
            applicationId,
            request.eventType,
            request.payload,
            request.application.name
          );
        },
      },
      {
        applicationId:
          typeof queuedMessage.envelope.payload.applicationId === "string"
            ? queuedMessage.envelope.payload.applicationId
            : queuedMessage.envelope.tenantId,
        applicationName:
          typeof queuedMessage.envelope.payload.applicationName === "string"
            ? queuedMessage.envelope.payload.applicationName
            : queuedMessage.envelope.tenantId,
        envelope: queuedMessage.envelope,
        eventRegistry: buildEventRegistry(queuedMessage),
        schemaRegistry: buildSchemaRegistry(queuedMessage),
      }
    );

    await acknowledgeWebhookQueueMessage(
      redisClient,
      redisKeys,
      queuedMessage.deliveryId
    );
    await setCircuitBreakerState(
      redisClient,
      redisKeys,
      queuedMessage.provider,
      recordCircuitBreakerSuccess(advancedState)
    );

    return {
      deliveryId: queuedMessage.deliveryId,
      status: "processed",
    };
  } catch (error: unknown) {
    const failureClassification = classifyDeliveryFailure(error);

    if (failureClassification === "retryable") {
      const retryDelayMs = getRetryDelayMs(queuedMessage.attempt);
      const failedCircuit = recordCircuitBreakerFailure(
        advancedState,
        DEFAULT_CIRCUIT_BREAKER_COOLDOWN_MS
      );

      await setCircuitBreakerState(
        redisClient,
        redisKeys,
        queuedMessage.provider,
        failedCircuit
      );
      await enqueueWebhookQueueMessage(
        redisClient,
        redisKeys,
        incrementQueueAttempt(queuedMessage, Date.now() + retryDelayMs)
      );
    } else {
      await storeDeadLetterRecord(
        redisClient,
        redisKeys,
        createDeadLetterRecord(
          queuedMessage.deliveryId,
          queuedMessage,
          error instanceof Error
            ? error.message
            : "Unknown webhook delivery failure",
          new Date().toISOString()
        )
      );
      await acknowledgeWebhookQueueMessage(
        redisClient,
        redisKeys,
        queuedMessage.deliveryId
      );
    }

    return {
      deliveryId: queuedMessage.deliveryId,
      status: "failed",
    };
  }
};

const listDispatchableTenantIds = async (): Promise<string[]> => {
  const endpoints = await timeDatabaseQuery(
    () =>
      database
        .select({
          tenantId: webhookEndpoints.tenantId,
        })
        .from(webhookEndpoints)
        .where(eq(webhookEndpoints.status, ACTIVE_WEBHOOK_ENDPOINT_STATUS)),
    {
      operation: "select",
      resource: "webhook_endpoints",
      metadata: {
        status: ACTIVE_WEBHOOK_ENDPOINT_STATUS,
      },
    }
  );

  return Array.from(new Set(endpoints.map((entry) => entry.tenantId)));
};

export const dispatchQueuedWebhooksForAllTenants = async (
  maxDeliveriesPerTenant = DEFAULT_SCHEDULED_DISPATCH_BATCH_SIZE
): Promise<{
  failed: number;
  processed: number;
  tenants: number;
}> => {
  const tenantIds = await listDispatchableTenantIds();
  let failed = 0;
  let processed = 0;

  for (const tenantId of tenantIds) {
    for (
      let deliveryIndex = 0;
      deliveryIndex < maxDeliveriesPerTenant;
      deliveryIndex += 1
    ) {
      const result = await dispatchQueuedWebhook(tenantId);

      if (result.status === "empty") {
        break;
      }

      if (result.status === "processed") {
        processed += 1;
        continue;
      }

      failed += 1;
      break;
    }
  }

  return {
    failed,
    processed,
    tenants: tenantIds.length,
  };
};

export const replayDeadLetterForTenant = async (
  tenantId: string,
  deadLetterId: string
): Promise<{ deliveryId: string }> => {
  const redisClient = await getRedisClient();
  const redisKeys = createWebhookRedisKeys(tenantId);
  const record = await getDeadLetterRecord(
    redisClient,
    redisKeys,
    deadLetterId
  );

  if (!record) {
    throw new Error("Dead-letter record not found");
  }

  await enqueueWebhookQueueMessage(
    redisClient,
    redisKeys,
    createQueueMessage(
      record.deadLetterId,
      record.provider,
      record.envelope,
      Date.now(),
      record.kind
    )
  );
  await updateDeadLetterRecord(
    redisClient,
    redisKeys,
    markDeadLetterReplayed(record)
  );

  return {
    deliveryId: record.deadLetterId,
  };
};

export const discardDeadLetterForTenant = async (
  tenantId: string,
  deadLetterId: string
): Promise<void> => {
  const redisClient = await getRedisClient();
  const redisKeys = createWebhookRedisKeys(tenantId);

  await discardDeadLetterRecord(redisClient, redisKeys, deadLetterId);
};

export const writeWebhookOperationalAudit = async ({
  action,
  deadLetterId,
  requestId,
  targetId,
  targetType,
  tenantId,
  userId,
}: {
  action: string;
  deadLetterId?: string;
  requestId: string;
  targetId: string;
  targetType: string;
  tenantId: string;
  userId: string;
}): Promise<void> => {
  await writeAuditEvent({
    action,
    actorId: userId,
    actorType: "user",
    after: {},
    before: {},
    channel: "webhook",
    metadata: deadLetterId
      ? {
          deadLetterId,
        }
      : undefined,
    module: "webhooks",
    reason: action,
    requestId,
    route: DEFAULT_WEBHOOK_ADMIN_ROUTE,
    summary: `${action} executed for ${targetType}:${targetId}`,
    targetId,
    targetType,
    tenantId,
  });
};
