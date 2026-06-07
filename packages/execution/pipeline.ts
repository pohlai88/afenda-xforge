import "server-only";

import type { AuditEventInput } from "@repo/audit";
import { ConfigurationError } from "@repo/errors";
import type {
  PermissionContext,
  PermissionRequirement,
} from "@repo/permissions";

export type ExecutionActor = {
  actorId: string;
};

export type ExecutionTenant = {
  tenantId: string;
};

export type ExecutionCompany = {
  companyId: string;
  grantId?: string | null;
};

export type ExecutionMutationContext<TInput> = {
  input: TInput;
  actor: ExecutionActor;
  tenant: ExecutionTenant;
  company?: ExecutionCompany;
  requestId: string;
};

export type ExecutionDomainResult<TResult> = {
  result: TResult;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  targetType: string;
  targetId: string;
  action: string;
  reason?: string;
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
  writeAuditEvent: (event: AuditEventInput) => Promise<unknown> | unknown;
  requestId: string;
};

export type ExecutionPostCommitHook<TInput, TResult> = (
  operation: ExecutionDomainResult<TResult>,
  context: ExecutionMutationContext<TInput>
) => Promise<void> | void;

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

    const operation = await hooks.executeDomainOperation({
      input,
      actor,
      tenant,
      company: company ?? undefined,
      requestId: hooks.requestId,
    });

    if (!operation.action) {
      throw new ConfigurationError("Audit action is required");
    }

    await hooks.writeAuditEvent({
      tenantId: tenant.tenantId,
      companyId: company?.companyId ?? null,
      grantId: company?.grantId ?? null,
      actorId: actor.actorId,
      action: operation.action,
      targetType: operation.targetType,
      targetId: operation.targetId,
      before: operation.before ?? {},
      after: operation.after ?? {},
      reason: operation.reason ?? "mutation",
      requestId: hooks.requestId,
      metadata: operation.metadata ?? null,
    });

    if (hooks.postCommitHooks && hooks.postCommitHooks.length > 0) {
      await Promise.allSettled(
        hooks.postCommitHooks.map(async (hook) =>
          hook(operation, {
            input,
            actor,
            tenant,
            company: company ?? undefined,
            requestId: hooks.requestId,
          })
        )
      );
    }

    return operation.result;
  };
