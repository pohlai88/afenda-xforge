import "server-only";

import type {
  OffboardingAuditEvent,
  OffboardingMutationResult,
  OffboardingRepositoryEntityType,
} from "../contracts/index.ts";
import { requireOffboardingExitManagementWriteAccess } from "../policy.ts";
import { createOffboardingRepositoryId } from "../repository.ts";

export type OffboardingExitManagementExecutionContext = Readonly<{
  actorId?: string;
  canWrite?: boolean;
  canViewSensitive?: boolean;
  companyId?: string;
  requestId?: string;
  tenantId?: string;
  grantedCapabilities?: readonly string[];
}>;

export type OffboardingAuditEventInput = {
  action: string;
  entityType: OffboardingRepositoryEntityType;
  entityId: string;
  summary?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown>;
  sensitive?: boolean;
};

export const denyOffboardingMutation = (): OffboardingMutationResult => ({
  code: "forbidden",
  ok: false,
  error: "Write access denied for offboarding",
  targetId: "",
});

export const denyOffboardingMutationForScope =
  (): OffboardingMutationResult => ({
    code: "untrusted_scope",
    ok: false,
    error: "tenantId is required for offboarding",
    targetId: "",
  });

export const normalizeOffboardingMutationActorId = (
  context?: OffboardingExitManagementExecutionContext
): string => context?.actorId?.trim() || "system";

export const requireOffboardingMutationAccess = (
  context?: OffboardingExitManagementExecutionContext
): OffboardingMutationResult | null => {
  if (!context) {
    return denyOffboardingMutation();
  }

  if (!context.tenantId?.trim()) {
    return denyOffboardingMutationForScope();
  }

  const accessDecision = requireOffboardingExitManagementWriteAccess(context);
  return accessDecision.ok ? null : accessDecision;
};

export const buildOffboardingAuditMetadata = (
  input: Record<string, unknown>
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );

export const createOffboardingAuditEvent = (
  input: OffboardingAuditEventInput,
  context?: OffboardingExitManagementExecutionContext
): OffboardingAuditEvent => ({
  id: createOffboardingRepositoryId(),
  companyId: context?.companyId?.trim() || null,
  tenantId:
    context?.tenantId?.trim() ||
    (() => {
      throw new Error("tenantId is required for offboarding audit events");
    })(),
  actorId: normalizeOffboardingMutationActorId(context),
  action: input.action,
  entityType: input.entityType,
  entityId: input.entityId,
  summary: input.summary?.trim() || null,
  reason: input.reason?.trim() || null,
  metadata: buildOffboardingAuditMetadata(input.metadata ?? {}),
  sensitive: input.sensitive ?? false,
  createdAt: new Date(),
});
