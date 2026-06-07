import "server-only";

import type {
  AuditActorType,
  AuditChange,
  AuditChannel,
  AuditEventInput,
  AuditOutcome,
} from "@repo/audit";
import type { database as databaseClient } from "@repo/database";
import { ConfigurationError } from "@repo/errors";
import type {
  PermissionContext,
  PermissionRequirement,
} from "@repo/permissions";

export type ExecutionActor = {
  actorId: string;
  actorType?: AuditActorType;
};

export type ExecutionTenant = {
  tenantId: string;
};

export type ExecutionCompany = {
  companyId: string;
  grantId?: string | null;
};

export type ExecutionDatabaseTransaction = Parameters<
  Parameters<typeof databaseClient.transaction>[0]
>[0];

export type ExecutionMutationContext<TInput> = {
  input: TInput;
  actor: ExecutionActor;
  operationId?: string;
  tenant: ExecutionTenant;
  company?: ExecutionCompany;
  requestId: string;
  db?: ExecutionDatabaseTransaction;
};

export type ExecutionDomainResult<TResult> = {
  result: TResult;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  diff?: readonly AuditChange[];
  module?: string;
  surface?: string;
  route?: string;
  subjectType?: string;
  subjectId?: string;
  summary?: string;
  outcome?: AuditOutcome;
  targetType: string;
  targetId: string;
  targetDisplayName?: string;
  action: string;
  reason?: string;
  policyReference?: string;
  approvalId?: string;
  channel?: AuditChannel;
  operationId?: string;
  occurredAt?: Date;
  metadata?: Record<string, unknown>;
};

export type ExecutionPipelineHooks<TInput, TResult> = {
  requireAuth: () => Promise<ExecutionActor>;
  resolveActiveTenant: (actor: ExecutionActor) => Promise<ExecutionTenant>;
  requireTenantMembership: (
    actor: ExecutionActor,
    tenant: ExecutionTenant
  ) => Promise<void>;
  resolveActiveCompany?: (
    actor: ExecutionActor,
    tenant: ExecutionTenant
  ) => Promise<ExecutionCompany | null>;
  requireCompanyGrant?: (
    actor: ExecutionActor,
    tenant: ExecutionTenant,
    company: ExecutionCompany
  ) => Promise<void>;
  validateInput: (input: TInput) => Promise<void> | void;
  permissionContext: (
    actor: ExecutionActor,
    tenant: ExecutionTenant,
    company: ExecutionCompany | null
  ) => PermissionContext;
  permissionRequirement: PermissionRequirement;
  requirePermission: (
    context: PermissionContext,
    requirement: PermissionRequirement
  ) => Promise<void> | void;
  executeDomainOperation: (
    context: ExecutionMutationContext<TInput>
  ) => Promise<ExecutionDomainResult<TResult>>;
  postCommitHooks?: Array<
    (
      operation: ExecutionDomainResult<TResult>,
      context: ExecutionMutationContext<TInput>
    ) => Promise<void> | void
  >;
  runInTransaction?: <T>(
    run: (db: ExecutionDatabaseTransaction) => Promise<T>
  ) => Promise<T>;
  writeAuditEvent: (
    event: AuditEventInput,
    db?: ExecutionDatabaseTransaction
  ) => Promise<unknown> | unknown;
  requestId: string;
  operationId?: string;
};

export type ExecutionPostCommitHook<TInput, TResult> = (
  operation: ExecutionDomainResult<TResult>,
  context: ExecutionMutationContext<TInput>
) => Promise<void> | void;

const resolveAuditModule = (
  action: string,
  module: string | undefined
): string | undefined => module?.trim() || action.split(".")[0] || undefined;

const resolveActorRole = (
  metadata: Record<string, unknown> | undefined
): string | undefined => {
  const role = metadata?.actorRole;

  return typeof role === "string" && role.trim().length > 0
    ? role.trim()
    : undefined;
};

export const createExecutionPipeline =
  <TInput, TResult>(hooks: ExecutionPipelineHooks<TInput, TResult>) =>
  async (input: TInput): Promise<TResult> => {
    const actor = await hooks.requireAuth();
    const tenant = await hooks.resolveActiveTenant(actor);
    await hooks.requireTenantMembership(actor, tenant);

    const company = hooks.resolveActiveCompany
      ? await hooks.resolveActiveCompany(actor, tenant)
      : null;

    if (company && hooks.requireCompanyGrant) {
      await hooks.requireCompanyGrant(actor, tenant, company);
    }

    await hooks.validateInput(input);

    const permissionContext = hooks.permissionContext(actor, tenant, company);

    await hooks.requirePermission(
      permissionContext,
      hooks.permissionRequirement
    );

    const writeAuditEvent = async (
      operation: ExecutionDomainResult<TResult>,
      db?: ExecutionDatabaseTransaction
    ): Promise<void> => {
      await hooks.writeAuditEvent(
        {
          tenantId: tenant.tenantId,
          companyId: company?.companyId ?? null,
          grantId: company?.grantId ?? null,
          actorId: actor.actorId,
          actorType: actor.actorType ?? "user",
          actorRole: resolveActorRole(permissionContext.metadata),
          action: operation.action,
          summary: operation.summary,
          outcome: operation.outcome,
          module: resolveAuditModule(operation.action, operation.module),
          surface: operation.surface,
          route: operation.route,
          subjectType: operation.subjectType,
          subjectId: operation.subjectId,
          targetType: operation.targetType,
          targetId: operation.targetId,
          targetDisplayName: operation.targetDisplayName,
          reason: operation.reason,
          policyReference: operation.policyReference,
          approvalId: operation.approvalId,
          channel: operation.channel,
          requestId: hooks.requestId,
          operationId:
            operation.operationId ?? hooks.operationId ?? hooks.requestId,
          before: operation.before ?? {},
          after: operation.after ?? {},
          diff: operation.diff,
          metadata: operation.metadata ?? null,
          occurredAt: operation.occurredAt,
        },
        db
      );
    };

    const executeOperation = async (
      db?: ExecutionDatabaseTransaction
    ): Promise<ExecutionDomainResult<TResult>> => {
      const operation = await hooks.executeDomainOperation({
        db,
        input,
        actor,
        operationId: hooks.operationId ?? hooks.requestId,
        tenant,
        company: company ?? undefined,
        requestId: hooks.requestId,
      });

      if (!operation.action) {
        throw new ConfigurationError("Audit action is required");
      }

      await writeAuditEvent(operation, db);

      return operation;
    };

    const operation = hooks.runInTransaction
      ? await hooks.runInTransaction(async (db) => executeOperation(db))
      : await executeOperation();

    if (!operation.action) {
      throw new ConfigurationError("Audit action is required");
    }

    if (hooks.postCommitHooks && hooks.postCommitHooks.length > 0) {
      await Promise.allSettled(
        hooks.postCommitHooks.map(async (hook) =>
          hook(operation, {
            input,
            actor,
            operationId: hooks.operationId ?? hooks.requestId,
            tenant,
            company: company ?? undefined,
            requestId: hooks.requestId,
          })
        )
      );
    }

    return operation.result;
  };
