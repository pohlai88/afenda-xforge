import "server-only";

import { writeAuditEvent } from "@repo/audit";
import { requireTenantActorAccess } from "@repo/auth/access";
import type { TrustedTenantContext } from "@repo/auth/trusted";
import { isTrustedTenantContext } from "@repo/auth/trusted";
import { customers, database, timeDatabaseQuery } from "@repo/database";
import { createQueryPipeline } from "@repo/execution";
import { appendRequestContextMetadata } from "@repo/logger";
import {
  createTenantRecordRule,
  permissionCatalog,
  requirePermission,
  resolvePermissionsForTenantRole,
} from "@repo/permissions";
import type { UserActorScope } from "@repo/shared";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Customer, CustomerList, ListCustomersQuery } from "./contract.ts";
import { listCustomersQuerySchema } from "./contract.ts";

export type CustomerQueryContext = UserActorScope & {
  grantedPermissions?: string[];
  requestId?: string;
  tenantId: string;
  trustedSystem?: TrustedTenantContext;
};

type ResolvedCustomerQueryAccess = {
  grantedPermissions: string[];
  tenantId: string;
  userId: string;
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

const resolveCustomerQueryAccess = async (
  context: CustomerQueryContext
): Promise<ResolvedCustomerQueryAccess> => {
  if (
    context.trustedSystem &&
    isTrustedTenantContext(context.trustedSystem) &&
    context.trustedSystem.tenantId === context.tenantId
  ) {
    return {
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

const executeCustomerListQuery = async (
  query: ListCustomersQuery,
  context: ResolvedCustomerQueryAccess
): Promise<CustomerList> => {
  const trimmedSearch = query.search?.trim();
  const filters = [
    eq(customers.tenantId, context.tenantId),
    ...(trimmedSearch
      ? [
          or(
            ilike(customers.code, `%${trimmedSearch}%`),
            ilike(customers.name, `%${trimmedSearch}%`),
            ilike(customers.email, `%${trimmedSearch}%`)
          ),
        ]
      : []),
  ];
  const whereClause = and(...filters);

  appendRequestContextMetadata({
    feature: "customers",
    operation: "list",
    tenantId: context.tenantId,
  });

  const [items, totalResult] = await Promise.all([
    timeDatabaseQuery(
      () =>
        database
          .select({
            code: customers.code,
            email: customers.email,
            id: customers.id,
            name: customers.name,
            status: customers.status,
          })
          .from(customers)
          .where(whereClause)
          .orderBy(desc(customers.createdAt))
          .limit(query.pageSize)
          .offset((query.page - 1) * query.pageSize),
      {
        operation: "select",
        resource: "customers",
        metadata: {
          tenantId: context.tenantId,
          userId: context.userId,
        },
      }
    ),
    timeDatabaseQuery(
      () =>
        database
          .select({
            total: sql<number>`count(*)::int`,
          })
          .from(customers)
          .where(whereClause),
      {
        operation: "select",
        resource: "customers",
        metadata: {
          tenantId: context.tenantId,
          userId: context.userId,
        },
      }
    ),
  ]);

  return {
    items: items.map(mapCustomer),
    page: query.page,
    pageSize: query.pageSize,
    total: totalResult[0]?.total ?? 0,
  };
};

export const listCustomers = (
  query: ListCustomersQuery,
  context: CustomerQueryContext
): Promise<CustomerList> => {
  const parsedQuery = listCustomersQuerySchema.parse(query);
  let resolvedAccess: ResolvedCustomerQueryAccess | null = null;
  const pipeline = createQueryPipeline<ListCustomersQuery, CustomerList>({
    executeQuery: ({ input }) => {
      if (!resolvedAccess) {
        throw new Error("Customer query access was not resolved");
      }

      return executeCustomerListQuery(input, resolvedAccess);
    },
    auditQueryEvent: (result, { actor, input, tenant }) => ({
      action: "customers.list",
      actorId: actor.actorId,
      actorType: "user",
      after: {},
      before: {},
      metadata: {
        page: input.page,
        pageSize: input.pageSize,
        resultCount: result.items.length,
        total: result.total,
      },
      module: "customers",
      reason: "list customer records",
      requestId: context.requestId ?? "customers.list",
      route: "/api/customers",
      summary: "Customer records listed",
      targetId: tenant.tenantId,
      targetType: "tenant",
      tenantId: tenant.tenantId,
    }),
    permissionContext: () => {
      if (!resolvedAccess) {
        throw new Error("Customer query access was not resolved");
      }

      return {
        action: "customers.list",
        actorId: resolvedAccess.userId,
        grantedPermissions: resolvedAccess.grantedPermissions,
        resource: "customers",
        tenantId: resolvedAccess.tenantId,
      };
    },
    permissionRequirement: {
      allOf: [permissionCatalog.customers.read],
      recordRules: [createTenantRecordRule("customers.tenant-scope")],
    },
    requireAuth: async () => {
      resolvedAccess = await resolveCustomerQueryAccess(context);
      return { actorId: resolvedAccess.userId };
    },
    requirePermission,
    requireTenantMembership: () => Promise.resolve(),
    resolveActiveTenant: () => {
      if (!resolvedAccess) {
        throw new Error("Customer query access was not resolved");
      }

      return Promise.resolve({ tenantId: resolvedAccess.tenantId });
    },
    validateInput: (input) => {
      listCustomersQuerySchema.parse(input);
    },
    writeAuditEvent,
  });

  return pipeline(parsedQuery);
};
