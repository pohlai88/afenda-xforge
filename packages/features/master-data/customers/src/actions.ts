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
import { NotFoundError, ResourceStateError } from "@repo/errors";
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
import { and, eq } from "drizzle-orm";
import type {
  CreateCustomerBody,
  Customer,
  UpdateCustomerBody,
} from "./contract.ts";
import {
  createCustomerBodySchema,
  updateCustomerBodySchema,
} from "./contract.ts";

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

type CustomerMutationContext = CustomerCommandContext & {
  customerId: string;
};

type UpdateCustomerCommandInput = UpdateCustomerBody & {
  customerId: string;
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

const readCustomerRecord = async (
  customerId: string,
  context: CustomerMutationContext
): Promise<Customer> => {
  const db = context.db ?? database;
  const [existingCustomer] = await timeDatabaseQuery(
    () =>
      db
        .select({
          code: customers.code,
          email: customers.email,
          id: customers.id,
          name: customers.name,
          status: customers.status,
        })
        .from(customers)
        .where(
          and(
            eq(customers.id, customerId),
            eq(customers.tenantId, context.tenantId)
          )
        )
        .limit(1),
    {
      operation: "select",
      resource: "customers",
      metadata: {
        customerId,
        tenantId: context.tenantId,
        userId: context.userId,
      },
    }
  );

  if (!existingCustomer) {
    throw new NotFoundError("Customer", customerId);
  }

  return mapCustomer(existingCustomer);
};

const updateCustomerRecord = async (
  input: UpdateCustomerBody,
  context: CustomerMutationContext
): Promise<{ after: Customer; before: Customer }> => {
  const db = context.db ?? database;
  const before = await readCustomerRecord(context.customerId, context);

  appendRequestContextMetadata({
    customerCode: input.code,
    customerId: context.customerId,
    feature: "customers",
    operation: "update",
    tenantId: context.tenantId,
  });

  const [customer] = await timeDatabaseQuery(
    () =>
      db
        .update(customers)
        .set({
          code: input.code.trim(),
          email: input.email?.trim().toLowerCase() ?? null,
          name: input.name.trim(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(customers.id, context.customerId),
            eq(customers.tenantId, context.tenantId)
          )
        )
        .returning({
          code: customers.code,
          email: customers.email,
          id: customers.id,
          name: customers.name,
          status: customers.status,
        }),
    {
      operation: "update",
      resource: "customers",
      metadata: {
        customerId: context.customerId,
        tenantId: context.tenantId,
        userId: context.userId,
      },
    }
  );

  if (!customer) {
    throw new NotFoundError("Customer", context.customerId);
  }

  return {
    after: mapCustomer(customer),
    before,
  };
};

const archiveCustomerRecord = async (
  context: CustomerMutationContext
): Promise<{ after: Customer; before: Customer }> => {
  const db = context.db ?? database;
  const before = await readCustomerRecord(context.customerId, context);

  if (before.status === "inactive") {
    throw new ResourceStateError("Customer", before.status);
  }

  appendRequestContextMetadata({
    customerId: context.customerId,
    feature: "customers",
    operation: "archive",
    tenantId: context.tenantId,
  });

  const [customer] = await timeDatabaseQuery(
    () =>
      db
        .update(customers)
        .set({
          status: "inactive",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(customers.id, context.customerId),
            eq(customers.tenantId, context.tenantId)
          )
        )
        .returning({
          code: customers.code,
          email: customers.email,
          id: customers.id,
          name: customers.name,
          status: customers.status,
        }),
    {
      operation: "update",
      resource: "customers",
      metadata: {
        customerId: context.customerId,
        tenantId: context.tenantId,
        userId: context.userId,
      },
    }
  );

  if (!customer) {
    throw new NotFoundError("Customer", context.customerId);
  }

  return {
    after: mapCustomer(customer),
    before,
  };
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

export const updateCustomer = (
  input: UpdateCustomerCommandInput,
  context: CustomerMutationContext
): Promise<Customer> => {
  const parsedInput = updateCustomerBodySchema.parse(input);
  let resolvedAccess: ResolvedCustomerCommandAccess | null = null;
  const pipeline = createExecutionPipeline<
    UpdateCustomerCommandInput,
    Customer
  >({
    executeDomainOperation: async ({
      db,
      input: executionInput,
      actor,
      tenant,
    }: ExecutionMutationContext<UpdateCustomerCommandInput>) => {
      const { after, before } = await updateCustomerRecord(executionInput, {
        ...context,
        customerId: executionInput.customerId,
        db,
        tenantId: tenant.tenantId,
        userId: actor.actorId,
      });

      return {
        action: "customers.update",
        after: {
          customer: after,
        },
        before: {
          customer: before,
        },
        channel: resolvedAccess?.channel,
        reason: "update customer",
        result: after,
        targetId: after.id,
        targetType: "customer",
      };
    },
    permissionContext: () => {
      if (!resolvedAccess) {
        throw new Error("Customer command access was not resolved");
      }

      return createCustomerPermissionContext(
        resolvedAccess,
        "customers.update"
      );
    },
    permissionRequirement: {
      allOf: [permissionCatalog.customers.write],
    },
    runInTransaction: <T>(
      run: (db: ExecutionDatabaseTransaction) => Promise<T>
    ): Promise<T> => database.transaction(run),
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
      updateCustomerBodySchema.parse(executionInput);
    },
    writeAuditEvent: persistCustomerAuditEvent,
  });

  return pipeline({ ...parsedInput, customerId: context.customerId });
};

export const archiveCustomer = (
  context: CustomerMutationContext
): Promise<Customer> => {
  let resolvedAccess: ResolvedCustomerCommandAccess | null = null;
  const pipeline = createExecutionPipeline<{ customerId: string }, Customer>({
    executeDomainOperation: async ({
      db,
      actor,
      tenant,
    }: ExecutionMutationContext<{ customerId: string }>) => {
      const { after, before } = await archiveCustomerRecord({
        ...context,
        customerId: context.customerId,
        db,
        tenantId: tenant.tenantId,
        userId: actor.actorId,
      });

      return {
        action: "customers.archive",
        after: {
          customer: after,
        },
        before: {
          customer: before,
        },
        channel: resolvedAccess?.channel,
        reason: "archive customer",
        result: after,
        targetId: after.id,
        targetType: "customer",
      };
    },
    permissionContext: () => {
      if (!resolvedAccess) {
        throw new Error("Customer command access was not resolved");
      }

      return createCustomerPermissionContext(
        resolvedAccess,
        "customers.archive"
      );
    },
    permissionRequirement: {
      allOf: [permissionCatalog.customers.write],
    },
    runInTransaction: <T>(
      run: (db: ExecutionDatabaseTransaction) => Promise<T>
    ): Promise<T> => database.transaction(run),
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
    validateInput: () => undefined,
    writeAuditEvent: persistCustomerAuditEvent,
  });

  return pipeline({ customerId: context.customerId });
};
