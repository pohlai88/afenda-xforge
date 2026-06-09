import { randomUUID } from "node:crypto";
import type {
  HrOrgAuditEvent,
  HrOrgMutationResult,
  HrOrgRepositoryEntityType,
  HrOrgWriteContext,
} from "./contracts/index.ts";
import { hrOrgWriteContextSchema } from "./contracts/index.ts";
import { canWriteHrOrg } from "./policy.ts";

export type HrOrgMutationContext = HrOrgWriteContext;

export type HrOrgAuditEventInput = Omit<
  HrOrgAuditEvent,
  "createdAt" | "id" | "tenantId" | "companyId" | "actorId"
> & {
  actorId?: string | null;
  companyId?: string | null;
  createdAt?: Date;
  id?: string;
  tenantId?: string | null;
};

export const denyHrOrgMutation = (): HrOrgMutationResult => ({
  ok: false,
  error: "Write access denied for organization structure",
});

export const normalizeHrOrgMutationActorId = (
  context?: HrOrgMutationContext
): string | null => context?.actorId ?? null;

export const requireHrOrgMutationAccess = (
  context?: HrOrgMutationContext
): HrOrgMutationResult | null =>
  canWriteHrOrg(context) ? null : denyHrOrgMutation();

export const buildHrOrgAuditMetadata = (
  metadata?: Record<string, unknown>,
  context?: HrOrgMutationContext
): Record<string, unknown> => ({
  ...metadata,
  surface: "organizational-chart-hierarchy",
  ...(context?.actorId ? { actorId: context.actorId } : {}),
  ...(context?.companyId ? { companyId: context.companyId } : {}),
  ...(context?.tenantId ? { tenantId: context.tenantId } : {}),
});

export const createHrOrgMutationAuditEvent = (
  input: HrOrgAuditEventInput,
  context?: HrOrgMutationContext
): HrOrgAuditEvent => {
  const normalizedContext = context
    ? hrOrgWriteContextSchema.parse(context)
    : undefined;

  return {
    id: input.id ?? randomUUID(),
    tenantId: input.tenantId ?? normalizedContext?.tenantId ?? null,
    companyId: input.companyId ?? normalizedContext?.companyId ?? null,
    actorId: input.actorId ?? normalizeHrOrgMutationActorId(normalizedContext),
    action: input.action,
    entityType: input.entityType as HrOrgRepositoryEntityType,
    entityId: input.entityId,
    summary: input.summary,
    reason: input.reason ?? null,
    metadata: buildHrOrgAuditMetadata(input.metadata, normalizedContext),
    createdAt: input.createdAt ?? new Date(),
  };
};
