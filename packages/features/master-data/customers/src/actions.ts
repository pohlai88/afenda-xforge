import "server-only";

import { randomUUID } from "node:crypto";
import { writeAuditEvent as persistAuditEvent } from "@repo/audit";
import { customers, database, timeDatabaseQuery } from "@repo/database";
import type {
  ExecutionDomainResult,
  ExecutionMutationContext,
  ExecutionPipelineHooks,
} from "@repo/execution";
import { createExecutionPipeline } from "@repo/execution";
import { appendRequestContextMetadata } from "@repo/logger";
import type { PermissionContext } from "@repo/permissions";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import type { TenantActorScope } from "@repo/shared";
import type { CreateCustomerBody, Customer } from "./contract.ts";

type CustomerPostCommitHook = (
  operation: ExecutionDomainResult<Customer>,
  context: ExecutionMutationContext<CreateCustomerBody>
) => Promise<void> | void;

type CustomerCommandContext = TenantActorScope & {
  grantedPermissions: string[];
  postCommitHooks?: CustomerPostCommitHook[];
  requestId?: string;
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
  context: CustomerCommandContext,
  action: string
): PermissionContext => ({
  action,
  actorId: context.userId,
  grantedPermissions: context.grantedPermissions,
  resource: "customers",
  tenantId: context.tenantId,
});

const insertCustomerRecord = async (
  input: CreateCustomerBody,
  context: CustomerCommandContext
): Promise<Customer> => {
  appendRequestContextMetadata({
    customerCode: input.code,
    feature: "customers",
    operation: "create",
    tenantId: context.tenantId,
  });

  const [customer] = await timeDatabaseQuery(
    () =>
      database
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

export const createCustomer = (
  input: CreateCustomerBody,
  context: CustomerCommandContext
): Promise<Customer> => {
  const pipeline = createExecutionPipeline<CreateCustomerBody, Customer>({
    executeDomainOperation: async ({
      input: executionInput,
      actor,
      tenant,
    }: ExecutionMutationContext<CreateCustomerBody>) => {
      const customer = await insertCustomerRecord(executionInput, {
        ...context,
        tenantId: tenant.tenantId,
        userId: actor.actorId,
      });

      return {
        action: "customers.create",
        after: {
          customer,
        },
        before: {},
        reason: "create customer",
        result: customer,
        targetId: customer.id,
        targetType: "customer",
      };
    },
    permissionContext: () =>
      createCustomerPermissionContext(context, "customers.create"),
    permissionRequirement: {
      allOf: [permissionCatalog.customers.write],
    },
    postCommitHooks: context.postCommitHooks as ExecutionPipelineHooks<
      CreateCustomerBody,
      Customer
    >["postCommitHooks"],
    requireAuth: async () => ({ actorId: context.userId }),
    requirePermission,
    requireTenantMembership: async () => undefined,
    resolveActiveTenant: async () => ({ tenantId: context.tenantId }),
    requestId: context.requestId ?? randomUUID(),
    validateInput: async () => undefined,
    writeAuditEvent: persistAuditEvent,
  });

  return pipeline(input);
};
