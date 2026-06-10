import "server-only";

import { randomUUID } from "node:crypto";
import type { Audit7W1HActorType, Audit7W1HChannel } from "@repo/audit";
import {
  writeAuditEvent as persistAuditEvent,
  writeAuditEventInTransaction,
} from "@repo/audit";
import {
  requireCompanyActorAccess,
  requireTenantActorAccess,
} from "@repo/auth/access";
import type { TrustedTenantContext } from "@repo/auth/trusted";
import { isTrustedTenantContext } from "@repo/auth/trusted";
import { companies, database, timeDatabaseQuery } from "@repo/database";
import { NotFoundError, ValidationError } from "@repo/errors";
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
import { and, eq, sql } from "drizzle-orm";
import { mapCompany } from "./mapper.ts";
import type {
  Company,
  CompanyLifecycleBody,
  CreateCompanyBody,
  UpdateCompanyBody,
} from "./schema.ts";
import {
  companyLifecycleBodySchema,
  createCompanyBodySchema,
  updateCompanyBodySchema,
} from "./schema.ts";

type CompanyMutationInput =
  | CompanyLifecycleBody
  | CreateCompanyBody
  | UpdateCompanyBody;

type CompanyPostCommitHook<TInput extends CompanyMutationInput> = (
  operation: ExecutionDomainResult<Company>,
  context: ExecutionMutationContext<TInput>
) => Promise<void> | void;

type CompanyCommandContext<TInput extends CompanyMutationInput> =
  UserActorScope & {
    companyId?: string;
    db?: ExecutionDatabaseTransaction;
    grantId?: string;
    grantedPermissions?: string[];
    operationId?: string;
    postCommitHooks?: CompanyPostCommitHook<TInput>[];
    requestId?: string;
    tenantId: string;
    trustedSystem?: TrustedTenantContext;
  };

type ResolvedCompanyCommandAccess = {
  actorType?: Audit7W1HActorType;
  channel?: Audit7W1HChannel;
  grantedPermissions: string[];
  tenantId: string;
  trusted: boolean;
  userId: string;
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

const toDateOrNull = (value: string | undefined): Date | null =>
  value ? new Date(`${value}T00:00:00.000Z`) : null;

const persistCompanyAuditEvent = (
  event: Parameters<typeof persistAuditEvent>[0],
  db?: ExecutionDatabaseTransaction
): ReturnType<typeof persistAuditEvent> => {
  if (db) {
    return writeAuditEventInTransaction(db, event);
  }

  return persistAuditEvent(event);
};

const resolveCompanyCommandAccess = async <TInput extends CompanyMutationInput>(
  context: CompanyCommandContext<TInput>
): Promise<ResolvedCompanyCommandAccess> => {
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
      trusted: true,
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
    trusted: false,
    userId: access.membership.userId,
  };
};

const createCompanyPermissionContext = (
  access: ResolvedCompanyCommandAccess,
  action: string,
  companyId?: string
): PermissionContext => ({
  action,
  actorId: access.userId,
  companyId,
  grantedPermissions: access.grantedPermissions,
  resource: "companies",
  tenantId: access.tenantId,
});

const selectCompanyById = async (
  companyId: string,
  tenantId: string,
  db: ExecutionDatabaseTransaction
): Promise<Company | null> => {
  const [company] = await timeDatabaseQuery(
    () =>
      db
        .select(companySelect)
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

  return company ? mapCompany(company) : null;
};

const countActiveChildren = async (
  companyId: string,
  tenantId: string,
  db: ExecutionDatabaseTransaction
): Promise<number> => {
  const [result] = await timeDatabaseQuery(
    () =>
      db
        .select({
          total: sql<number>`count(*)::int`,
        })
        .from(companies)
        .where(
          and(
            eq(companies.tenantId, tenantId),
            eq(companies.parentCompanyId, companyId),
            eq(companies.status, "active")
          )
        ),
    {
      operation: "select",
      resource: "companies",
      metadata: {
        companyId,
        tenantId,
      },
    }
  );

  return result?.total ?? 0;
};

const validateCompanyParent = async ({
  db,
  parentCompanyId,
  targetCompanyId,
  tenantId,
}: {
  db: ExecutionDatabaseTransaction;
  parentCompanyId?: string;
  targetCompanyId?: string;
  tenantId: string;
}): Promise<void> => {
  if (!parentCompanyId) {
    return;
  }

  if (targetCompanyId && parentCompanyId === targetCompanyId) {
    throw new ValidationError({
      parentCompanyId: ["A company cannot be its own parent"],
    });
  }

  let currentParent = await selectCompanyById(parentCompanyId, tenantId, db);

  if (!currentParent) {
    throw new ValidationError({
      parentCompanyId: ["Parent company must belong to the same tenant"],
    });
  }

  while (currentParent?.parentCompanyId) {
    if (currentParent.parentCompanyId === targetCompanyId) {
      throw new ValidationError({
        parentCompanyId: ["Parent company would create a hierarchy cycle"],
      });
    }

    currentParent = await selectCompanyById(
      currentParent.parentCompanyId,
      tenantId,
      db
    );
  }
};

const requireMutableCompany = async (
  companyId: string,
  tenantId: string,
  db: ExecutionDatabaseTransaction
): Promise<Company> => {
  const company = await selectCompanyById(companyId, tenantId, db);

  if (!company) {
    throw new NotFoundError("Company", companyId);
  }

  return company;
};

const buildCompanyValues = (
  input: CreateCompanyBody | UpdateCompanyBody,
  actorId: string
) => ({
  code: input.code.trim(),
  countryCode: input.countryCode ?? null,
  currencyCode: input.currencyCode ?? null,
  description: input.description ?? null,
  email: input.email ?? null,
  establishedOn: toDateOrNull(input.establishedOn),
  isGroup: input.isGroup,
  name: input.name.trim(),
  parentCompanyId: input.parentCompanyId ?? null,
  phone: input.phone ?? null,
  registrationNumber: input.registrationNumber ?? null,
  status: input.status,
  taxId: input.taxId ?? null,
  updatedAt: new Date(),
  updatedBy: actorId,
  website: input.website ?? null,
});

const insertCompanyRecord = async (
  input: CreateCompanyBody,
  context: {
    actorId: string;
    db: ExecutionDatabaseTransaction;
    tenantId: string;
  }
): Promise<Company> => {
  await validateCompanyParent({
    db: context.db,
    parentCompanyId: input.parentCompanyId,
    tenantId: context.tenantId,
  });

  appendRequestContextMetadata({
    companyCode: input.code,
    feature: "companies",
    operation: "create",
    tenantId: context.tenantId,
  });

  const [company] = await timeDatabaseQuery(
    () =>
      context.db
        .insert(companies)
        .values({
          ...buildCompanyValues(input, context.actorId),
          createdBy: context.actorId,
          tenantId: context.tenantId,
        })
        .returning(companySelect),
    {
      operation: "insert",
      resource: "companies",
      metadata: {
        tenantId: context.tenantId,
        userId: context.actorId,
      },
    }
  );

  return mapCompany(company);
};

const updateCompanyRecord = async (
  input: UpdateCompanyBody,
  context: {
    actorId: string;
    companyId: string;
    db: ExecutionDatabaseTransaction;
    tenantId: string;
  }
): Promise<{
  after: Company;
  before: Company;
}> => {
  const before = await requireMutableCompany(
    context.companyId,
    context.tenantId,
    context.db
  );

  await validateCompanyParent({
    db: context.db,
    parentCompanyId: input.parentCompanyId,
    targetCompanyId: context.companyId,
    tenantId: context.tenantId,
  });

  if (
    before.status === "active" &&
    input.status === "inactive" &&
    (await countActiveChildren(
      context.companyId,
      context.tenantId,
      context.db
    )) > 0
  ) {
    throw new ValidationError({
      status: ["Archive active child companies before archiving this company"],
    });
  }

  appendRequestContextMetadata({
    companyCode: input.code,
    companyId: context.companyId,
    feature: "companies",
    operation: "update",
    tenantId: context.tenantId,
  });

  const [company] = await timeDatabaseQuery(
    () =>
      context.db
        .update(companies)
        .set({
          ...buildCompanyValues(input, context.actorId),
          version: sql`${companies.version} + 1`,
        })
        .where(
          and(
            eq(companies.id, context.companyId),
            eq(companies.tenantId, context.tenantId)
          )
        )
        .returning(companySelect),
    {
      operation: "update",
      resource: "companies",
      metadata: {
        companyId: context.companyId,
        tenantId: context.tenantId,
        userId: context.actorId,
      },
    }
  );

  return {
    after: mapCompany(company),
    before,
  };
};

const transitionCompanyStatus = async (
  input: CompanyLifecycleBody,
  status: "active" | "inactive",
  context: {
    actorId: string;
    db: ExecutionDatabaseTransaction;
    tenantId: string;
  }
): Promise<{
  after: Company;
  before: Company;
}> => {
  const before = await requireMutableCompany(
    input.companyId,
    context.tenantId,
    context.db
  );

  if (
    status === "inactive" &&
    (await countActiveChildren(input.companyId, context.tenantId, context.db)) >
      0
  ) {
    throw new ValidationError({
      status: ["Archive active child companies before archiving this company"],
    });
  }

  const [company] = await timeDatabaseQuery(
    () =>
      context.db
        .update(companies)
        .set({
          status,
          updatedAt: new Date(),
          updatedBy: context.actorId,
          version: sql`${companies.version} + 1`,
        })
        .where(
          and(
            eq(companies.id, input.companyId),
            eq(companies.tenantId, context.tenantId)
          )
        )
        .returning(companySelect),
    {
      operation: "update",
      resource: "companies",
      metadata: {
        companyId: input.companyId,
        tenantId: context.tenantId,
        userId: context.actorId,
      },
    }
  );

  return {
    after: mapCompany(company),
    before,
  };
};

const createPipeline = <TInput extends CompanyMutationInput>(
  input: TInput,
  context: CompanyCommandContext<TInput>,
  action: string,
  executeDomainOperation: (
    executionContext: ExecutionMutationContext<TInput>,
    access: ResolvedCompanyCommandAccess
  ) => Promise<ExecutionDomainResult<Company>>,
  options?: {
    companyId?: string;
    requireCompanyGrant?: boolean;
  }
): Promise<Company> => {
  let resolvedAccess: ResolvedCompanyCommandAccess | null = null;
  const pipeline = createExecutionPipeline<TInput, Company>({
    executeDomainOperation: (executionContext) => {
      if (!resolvedAccess) {
        throw new Error("Company command access was not resolved");
      }

      return executeDomainOperation(executionContext, resolvedAccess);
    },
    operationId: context.operationId ?? context.requestId ?? randomUUID(),
    permissionContext: () => {
      if (!resolvedAccess) {
        throw new Error("Company command access was not resolved");
      }

      return createCompanyPermissionContext(
        resolvedAccess,
        action,
        options?.companyId
      );
    },
    permissionRequirement: {
      allOf: [permissionCatalog.companies.write],
    },
    postCommitHooks: context.postCommitHooks as ExecutionPipelineHooks<
      TInput,
      Company
    >["postCommitHooks"],
    requireAuth: async () => {
      resolvedAccess = await resolveCompanyCommandAccess(context);
      return {
        actorId: resolvedAccess.userId,
        actorType: resolvedAccess.actorType,
      };
    },
    requireCompanyGrant: options?.requireCompanyGrant
      ? async (actor, tenant, company) => {
          if (resolvedAccess?.trusted) {
            return;
          }

          await requireCompanyActorAccess({
            companyId: company.companyId,
            tenantId: tenant.tenantId,
            userId: actor.actorId,
          });
        }
      : undefined,
    requirePermission,
    requireTenantMembership: () => Promise.resolve(),
    resolveActiveCompany: options?.companyId
      ? async () => ({
          companyId: options.companyId as string,
          grantId: context.grantId,
        })
      : undefined,
    resolveActiveTenant: () => {
      if (!resolvedAccess) {
        throw new Error("Company command access was not resolved");
      }

      return Promise.resolve({ tenantId: resolvedAccess.tenantId });
    },
    requestId: context.requestId ?? randomUUID(),
    runInTransaction: <T>(
      run: (db: ExecutionDatabaseTransaction) => Promise<T>
    ): Promise<T> => database.transaction(run),
    validateInput: () => undefined,
    writeAuditEvent: persistCompanyAuditEvent,
  });

  return pipeline(input);
};

export const createCompany = (
  input: CreateCompanyBody,
  context: CompanyCommandContext<CreateCompanyBody>
): Promise<Company> => {
  const parsedInput = createCompanyBodySchema.parse(input);

  return createPipeline(
    parsedInput,
    context,
    "companies.create",
    async ({ actor, db, tenant }, access) => {
      if (!db) {
        throw new Error("Company create requires a transaction");
      }

      const company = await insertCompanyRecord(parsedInput, {
        actorId: actor.actorId,
        db,
        tenantId: tenant.tenantId,
      });

      return {
        action: "companies.create",
        after: {
          company,
        },
        before: {},
        channel: access.channel,
        reason: "create company",
        result: company,
        targetDisplayName: company.name,
        targetId: company.id,
        targetType: "company",
      };
    }
  );
};

export const updateCompany = (
  input: UpdateCompanyBody,
  context: CompanyCommandContext<UpdateCompanyBody> & {
    companyId: string;
  }
): Promise<Company> => {
  const parsedInput = updateCompanyBodySchema.parse(input);

  if (!context.companyId) {
    throw new ValidationError({
      companyId: ["Company scope is required for this operation"],
    });
  }

  return createPipeline(
    parsedInput,
    context,
    "companies.update",
    async ({ actor, company, db, tenant }, access) => {
      if (!(company && db)) {
        throw new Error(
          "Company update requires company scope and transaction"
        );
      }

      const updatedCompany = await updateCompanyRecord(parsedInput, {
        actorId: actor.actorId,
        companyId: company.companyId,
        db,
        tenantId: tenant.tenantId,
      });

      return {
        action: "companies.update",
        after: {
          company: updatedCompany.after,
        },
        before: {
          company: updatedCompany.before,
        },
        channel: access.channel,
        metadata: {
          grantId: company.grantId ?? null,
        },
        reason: "update company",
        result: updatedCompany.after,
        targetDisplayName: updatedCompany.after.name,
        targetId: updatedCompany.after.id,
        targetType: "company",
      };
    },
    {
      companyId: context.companyId,
      requireCompanyGrant: true,
    }
  );
};

export const archiveCompany = (
  input: CompanyLifecycleBody,
  context: CompanyCommandContext<CompanyLifecycleBody>
): Promise<Company> => {
  const parsedInput = companyLifecycleBodySchema.parse(input);

  return createPipeline(
    parsedInput,
    context,
    "companies.archive",
    async ({ actor, company, db, tenant }, access) => {
      if (!(company && db)) {
        throw new Error(
          "Company archive requires company scope and transaction"
        );
      }

      const archivedCompany = await transitionCompanyStatus(
        parsedInput,
        "inactive",
        {
          actorId: actor.actorId,
          db,
          tenantId: tenant.tenantId,
        }
      );

      return {
        action: "companies.archive",
        after: {
          company: archivedCompany.after,
        },
        before: {
          company: archivedCompany.before,
        },
        channel: access.channel,
        metadata: {
          grantId: company.grantId ?? null,
        },
        reason: "archive company",
        result: archivedCompany.after,
        targetDisplayName: archivedCompany.after.name,
        targetId: archivedCompany.after.id,
        targetType: "company",
      };
    },
    {
      companyId: parsedInput.companyId,
      requireCompanyGrant: true,
    }
  );
};

export const restoreCompany = (
  input: CompanyLifecycleBody,
  context: CompanyCommandContext<CompanyLifecycleBody>
): Promise<Company> => {
  const parsedInput = companyLifecycleBodySchema.parse(input);

  return createPipeline(
    parsedInput,
    context,
    "companies.restore",
    async ({ actor, company, db, tenant }, access) => {
      if (!(company && db)) {
        throw new Error(
          "Company restore requires company scope and transaction"
        );
      }

      const restoredCompany = await transitionCompanyStatus(
        parsedInput,
        "active",
        {
          actorId: actor.actorId,
          db,
          tenantId: tenant.tenantId,
        }
      );

      return {
        action: "companies.restore",
        after: {
          company: restoredCompany.after,
        },
        before: {
          company: restoredCompany.before,
        },
        channel: access.channel,
        metadata: {
          grantId: company.grantId ?? null,
        },
        reason: "restore company",
        result: restoredCompany.after,
        targetDisplayName: restoredCompany.after.name,
        targetId: restoredCompany.after.id,
        targetType: "company",
      };
    },
    {
      companyId: parsedInput.companyId,
      requireCompanyGrant: true,
    }
  );
};
