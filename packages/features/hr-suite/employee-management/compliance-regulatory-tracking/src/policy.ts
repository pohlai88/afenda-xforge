import type {
  ComplianceMutationResult,
  CompliancePolicyContext,
  ComplianceSensitiveFieldPolicy,
} from "./contracts/index.ts";
import {
  complianceEvidenceSensitiveFieldPolicy,
  compliancePolicyContextSchema,
} from "./contracts/index.ts";
import type { ComplianceRegulatoryTrackingCapability } from "./registry/capability.ts";
import {
  complianceRegulatoryTrackingCapabilities,
  complianceRegulatoryTrackingSensitiveCapabilities,
  complianceRegulatoryTrackingWriteCapabilities,
} from "./registry/capability.ts";

export type { CompliancePolicyContext } from "./contracts/index.ts";

const complianceReadCapabilities = [
  complianceRegulatoryTrackingCapabilities.overviewRead,
  complianceRegulatoryTrackingCapabilities.obligationsRead,
  complianceRegulatoryTrackingCapabilities.requirementsRead,
  complianceRegulatoryTrackingCapabilities.evidenceRead,
  complianceRegulatoryTrackingCapabilities.exceptionsRead,
  complianceRegulatoryTrackingCapabilities.correctiveActionsRead,
  complianceRegulatoryTrackingCapabilities.calendarRead,
  complianceRegulatoryTrackingCapabilities.alertsRead,
  complianceRegulatoryTrackingCapabilities.auditRead,
  complianceRegulatoryTrackingCapabilities.reportsRead,
] as const;

const hasCapability = (
  context: CompliancePolicyContext,
  capability: ComplianceRegulatoryTrackingCapability
): boolean => context.grantedCapabilities?.includes(capability) ?? false;

const hasAnyCapability = (
  context: CompliancePolicyContext,
  capabilities: readonly ComplianceRegulatoryTrackingCapability[]
): boolean =>
  capabilities.some((capability) => hasCapability(context, capability));

const normalizePolicyContext = (
  context: unknown
): CompliancePolicyContext | null => {
  const parsed = compliancePolicyContextSchema.safeParse(context ?? {});
  return parsed.success ? parsed.data : null;
};

export function canReadCompliance(context: unknown): boolean {
  const normalized = normalizePolicyContext(context);
  if (!normalized) {
    return false;
  }

  return (
    Boolean(normalized.canRead) ||
    hasAnyCapability(normalized, complianceReadCapabilities)
  );
}

export function canWriteCompliance(context: unknown): boolean {
  const normalized = normalizePolicyContext(context);
  if (!normalized) {
    return false;
  }

  return (
    Boolean(normalized.canWrite) ||
    hasAnyCapability(normalized, complianceRegulatoryTrackingWriteCapabilities)
  );
}

export function canReadComplianceSensitiveData(context: unknown): boolean {
  const normalized = normalizePolicyContext(context);
  if (!normalized) {
    return false;
  }

  return (
    Boolean(normalized.canViewSensitive) ||
    hasAnyCapability(
      normalized,
      complianceRegulatoryTrackingSensitiveCapabilities
    )
  );
}

export function requireComplianceWriteAccess(
  context: unknown
): ComplianceMutationResult {
  return canWriteCompliance(context)
    ? { ok: true, targetId: "" }
    : { ok: false, error: "Write access denied for compliance" };
}

export const complianceSensitiveFieldPolicy: ComplianceSensitiveFieldPolicy =
  complianceEvidenceSensitiveFieldPolicy;
