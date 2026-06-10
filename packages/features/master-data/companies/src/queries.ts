import "server-only";

import type { Audit7W1HActorType, Audit7W1HChannel } from "@repo/audit";
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
import type { UserActorScope } from "@repo/shared";
import { and, asc, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { buildCompanyHierarchy } from "./hierarchy.ts";
import { mapCompany } from "./mapper.ts";
import type {
  Company,
  CompanyHierarchyNode,
  CompanyList,
  ListCompaniesQuery,
} from "./schema.ts";
import { getCompanyQuerySchema, listCompaniesQuerySchema } from "./schema.ts";

export type CompanyQueryContext = UserActorScope & {
  grantedPermissions?: string[];
  requestId?: string;
  tenantId: string;
  trustedSystem?: TrustedTenantContext;
};

type ResolvedCompanyQueryAccess = {
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

const companySelect = {
  code: companies.code,
  countryCode: companies.countryCode,
  currencyCode: companies.currencyCode,
  description: companies.description,
  email: companies.email,
  establishedOn: companies.establishedOn,
  id: companies.id,
  isGroup: companies.isGroup,
  name: companies.name,
  parentCompanyId: companies.parentCompanyId,
  phone: companies.phone,
  registrationNumber: companies.registrationNumber,
  status: companies.status,
  taxId: companies.taxId,
  website: companies.website,
};

const resolveCompanyQueryAccess = async (
  context: CompanyQueryContext
): Promise<ResolvedCompanyQueryAccess> => {
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

const buildCompanyFilters = (
  query: ListCompaniesQuery,
  context: ResolvedCompanyQueryAccess
) => {
  const trimmedSearch = query.search?.trim();

  return [
    eq(companies.tenantId, context.tenantId),
    ...(query.status ? [eq(companies.status, query.status)] : []),
    ...(query.rootOnly ? [isNull(companies.parentCompanyId)] : []),
    ...(query.parentCompanyId
      ? [eq(companies.parentCompanyId, query.parentCompanyId)]
      : []),
    ...(trimmedSearch
      ? [
          or(
            ilike(companies.code, `%${trimmedSearch}%`),
            ilike(companies.name, `%${trimmedSearch}%`),
            ilike(companies.email, `%${trimmedSearch}%`),
            ilike(companies.taxId, `%${trimmedSearch}%`),
            ilike(companies.registrationNumber, `%${trimmedSearch}%`)
          ),
        ]
      : []),
  ];
};

const executeCompanyListQuery = async (
  query: ListCompaniesQuery,
  context: ResolvedCompanyQueryAccess
): Promise<CompanyList> => {
  const whereClause = and(...buildCompanyFilters(query, context));

  appendRequestContextMetadata({
    feature: "companies",
    operation: "list",
    tenantId: context.tenantId,
  });

  const [items, totalResult] = await Promise.all([
    timeDatabaseQuery(
      () =>
        database
          .select(companySelect)
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

const executeCompanyHierarchyQuery = async (
  query: ListCompaniesQuery,
  context: ResolvedCompanyQueryAccess
): Promise<CompanyHierarchyNode[]> => {
  const hierarchyQuery = {
    ...query,
    parentCompanyId: undefined,
    rootOnly: undefined,
  };
  const whereClause = and(...buildCompanyFilters(hierarchyQuery, context));

  appendRequestContextMetadata({
    feature: "companies",
    operation: "hierarchy",
    tenantId: context.tenantId,
  });

  const records = await timeDatabaseQuery(
    () =>
      database
        .select(companySelect)
        .from(companies)
        .where(whereClause)
        .orderBy(asc(companies.name), asc(companies.createdAt)),
    {
      operation: "select",
      resource: "companies",
      metadata: {
        tenantId: context.tenantId,
        userId: context.userId,
      },
    }
  );

  return buildCompanyHierarchy(records.map(mapCompany), query.parentCompanyId);
};

const createCompanyPermissionContext = (
  resolvedAccess: ResolvedCompanyQueryAccess,
  action: string
) => ({
  action,
  actorId: resolvedAccess.userId,
  grantedPermissions: resolvedAccess.grantedPermissions,
  resource: "companies",
  tenantId: resolvedAccess.tenantId,
});

export const listCompanies = (
  query: ListCompaniesQuery,
  context: CompanyQueryContext
): Promise<CompanyList> => {
  const parsedQuery = listCompaniesQuerySchema.parse(query);
  let resolvedAccess: ResolvedCompanyQueryAccess | null = null;
  const pipeline = createQueryPipeline<ListCompaniesQuery, CompanyList>({
    auditQueryEvent: (result, { actor, input, tenant }) => ({
      action: "companies.list",
      actorId: actor.actorId,
      actorType: resolvedAccess?.actorType ?? actor.actorType ?? "user",
      after: {},
      before: {},
      channel: resolvedAccess?.channel,
      metadata: {
        page: input.page,
        pageSize: input.pageSize,
        resultCount: result.items.length,
        status: input.status ?? null,
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
    executeQuery: ({ input }) => {
      if (!resolvedAccess) {
        throw new Error("Company query access was not resolved");
      }

      return executeCompanyListQuery(input, resolvedAccess);
    },
    permissionContext: () => {
      if (!resolvedAccess) {
        throw new Error("Company query access was not resolved");
      }

      return createCompanyPermissionContext(resolvedAccess, "companies.list");
    },
    permissionRequirement: {
      allOf: [permissionCatalog.companies.read],
      recordRules: [createTenantRecordRule("companies.tenant-scope")],
    },
    requireAuth: async () => {
      resolvedAccess = await resolveCompanyQueryAccess(context);
      return {
        actorId: resolvedAccess.userId,
        actorType: resolvedAccess.actorType,
      };
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

export const listCompanyHierarchy = (
  query: ListCompaniesQuery,
  context: CompanyQueryContext
): Promise<CompanyHierarchyNode[]> => {
  const parsedQuery = listCompaniesQuerySchema.parse(query);
  let resolvedAccess: ResolvedCompanyQueryAccess | null = null;
  const pipeline = createQueryPipeline<
    ListCompaniesQuery,
    CompanyHierarchyNode[]
  >({
    auditQueryEvent: (result, { actor, input, tenant }) => ({
      action: "companies.hierarchy",
      actorId: actor.actorId,
      actorType: resolvedAccess?.actorType ?? actor.actorType ?? "user",
      after: {},
      before: {},
      channel: resolvedAccess?.channel,
      metadata: {
        rootCount: result.length,
        status: input.status ?? null,
      },
      module: "companies",
      reason: "list company hierarchy",
      requestId: context.requestId ?? "companies.hierarchy",
      route: "/api/companies",
      summary: "Company hierarchy listed",
      targetId: tenant.tenantId,
      targetType: "tenant",
      tenantId: tenant.tenantId,
    }),
    executeQuery: ({ input }) => {
      if (!resolvedAccess) {
        throw new Error("Company query access was not resolved");
      }

      return executeCompanyHierarchyQuery(input, resolvedAccess);
    },
    permissionContext: () => {
      if (!resolvedAccess) {
        throw new Error("Company query access was not resolved");
      }

      return createCompanyPermissionContext(
        resolvedAccess,
        "companies.hierarchy"
      );
    },
    permissionRequirement: {
      allOf: [permissionCatalog.companies.read],
      recordRules: [createTenantRecordRule("companies.tenant-scope")],
    },
    requireAuth: async () => {
      resolvedAccess = await resolveCompanyQueryAccess(context);
      return {
        actorId: resolvedAccess.userId,
        actorType: resolvedAccess.actorType,
      };
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

export const getCompany = (
  companyId: string,
  context: CompanyQueryContext
): Promise<Company | null> => {
  const parsedInput = getCompanyQuerySchema.parse({ companyId });
  let resolvedAccess: ResolvedCompanyQueryAccess | null = null;
  const pipeline = createQueryPipeline<{ companyId: string }, Company | null>({
    auditQueryEvent: (result, { actor, input, tenant }) => ({
      action: "companies.get",
      actorId: actor.actorId,
      actorType: resolvedAccess?.actorType ?? actor.actorType ?? "user",
      after: {},
      before: {},
      channel: resolvedAccess?.channel,
      metadata: {
        found: Boolean(result),
      },
      module: "companies",
      reason: "get company record",
      requestId: context.requestId ?? "companies.get",
      route: "/api/companies",
      summary: "Company record loaded",
      targetId: input.companyId,
      targetType: "company",
      tenantId: tenant.tenantId,
    }),
    executeQuery: async ({ input }) => {
      if (!resolvedAccess) {
        throw new Error("Company query access was not resolved");
      }

      const access = resolvedAccess;

      appendRequestContextMetadata({
        companyId: input.companyId,
        feature: "companies",
        operation: "get",
        tenantId: access.tenantId,
      });

      const [company] = await timeDatabaseQuery(
        () =>
          database
            .select(companySelect)
            .from(companies)
            .where(
              and(
                eq(companies.id, input.companyId),
                eq(companies.tenantId, access.tenantId)
              )
            )
            .limit(1),
        {
          operation: "select",
          resource: "companies",
          metadata: {
            companyId: input.companyId,
            tenantId: access.tenantId,
            userId: access.userId,
          },
        }
      );

      return company ? mapCompany(company) : null;
    },
    permissionContext: () => {
      if (!resolvedAccess) {
        throw new Error("Company query access was not resolved");
      }

      return createCompanyPermissionContext(resolvedAccess, "companies.get");
    },
    permissionRequirement: {
      allOf: [permissionCatalog.companies.read],
      recordRules: [createTenantRecordRule("companies.tenant-scope")],
    },
    requireAuth: async () => {
      resolvedAccess = await resolveCompanyQueryAccess(context);
      return {
        actorId: resolvedAccess.userId,
        actorType: resolvedAccess.actorType,
      };
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
      getCompanyQuerySchema.parse(input);
    },
    writeAuditEvent,
  });

  return pipeline(parsedInput);
};
