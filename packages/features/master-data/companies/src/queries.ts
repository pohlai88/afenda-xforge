import "server-only";

import { writeAuditEvent } from "@repo/audit";
import { requireTenantActorAccess } from "@repo/auth/access";
import type { TrustedTenantContext } from "@repo/auth/trusted";
import { isTrustedTenantContext } from "@repo/auth/trusted";
import { companies, database, timeDatabaseQuery } from "@repo/database";
import { createQueryPipeline } from "@repo/execution";
import { appendRequestContextMetadata } from "@repo/logger";
import {
  createTenantRecordRule,
  permissionCatalog,
  requirePermission,
  resolvePermissionsForTenantRole,
} from "@repo/permissions";
import type { TenantActorScope, UserActorScope } from "@repo/shared";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Company, CompanyList, ListCompaniesQuery } from "./contract.ts";
import { listCompaniesQuerySchema } from "./contract.ts";

export type CompanyQueryContext = UserActorScope & {
  grantedPermissions?: string[];
  requestId?: string;
  tenantId: string;
  trustedSystem?: TrustedTenantContext;
};

type ResolvedCompanyQueryAccess = {
  grantedPermissions: string[];
  tenantId: string;
  userId: string;
};

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

const resolveCompanyQueryAccess = async (
  context: CompanyQueryContext
): Promise<ResolvedCompanyQueryAccess> => {
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

const executeCompanyListQuery = async (
  query: ListCompaniesQuery,
  context: ResolvedCompanyQueryAccess
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

export const listCompanies = (
  query: ListCompaniesQuery,
  context: CompanyQueryContext
): Promise<CompanyList> => {
  const parsedQuery = listCompaniesQuerySchema.parse(query);
  let resolvedAccess: ResolvedCompanyQueryAccess | null = null;
  const pipeline = createQueryPipeline<ListCompaniesQuery, CompanyList>({
    executeQuery: ({ input }) => {
      if (!resolvedAccess) {
        throw new Error("Company query access was not resolved");
      }

      return executeCompanyListQuery(input, resolvedAccess);
    },
    auditQueryEvent: (result, { actor, input, tenant }) => ({
      action: "companies.list",
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
      module: "companies",
      reason: "list company records",
      requestId: context.requestId ?? "companies.list",
      route: "/api/companies",
      summary: "Company records listed",
      targetId: tenant.tenantId,
      targetType: "tenant",
      tenantId: tenant.tenantId,
    }),
    permissionContext: () => {
      if (!resolvedAccess) {
        throw new Error("Company query access was not resolved");
      }

      return {
        action: "companies.list",
        actorId: resolvedAccess.userId,
        grantedPermissions: resolvedAccess.grantedPermissions,
        resource: "companies",
        tenantId: resolvedAccess.tenantId,
      };
    },
    permissionRequirement: {
      allOf: [permissionCatalog.companies.read],
      recordRules: [createTenantRecordRule("companies.tenant-scope")],
    },
    requireAuth: async () => {
      resolvedAccess = await resolveCompanyQueryAccess(context);
      return { actorId: resolvedAccess.userId };
    },
    requirePermission,
    requireTenantMembership: () => Promise.resolve(),
    resolveActiveTenant: () => {
      if (!resolvedAccess) {
        throw new Error("Company query access was not resolved");
      }

      return Promise.resolve({ tenantId: resolvedAccess.tenantId });
    },
    validateInput: (input) => {
      listCompaniesQuerySchema.parse(input);
    },
    writeAuditEvent,
  });

  return pipeline(parsedQuery);
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
