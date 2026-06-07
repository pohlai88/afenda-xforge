import { eventTypes, hasEventsConfig, publish } from "@repo/events";
import { initializeEventsInfrastructure } from "@repo/events/bootstrap";
import type {
  ExecutionDomainResult,
  ExecutionMutationContext,
} from "@repo/execution";
import { createLogger } from "@repo/logger";
import { persistAndDispatchNotifications } from "@repo/notifications";

const logger = createLogger("app.post-commit");

const publishIntegrationRequest = async (
  subject: string,
  payload: Record<string, unknown>,
  source: string,
  context: ExecutionMutationContext<unknown>,
  operation: ExecutionDomainResult<unknown>
): Promise<void> => {
  if (!hasEventsConfig()) {
    return;
  }

  try {
    await initializeEventsInfrastructure();
    await publish(subject, payload, {
      causationId: context.requestId,
      correlationId: context.requestId,
      idempotencyKey: `${subject}:${operation.targetType}:${operation.targetId}:${context.requestId}`,
      metadata: {
        action: operation.action,
        source,
      },
      source,
      tenantId: context.tenant.tenantId,
      userId: context.actor.actorId,
    });
  } catch (error: unknown) {
    logger.error(
      { error, subject, targetId: operation.targetId },
      "post-commit integration request failed"
    );
  }
};

export const linearCustomerSyncPostCommitHook = async (
  operation: ExecutionDomainResult<unknown>,
  context: ExecutionMutationContext<unknown>
): Promise<void> => {
  if (
    operation.action !== "customers.create" ||
    operation.targetType !== "customer"
  ) {
    return;
  }

  await publishIntegrationRequest(
    eventTypes.linearCustomerSyncRequested,
    {
      action: operation.action,
      actorId: context.actor.actorId,
      entity: "customer",
      entityId: operation.targetId,
      feature: "customers",
      reason: operation.reason ?? "customer created",
      tenantId: context.tenant.tenantId,
    },
    "customers",
    context,
    operation
  );
};

export const customerNotificationPostCommitHook = async (
  operation: ExecutionDomainResult<unknown>,
  context: ExecutionMutationContext<unknown>
): Promise<void> => {
  if (
    operation.action !== "customers.create" ||
    operation.targetType !== "customer"
  ) {
    return;
  }

  const customer = operation.after?.customer as
    | {
        code?: string;
        name?: string;
      }
    | undefined;

  await persistAndDispatchNotifications({
    event: "customer.created",
    payload: {
      action: operation.action,
      actorId: context.actor.actorId,
      customerCode: customer?.code ?? undefined,
      customerId: operation.targetId,
      customerName: customer?.name ?? undefined,
      entity: "customer",
      feature: "customers",
      reason: operation.reason ?? "customer created",
      tenantId: context.tenant.tenantId,
    },
    recipients: [
      {
        tenantId: context.tenant.tenantId,
        userId: context.actor.actorId,
      },
    ],
  });
};

export const workdayCompanySyncPostCommitHook = async (
  operation: ExecutionDomainResult<unknown>,
  context: ExecutionMutationContext<unknown>
): Promise<void> => {
  if (
    operation.targetType !== "company" ||
    (operation.action !== "companies.create" &&
      operation.action !== "companies.update")
  ) {
    return;
  }

  await publishIntegrationRequest(
    eventTypes.workdayCompanySyncRequested,
    {
      action: operation.action,
      actorId: context.actor.actorId,
      companyId: context.company?.companyId,
      entity: "company",
      entityId: operation.targetId,
      feature: "companies",
      grantId: context.company?.grantId ?? undefined,
      reason: operation.reason ?? "company changed",
      tenantId: context.tenant.tenantId,
    },
    "companies",
    context,
    operation
  );
};
