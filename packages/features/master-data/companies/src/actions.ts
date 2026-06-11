import "server-only";

import { randomUUID } from "node:crypto";
import {
  writeAuditEvent as persistAuditEvent,
  writeAuditEventInTransaction,
} from "@repo/audit";
import { companies, database, timeDatabaseQuery } from "@repo/database";
import { NotFoundError } from "@repo/errors";
import type {
  ExecutionDatabaseTransaction,
  ExecutionDomainResult,
  ExecutionMutationContext,
  ExecutionPipelineHooks,
} from "@repo/execution";
import { createExecutionPipeline } from "@repo/execution";
import { appendRequestContextMetadata } from "@repo/logger";
import type { PermissionContext } from "@repo/permissions";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import type { CompanyActorScope, TenantActorScope } from "@repo/shared";
import { and, eq } from "drizzle-orm";
import type {
  Company,
  CreateCompanyBody,
  UpdateActiveCompanyBody,
} from "./contract.ts";

type CompanyPostCommitHook<TInput> = (
  operation: ExecutionDomainResult<Company>,
  context: ExecutionMutationContext<TInput>
) => Promise<void> | void;

const persistCompanyAuditEvent = (
  event: Parameters<typeof persistAuditEvent>[0],
  db?: ExecutionDatabaseTransaction
): ReturnType<typeof persistAuditEvent> => {
  if (db) {
    return writeAuditEventInTransaction(db, event);
  }

  return persistAuditEvent(event);
};

type CompanyCreateContext = TenantActorScope & {
  db?: ExecutionDatabaseTransaction;
  grantedPermissions: string[];
  postCommitHooks?: CompanyPostCommitHook<CreateCompanyBody>[];
  operationId?: string;
  requestId?: string;
};

type CompanyUpdateContext = CompanyActorScope & {
  db?: ExecutionDatabaseTransaction;
  grantId: string;
  grantedPermissions: string[];
  postCommitHooks?: CompanyPostCommitHook<UpdateActiveCompanyBody>[];
  operationId?: string;
  requestId?: string;
};

type CompanyByIdUpdateContext = TenantActorScope & {
  companyId: string;
  db?: ExecutionDatabaseTransaction;
  grantedPermissions: string[];
  postCommitHooks?: CompanyPostCommitHook<UpdateActiveCompanyBody>[];
  operationId?: string;
  requestId?: string;
};

const mapCompany = (row: {
  code: string;
  id: string;
  name: string;
}): Company => ({
  code: row.code,
  id: row.id,
  name: row.name,
});

const createCompanyPermissionContext = (
  context:
    | CompanyCreateContext
    | CompanyUpdateContext
    | CompanyByIdUpdateContext,
  action: string
): PermissionContext => ({
  action,
  actorId: context.userId,
  companyId: "companyId" in context ? context.companyId : undefined,
  grantedPermissions: context.grantedPermissions,
  resource: "companies",
  tenantId: context.tenantId,
});

const insertCompanyRecord = async (
  input: CreateCompanyBody,
  context: CompanyCreateContext
): Promise<Company> => {
  const db = context.db ?? database;

  appendRequestContextMetadata({
    companyCode: input.code,
    feature: "companies",
    operation: "create",
    tenantId: context.tenantId,
  });

  const [company] = await timeDatabaseQuery(
    () =>
      db
        .insert(companies)
        .values({
          code: input.code.trim(),
          name: input.name.trim(),
          tenantId: context.tenantId,
        })
        .returning({
          code: companies.code,
          id: companies.id,
          name: companies.name,
        }),
    {
      operation: "insert",
      resource: "companies",
      metadata: {
        tenantId: context.tenantId,
        userId: context.userId,
      },
    }
  );

  return mapCompany(company);
};

const updateCompanyRecord = async (
  input: UpdateActiveCompanyBody,
  context: CompanyUpdateContext | CompanyByIdUpdateContext
): Promise<{
  after: Company;
  before: Company;
}> => {
  const db = context.db ?? database;

  appendRequestContextMetadata({
    companyCode: input.code,
    companyId: context.companyId,
    feature: "companies",
    operation: "update",
    tenantId: context.tenantId,
  });

  const [existingCompany] = await timeDatabaseQuery(
    () =>
      db
        .select({
          code: companies.code,
          id: companies.id,
          name: companies.name,
        })
        .from(companies)
        .where(
          and(
            eq(companies.id, context.companyId),
            eq(companies.tenantId, context.tenantId)
          )
        )
        .limit(1),
    {
      operation: "select",
      resource: "companies",
      metadata: {
        companyId: context.companyId,
        tenantId: context.tenantId,
        userId: context.userId,
      },
    }
  );

  if (!existingCompany) {
    throw new NotFoundError("Company");
  }

  const [company] = await timeDatabaseQuery(
    () =>
      db
        .update(companies)
        .set({
          code: input.code.trim(),
          name: input.name.trim(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(companies.id, context.companyId),
            eq(companies.tenantId, context.tenantId)
          )
        )
        .returning({
          code: companies.code,
          id: companies.id,
          name: companies.name,
        }),
    {
      operation: "update",
      resource: "companies",
      metadata: {
        companyId: context.companyId,
        tenantId: context.tenantId,
        userId: context.userId,
      },
    }
  );

  if (!company) {
    throw new NotFoundError("Company");
  }

  return {
    after: mapCompany(company),
    before: mapCompany(existingCompany),
  };
};

export const createCompany = (
  input: CreateCompanyBody,
  context: CompanyCreateContext
): Promise<Company> => {
  const pipeline = createExecutionPipeline<CreateCompanyBody, Company>({
    executeDomainOperation: async ({
      db,
      input: executionInput,
      actor,
      tenant,
    }: ExecutionMutationContext<CreateCompanyBody>) => {
      const company = await insertCompanyRecord(executionInput, {
        ...context,
        db,
        tenantId: tenant.tenantId,
        userId: actor.actorId,
      });

      return {
        action: "companies.create",
        after: {
          company,
        },
        before: {},
        reason: "create company",
        result: company,
        targetId: company.id,
        targetType: "company",
      };
    },
    permissionContext: () =>
      createCompanyPermissionContext(context, "companies.create"),
    permissionRequirement: {
      allOf: [permissionCatalog.companies.write],
    },
    runInTransaction: <T>(
      run: (db: ExecutionDatabaseTransaction) => Promise<T>
    ): Promise<T> => database.transaction(run),
    postCommitHooks: context.postCommitHooks as ExecutionPipelineHooks<
      CreateCompanyBody,
      Company
    >["postCommitHooks"],
    operationId: context.operationId ?? context.requestId ?? randomUUID(),
    requireAuth: async () => ({ actorId: context.userId }),
    requirePermission,
    requireTenantMembership: async () => undefined,
    resolveActiveTenant: async () => ({ tenantId: context.tenantId }),
    requestId: context.requestId ?? randomUUID(),
    validateInput: async () => undefined,
    writeAuditEvent: persistCompanyAuditEvent,
  });

  return pipeline(input);
};

export const updateCompany = (
  input: UpdateActiveCompanyBody,
  context: CompanyUpdateContext
): Promise<Company> => {
  const pipeline = createExecutionPipeline<UpdateActiveCompanyBody, Company>({
    executeDomainOperation: async ({
      db,
      input: executionInput,
      actor,
      company,
      tenant,
    }: ExecutionMutationContext<UpdateActiveCompanyBody>) => {
      if (!company) {
        throw new Error("Company scope is required for this operation");
      }

      const updatedCompany = await updateCompanyRecord(executionInput, {
        ...context,
        companyId: company.companyId,
        db,
        tenantId: tenant.tenantId,
        userId: actor.actorId,
      });

      return {
        action: "companies.update",
        after: {
          company: updatedCompany.after,
        },
        before: {
          company: updatedCompany.before,
        },
        metadata: {
          grantId: company.grantId ?? null,
        },
        reason: "update active company",
        result: updatedCompany.after,
        targetId: updatedCompany.after.id,
        targetType: "company",
      };
    },
    permissionContext: (
      _actor: {
        actorId: string;
      },
      tenant: {
        tenantId: string;
      },
      company: {
        companyId: string;
        grantId?: string | null;
      } | null
    ) =>
      createCompanyPermissionContext(
        {
          ...context,
          companyId: company?.companyId ?? context.companyId,
          tenantId: tenant.tenantId,
        },
        "companies.update"
      ),
    permissionRequirement: {
      allOf: [permissionCatalog.companies.write],
    },
    runInTransaction: <T>(
      run: (db: ExecutionDatabaseTransaction) => Promise<T>
    ): Promise<T> => database.transaction(run),
    postCommitHooks: context.postCommitHooks as ExecutionPipelineHooks<
      UpdateActiveCompanyBody,
      Company
    >["postCommitHooks"],
    operationId: context.operationId ?? context.requestId ?? randomUUID(),
    requireAuth: async () => ({ actorId: context.userId }),
    requireCompanyGrant: async () => undefined,
    requirePermission,
    requireTenantMembership: async () => undefined,
    resolveActiveCompany: async () => ({
      companyId: context.companyId,
      grantId: context.grantId,
    }),
    resolveActiveTenant: async () => ({ tenantId: context.tenantId }),
    requestId: context.requestId ?? randomUUID(),
    validateInput: async () => undefined,
    writeAuditEvent: persistCompanyAuditEvent,
  });

  return pipeline(input);
};

export const updateCompanyById = (
  input: UpdateActiveCompanyBody,
  context: CompanyByIdUpdateContext
): Promise<Company> => {
  const pipeline = createExecutionPipeline<UpdateActiveCompanyBody, Company>({
    executeDomainOperation: async ({
      db,
      input: executionInput,
      actor,
      tenant,
    }: ExecutionMutationContext<UpdateActiveCompanyBody>) => {
      const updatedCompany = await updateCompanyRecord(executionInput, {
        ...context,
        db,
        tenantId: tenant.tenantId,
        userId: actor.actorId,
      });

      return {
        action: "companies.update",
        after: {
          company: updatedCompany.after,
        },
        before: {
          company: updatedCompany.before,
        },
        reason: "update company",
        result: updatedCompany.after,
        targetId: updatedCompany.after.id,
        targetType: "company",
      };
    },
    permissionContext: () =>
      createCompanyPermissionContext(context, "companies.update"),
    permissionRequirement: {
      allOf: [permissionCatalog.companies.write],
    },
    runInTransaction: <T>(
      run: (db: ExecutionDatabaseTransaction) => Promise<T>
    ): Promise<T> => database.transaction(run),
    postCommitHooks: context.postCommitHooks as ExecutionPipelineHooks<
      UpdateActiveCompanyBody,
      Company
    >["postCommitHooks"],
    operationId: context.operationId ?? context.requestId ?? randomUUID(),
    requireAuth: async () => ({ actorId: context.userId }),
    requirePermission,
    requireTenantMembership: async () => undefined,
    resolveActiveTenant: async () => ({ tenantId: context.tenantId }),
    requestId: context.requestId ?? randomUUID(),
    validateInput: async () => undefined,
    writeAuditEvent: persistCompanyAuditEvent,
  });

  return pipeline(input);
};
