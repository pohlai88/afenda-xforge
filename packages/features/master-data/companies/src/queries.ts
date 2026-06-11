import "server-only";

import { companies, database, timeDatabaseQuery } from "@repo/database";
import { appendRequestContextMetadata } from "@repo/logger";
import type { TenantActorScope } from "@repo/shared";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Company, CompanyList, ListCompaniesQuery } from "./contract.ts";

const mapCompany = (row: {
  code: string;
  id: string;
  name: string;
  status: string;
}): Company => ({
  code: row.code,
  id: row.id,
  name: row.name,
  status: row.status as Company["status"],
});

export const listCompanies = async (
  query: ListCompaniesQuery,
  context: TenantActorScope
): Promise<CompanyList> => {
  const trimmedSearch = query.search?.trim();
  const filters = [
    eq(companies.tenantId, context.tenantId),
    ...(trimmedSearch
      ? [
          or(
            ilike(companies.code, `%${trimmedSearch}%`),
            ilike(companies.name, `%${trimmedSearch}%`)
          ),
        ]
      : []),
  ];
  const whereClause = and(...filters);

  appendRequestContextMetadata({
    feature: "companies",
    operation: "list",
    tenantId: context.tenantId,
  });

  const [items, totalResult] = await Promise.all([
    timeDatabaseQuery(
      () =>
        database
          .select({
            code: companies.code,
            id: companies.id,
            name: companies.name,
            status: companies.status,
          })
          .from(companies)
          .where(whereClause)
          .orderBy(desc(companies.createdAt))
          .limit(query.pageSize)
          .offset((query.page - 1) * query.pageSize),
      {
        operation: "select",
        resource: "companies",
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
          .from(companies)
          .where(whereClause),
      {
        operation: "select",
        resource: "companies",
        metadata: {
          tenantId: context.tenantId,
          userId: context.userId,
        },
      }
    ),
  ]);

  return {
    items: items.map(mapCompany),
    page: query.page,
    pageSize: query.pageSize,
    total: totalResult[0]?.total ?? 0,
  };
};

export const getCompany = async (
  companyId: string,
  context: TenantActorScope
): Promise<Company | null> => {
  appendRequestContextMetadata({
    companyId,
    feature: "companies",
    operation: "get",
    tenantId: context.tenantId,
  });

  const [company] = await timeDatabaseQuery(
    () =>
      database
        .select({
          code: companies.code,
          id: companies.id,
          name: companies.name,
          status: companies.status,
        })
        .from(companies)
        .where(
          and(
            eq(companies.id, companyId),
            eq(companies.tenantId, context.tenantId)
          )
        )
        .limit(1),
    {
      operation: "select",
      resource: "companies",
      metadata: {
        companyId,
        tenantId: context.tenantId,
        userId: context.userId,
      },
    }
  );

  return company ? mapCompany(company) : null;
};
