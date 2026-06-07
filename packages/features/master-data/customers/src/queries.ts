import "server-only";

import { customers, database, timeDatabaseQuery } from "@repo/database";
import { appendRequestContextMetadata } from "@repo/logger";
import type { TenantActorScope } from "@repo/shared";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Customer, CustomerList, ListCustomersQuery } from "./contract.ts";

type CustomerQueryContext = TenantActorScope;

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

export const listCustomers = async (
  query: ListCustomersQuery,
  context: CustomerQueryContext
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
