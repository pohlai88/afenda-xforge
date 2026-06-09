import "server-only";

import { randomUUID } from "node:crypto";
import type { Audit7W1HActorType, Audit7W1HChannel } from "@repo/audit";
import {
  writeAuditEvent as persistAuditEvent,
  writeAuditEventInTransaction,
} from "@repo/audit";
import { requireTenantActorAccess } from "@repo/auth/access";
import type { TrustedTenantContext } from "@repo/auth/trusted";
import { isTrustedTenantContext } from "@repo/auth/trusted";
import { customers, database, timeDatabaseQuery } from "@repo/database";
import type {
  ExecutionDatabaseTransaction,
  ExecutionDomainResult,
  ExecutionMutationContext,
  ExecutionPipelineHooks,
} from "@repo/execution";
import { createExecutionPipeline } from "@repo/execution";
import { appendRequestContextMetadata } from "@repo/logger";
import type { PermissionContext } from "@repo/permissions";
import {
  permissionCatalog,
  requirePermission,
  resolvePermissionsForTenantRole,
} from "@repo/permissions";
import type { UserActorScope } from "@repo/shared";
import type { CreateCustomerBody, Customer } from "./contract.ts";
import { createCustomerBodySchema } from "./contract.ts";

type CustomerPostCommitHook = (
  operation: ExecutionDomainResult<Customer>,
  context: ExecutionMutationContext<CreateCustomerBody>
) => Promise<void> | void;

type CustomerCommandContext = UserActorScope & {
  db?: ExecutionDatabaseTransaction;
  grantedPermissions?: string[];
  postCommitHooks?: CustomerPostCommitHook[];
  operationId?: string;
  requestId?: string;
  tenantId: string;
  trustedSystem?: TrustedTenantContext;
};

type ResolvedCustomerCommandAccess = {
  actorType?: Audit7W1HActorType;
  channel?: Audit7W1HChannel;
  grantedPermissions: string[];
  tenantId: string;
  userId: string;
};

const normalizeTrustedChannel = (
  channel: TrustedTenantContext["channel"]
): Audit7W1HChannel | undefined => {
  switch (channel) {
    case "api":
    case "cron":
    case "migration":
    case "server_action":
    case "web":
    case "webhook":
      return channel;
    default:
      return;
  }
};

const mapCustomer = (row: {
  code: string;
  email: string | null;
  id: string;
  name: string;
  status: string;
}): Customer => ({
  code: row.code,
  ...(row.email ? { email: row.email } : {}),
  id: row.id,
  name: row.name,
  status: row.status === "inactive" ? "inactive" : "active",
});

const createCustomerPermissionContext = (
  context: ResolvedCustomerCommandAccess,
  action: string
): PermissionContext => ({
  action,
  actorId: context.userId,
  grantedPermissions: context.grantedPermissions,
  resource: "customers",
  tenantId: context.tenantId,
});

const resolveCustomerCommandAccess = async (
  context: CustomerCommandContext
): Promise<ResolvedCustomerCommandAccess> => {
  if (
    context.trustedSystem &&
    isTrustedTenantContext(context.trustedSystem) &&
    context.trustedSystem.tenantId === context.tenantId
  ) {
    return {
      actorType: context.trustedSystem.actorType ?? "integration",
      channel: normalizeTrustedChannel(context.trustedSystem.channel),
      grantedPermissions: context.grantedPermissions ?? [],
      tenantId: context.tenantId,
      userId: context.userId,
    };
  }

  const access = await requireTenantActorAccess({
    tenantId: context.tenantId,
    userId: context.userId,
  });

  return {
    grantedPermissions: resolvePermissionsForTenantRole(access.membership.role),
    tenantId: access.membership.tenantId,
    userId: access.membership.userId,
  };
};

const insertCustomerRecord = async (
  input: CreateCustomerBody,
  context: CustomerCommandContext
): Promise<Customer> => {
  const db = context.db ?? database;

  appendRequestContextMetadata({
    customerCode: input.code,
    feature: "customers",
    operation: "create",
    tenantId: context.tenantId,
  });

  const [customer] = await timeDatabaseQuery(
    () =>
      db
        .insert(customers)
        .values({
          code: input.code.trim(),
          email: input.email?.trim().toLowerCase() ?? null,
          name: input.name.trim(),
          tenantId: context.tenantId,
        })
        .returning({
          code: customers.code,
          email: customers.email,
          id: customers.id,
          name: customers.name,
          status: customers.status,
        }),
    {
      operation: "insert",
      resource: "customers",
      metadata: {
        tenantId: context.tenantId,
        userId: context.userId,
      },
    }
  );

  return mapCustomer(customer);
};

const persistCustomerAuditEvent = (
  event: Parameters<typeof persistAuditEvent>[0],
  db?: ExecutionDatabaseTransaction
): ReturnType<typeof persistAuditEvent> => {
  if (db) {
    return writeAuditEventInTransaction(db, event);
  }

  return persistAuditEvent(event);
};

export const createCustomer = (
  input: CreateCustomerBody,
  context: CustomerCommandContext
): Promise<Customer> => {
  const parsedInput = createCustomerBodySchema.parse(input);
  let resolvedAccess: ResolvedCustomerCommandAccess | null = null;
  const pipeline = createExecutionPipeline<CreateCustomerBody, Customer>({
    executeDomainOperation: async ({
      db,
      input: executionInput,
      actor,
      tenant,
    }: ExecutionMutationContext<CreateCustomerBody>) => {
      const customer = await insertCustomerRecord(executionInput, {
        ...context,
        db,
        tenantId: tenant.tenantId,
        userId: actor.actorId,
      });

      return {
        action: "customers.create",
        after: {
          customer,
        },
        before: {},
        channel: resolvedAccess?.channel,
        reason: "create customer",
        result: customer,
        targetId: customer.id,
        targetType: "customer",
      };
    },
    permissionContext: () => {
      if (!resolvedAccess) {
        throw new Error("Customer command access was not resolved");
      }

      return createCustomerPermissionContext(
        resolvedAccess,
        "customers.create"
      );
    },
    permissionRequirement: {
      allOf: [permissionCatalog.customers.write],
    },
    runInTransaction: <T>(
      run: (db: ExecutionDatabaseTransaction) => Promise<T>
    ): Promise<T> => database.transaction(run),
    postCommitHooks: context.postCommitHooks as ExecutionPipelineHooks<
      CreateCustomerBody,
      Customer
    >["postCommitHooks"],
    operationId: context.operationId ?? context.requestId ?? randomUUID(),
    requireAuth: async () => {
      resolvedAccess = await resolveCustomerCommandAccess(context);

      return {
        actorId: resolvedAccess.userId,
        actorType: resolvedAccess.actorType,
      };
    },
    requirePermission,
    requireTenantMembership: () => Promise.resolve(),
    resolveActiveTenant: () => {
      if (!resolvedAccess) {
        throw new Error("Customer command access was not resolved");
      }

      return Promise.resolve({ tenantId: resolvedAccess.tenantId });
    },
    requestId: context.requestId ?? randomUUID(),
    validateInput: (executionInput) => {
      createCustomerBodySchema.parse(executionInput);
    },
    writeAuditEvent: persistCustomerAuditEvent,
  });

  return pipeline(parsedInput);
};
