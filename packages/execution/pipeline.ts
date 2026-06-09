import "server-only";

import type {
  Audit7W1HActorType,
  Audit7W1HChange,
  Audit7W1HChannel,
  Audit7W1HEventInput,
  Audit7W1HOutcome,
} from "@repo/audit";
import type { database as databaseClient } from "@repo/database";
import { ConfigurationError } from "@repo/errors";
import { createPackageLogger, logServerEvent } from "@repo/logger";
import type {
  PermissionContext,
  PermissionRequirement,
} from "@repo/permissions";

const executionLogger = createPackageLogger("execution");

export type ExecutionActor = {
  actorId: string;
  actorType?: Audit7W1HActorType;
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
  diff?: readonly Audit7W1HChange[];
  module?: string;
  surface?: string;
  route?: string;
  subjectType?: string;
  subjectId?: string;
  summary?: string;
  outcome?: Audit7W1HOutcome;
  targetType: string;
  targetId: string;
  targetDisplayName?: string;
  action: string;
  reason?: string;
  policyReference?: string;
  approvalId?: string;
  channel?: Audit7W1HChannel;
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
    event: Audit7W1HEventInput,
    db?: ExecutionDatabaseTransaction
  ) => Promise<unknown> | unknown;
  requestId: string;
  operationId?: string;
};

export type ExecutionPostCommitHook<TInput, TResult> = (
  operation: ExecutionDomainResult<TResult>,
  context: ExecutionMutationContext<TInput>
) => Promise<void> | void;

export type QueryExecutionContext<TInput> = {
  input: TInput;
  actor: ExecutionActor;
  tenant: ExecutionTenant;
  company?: ExecutionCompany;
};

export type QueryPipelineHooks<TInput, TResult> = {
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
  executeQuery: (context: QueryExecutionContext<TInput>) => Promise<TResult>;
  auditQueryEvent?: (
    result: TResult,
    context: QueryExecutionContext<TInput>,
    permissionContext: PermissionContext
  ) => Audit7W1HEventInput | null;
  writeAuditEvent?: (event: Audit7W1HEventInput) => Promise<unknown> | unknown;
};

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

const resolveAuditEventId = (value: unknown): string | undefined => {
  if (typeof value !== "object" || value === null) {
    return;
  }

  const auditEvent = value as { id?: unknown };

  return typeof auditEvent.id === "string" && auditEvent.id.trim().length > 0
    ? auditEvent.id.trim()
    : undefined;
};

type Audit7W1HEventReference = {
  action: string;
  actorId: string;
  auditEventId: string;
  channel?: Audit7W1HChannel;
  companyId?: string;
  operationId: string;
  outcome?: Audit7W1HOutcome;
  requestId: string;
  route?: string;
  surface?: string;
  targetId: string;
  targetType: string;
  tenantId: string;
};

type ExecutionPipelineContext<TInput, TResult> = {
  actor: ExecutionActor;
  company: ExecutionCompany | null;
  hooks: ExecutionPipelineHooks<TInput, TResult>;
  input: TInput;
  permissionContext: PermissionContext;
  tenant: ExecutionTenant;
};

type CompanyResolutionHooks = {
  resolveActiveCompany?: (
    actor: ExecutionActor,
    tenant: ExecutionTenant
  ) => Promise<ExecutionCompany | null>;
  requireCompanyGrant?: (
    actor: ExecutionActor,
    tenant: ExecutionTenant,
    company: ExecutionCompany
  ) => Promise<void>;
};

const resolveExecutionCompany = async (
  hooks: CompanyResolutionHooks,
  actor: ExecutionActor,
  tenant: ExecutionTenant
): Promise<ExecutionCompany | null> => {
  const company = hooks.resolveActiveCompany
    ? await hooks.resolveActiveCompany(actor, tenant)
    : null;

  if (company && hooks.requireCompanyGrant) {
    await hooks.requireCompanyGrant(actor, tenant, company);
  }

  return company;
};

const buildAuditEventInput = <TInput, TResult>(
  context: ExecutionPipelineContext<TInput, TResult> & {
    operation: ExecutionDomainResult<TResult>;
  }
): Audit7W1HEventInput => ({
  action: context.operation.action,
  actorId: context.actor.actorId,
  actorRole: resolveActorRole(context.permissionContext.metadata),
  actorType: context.actor.actorType ?? "user",
  approvalId: context.operation.approvalId,
  after: context.operation.after ?? {},
  before: context.operation.before ?? {},
  channel: context.operation.channel,
  companyId: context.company?.companyId ?? null,
  diff: context.operation.diff,
  grantId: context.company?.grantId ?? null,
  metadata: context.operation.metadata ?? null,
  module: resolveAuditModule(
    context.operation.action,
    context.operation.module
  ),
  occurredAt: context.operation.occurredAt,
  operationId:
    context.operation.operationId ??
    context.hooks.operationId ??
    context.hooks.requestId,
  reason: context.operation.reason,
  requestId: context.hooks.requestId,
  route: context.operation.route,
  subjectId: context.operation.subjectId,
  subjectType: context.operation.subjectType,
  summary: context.operation.summary,
  targetDisplayName: context.operation.targetDisplayName,
  targetId: context.operation.targetId,
  targetType: context.operation.targetType,
  tenantId: context.tenant.tenantId,
});

const writeAuditEventAndReference = async <TInput, TResult>(
  context: ExecutionPipelineContext<TInput, TResult> & {
    db?: ExecutionDatabaseTransaction;
    operation: ExecutionDomainResult<TResult>;
  }
): Promise<Audit7W1HEventReference | undefined> => {
  const auditEvent = await context.hooks.writeAuditEvent(
    buildAuditEventInput(context),
    context.db
  );
  const auditEventId = resolveAuditEventId(auditEvent);

  if (!auditEventId) {
    return;
  }

  return {
    action: context.operation.action,
    actorId: context.actor.actorId,
    auditEventId,
    channel: context.operation.channel,
    ...(context.company?.companyId
      ? {
          companyId: context.company.companyId,
        }
      : {}),
    operationId:
      context.operation.operationId ??
      context.hooks.operationId ??
      context.hooks.requestId,
    outcome: context.operation.outcome,
    requestId: context.hooks.requestId,
    route: context.operation.route,
    surface: context.operation.surface,
    targetId: context.operation.targetId,
    targetType: context.operation.targetType,
    tenantId: context.tenant.tenantId,
  };
};

const executePipelineOperation = async <TInput, TResult>(
  context: ExecutionPipelineContext<TInput, TResult> & {
    db?: ExecutionDatabaseTransaction;
  }
): Promise<{
  auditEventReference: Audit7W1HEventReference | undefined;
  operation: ExecutionDomainResult<TResult>;
}> => {
  const operation = await context.hooks.executeDomainOperation({
    db: context.db,
    input: context.input,
    actor: context.actor,
    company: context.company ?? undefined,
    operationId: context.hooks.operationId ?? context.hooks.requestId,
    requestId: context.hooks.requestId,
    tenant: context.tenant,
  });

  if (!operation.action) {
    throw new ConfigurationError("Audit action is required");
  }

  return {
    auditEventReference: await writeAuditEventAndReference({
      ...context,
      operation,
    }),
    operation,
  };
};

const logAuditEventReference = (
  auditEventReference: Audit7W1HEventReference | undefined
): void => {
  if (!auditEventReference) {
    return;
  }

  logServerEvent(
    executionLogger,
    "info",
    "Audit event written.",
    {
      module: "execution",
      operation: "audit.written",
      actorId: auditEventReference.actorId,
      auditEventId: auditEventReference.auditEventId,
      ...(auditEventReference.companyId
        ? { companyId: auditEventReference.companyId }
        : {}),
      operationId: auditEventReference.operationId,
      requestId: auditEventReference.requestId,
      tenantId: auditEventReference.tenantId,
    },
    {
      action: auditEventReference.action,
      ...(auditEventReference.channel
        ? { channel: auditEventReference.channel }
        : {}),
      ...(auditEventReference.outcome
        ? { outcome: auditEventReference.outcome }
        : {}),
      ...(auditEventReference.route
        ? { route: auditEventReference.route }
        : {}),
      ...(auditEventReference.surface
        ? { surface: auditEventReference.surface }
        : {}),
      targetId: auditEventReference.targetId,
      targetType: auditEventReference.targetType,
    }
  );
};

const runExecutionPostCommitHooks = async <TInput, TResult>(
  context: ExecutionPipelineContext<TInput, TResult> & {
    operation: ExecutionDomainResult<TResult>;
  }
): Promise<void> => {
  if (
    !(context.hooks.postCommitHooks && context.hooks.postCommitHooks.length > 0)
  ) {
    return;
  }

  await Promise.allSettled(
    context.hooks.postCommitHooks.map(async (hook) =>
      hook(context.operation, {
        actor: context.actor,
        company: context.company ?? undefined,
        input: context.input,
        operationId: context.hooks.operationId ?? context.hooks.requestId,
        requestId: context.hooks.requestId,
        tenant: context.tenant,
      })
    )
  );
};

export const createExecutionPipeline =
  <TInput, TResult>(hooks: ExecutionPipelineHooks<TInput, TResult>) =>
  async (input: TInput): Promise<TResult> => {
    const actor = await hooks.requireAuth();
    const tenant = await hooks.resolveActiveTenant(actor);
    await hooks.requireTenantMembership(actor, tenant);
    await hooks.validateInput(input);

    const company = await resolveExecutionCompany(hooks, actor, tenant);
    const permissionContext = hooks.permissionContext(actor, tenant, company);

    await hooks.requirePermission(
      permissionContext,
      hooks.permissionRequirement
    );

    const executionContext: ExecutionPipelineContext<TInput, TResult> = {
      actor,
      company,
      hooks,
      input,
      permissionContext,
      tenant,
    };

    const executionResult = hooks.runInTransaction
      ? await hooks.runInTransaction(async (db) =>
          executePipelineOperation({
            ...executionContext,
            db,
          })
        )
      : await executePipelineOperation(executionContext);

    logAuditEventReference(executionResult.auditEventReference);

    await runExecutionPostCommitHooks({
      ...executionContext,
      operation: executionResult.operation,
    });

    return executionResult.operation.result;
  };

export const createQueryPipeline =
  <TInput, TResult>(hooks: QueryPipelineHooks<TInput, TResult>) =>
  async (input: TInput): Promise<TResult> => {
    const actor = await hooks.requireAuth();
    const tenant = await hooks.resolveActiveTenant(actor);
    await hooks.requireTenantMembership(actor, tenant);
    await hooks.validateInput(input);

    const company = await resolveExecutionCompany(hooks, actor, tenant);
    const permissionContext = hooks.permissionContext(actor, tenant, company);

    await hooks.requirePermission(
      permissionContext,
      hooks.permissionRequirement
    );

    const queryContext = {
      actor,
      company: company ?? undefined,
      input,
      tenant,
    };
    const result = await hooks.executeQuery(queryContext);
    const auditEvent = hooks.auditQueryEvent?.(
      result,
      queryContext,
      permissionContext
    );

    if (auditEvent && hooks.writeAuditEvent) {
      await hooks.writeAuditEvent(auditEvent);
    }

    return result;
  };
