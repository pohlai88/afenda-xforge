import "server-only";

import type {
  ComplianceAuditEvent,
  ComplianceMutationResult,
  CompliancePolicyCapability,
} from "./contracts/index.ts";
import { complianceEvidenceSensitiveFields } from "./contracts/index.ts";
import { requireComplianceWriteAccess } from "./policy.ts";
import {
  createComplianceRecordId,
  mutateComplianceRepository,
} from "./repository.ts";

export type ComplianceMutationContext = {
  actorId?: string;
  companyId?: string;
  organizationId?: string;
  requestId?: string;
  tenantId?: string;
  canWrite?: boolean;
  canViewSensitive?: boolean;
  grantedCapabilities?: CompliancePolicyCapability[];
};

export type ComplianceAuditEventInput = Omit<
  ComplianceAuditEvent,
  "id" | "createdAt"
>;

export const denyComplianceMutation = (): ComplianceMutationResult => ({
  ok: false,
  error: "Write access denied for compliance",
});

export const normalizeComplianceMutationActorId = (
  context?: ComplianceMutationContext
): string => context?.actorId?.trim() || "system";

export const requireComplianceMutationAccess = (
  context?: ComplianceMutationContext
): ComplianceMutationResult | null => {
  if (!context) {
    return denyComplianceMutation();
  }

  const accessDecision = requireComplianceWriteAccess(context);
  if (!accessDecision.ok) {
    return accessDecision;
  }

  return null;
};

export const buildComplianceAuditMetadata = (
  input: Record<string, unknown>
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );

const redactComplianceAuditPayload = (value: unknown): unknown => {
  if (value instanceof Date || value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(redactComplianceAuditPayload);
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [
      key,
      complianceEvidenceSensitiveFields.includes(
        key as (typeof complianceEvidenceSensitiveFields)[number]
      )
        ? null
        : redactComplianceAuditPayload(entryValue),
    ])
  );
};

export const createComplianceMutationAuditEvent = (
  event: ComplianceAuditEventInput
): ComplianceAuditEvent => ({
  ...event,
  before: redactComplianceAuditPayload(event.before),
  after: redactComplianceAuditPayload(event.after),
  id: createComplianceRecordId(),
  createdAt: new Date(),
});

export const recordComplianceMutationAuditEvent = (
  event: ComplianceAuditEventInput,
  context?: ComplianceMutationContext
): Promise<void> => {
  const auditEvent = createComplianceMutationAuditEvent(event);

  return mutateComplianceRepository((draft) => {
    draft.auditEvents.push(auditEvent);
  }, context).then(() => undefined);
};
