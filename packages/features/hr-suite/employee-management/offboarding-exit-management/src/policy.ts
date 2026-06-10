import type {
  OffboardingMutationResult,
  OffboardingReadContext,
  OffboardingWriteContext,
} from "./contracts/index.ts";
import type { OffboardingExitManagementCapability } from "./registry/capability.ts";
import {
  offboardingExitManagementCapabilities,
  offboardingExitManagementSensitiveCapabilities,
  offboardingExitManagementWriteCapabilities,
} from "./registry/capability.ts";
import {
  offboardingReadContextSchema,
  offboardingWriteContextSchema,
} from "./schema.ts";

export type OffboardingExitManagementPolicyContext =
  | OffboardingReadContext
  | OffboardingWriteContext;

const offboardingReadCapabilities = [
  offboardingExitManagementCapabilities.overviewRead,
  offboardingExitManagementCapabilities.casesRead,
  offboardingExitManagementCapabilities.approvalsRead,
  offboardingExitManagementCapabilities.auditRead,
  offboardingExitManagementCapabilities.sensitiveRead,
] as const;

const hasCapability = (
  context: OffboardingExitManagementPolicyContext,
  capability: OffboardingExitManagementCapability
): boolean => context.grantedCapabilities?.includes(capability) ?? false;

const hasAnyCapability = (
  context: OffboardingExitManagementPolicyContext,
  capabilities: readonly OffboardingExitManagementCapability[]
): boolean =>
  capabilities.some((capability) => hasCapability(context, capability));

const normalizeReadContext = (
  context: unknown
): OffboardingReadContext | null => {
  const parsed = offboardingReadContextSchema.safeParse(context ?? {});
  return parsed.success ? parsed.data : null;
};

const normalizeWriteContext = (
  context: unknown
): OffboardingWriteContext | null => {
  const parsed = offboardingWriteContextSchema.safeParse(context ?? {});
  return parsed.success ? parsed.data : null;
};

const hasScopedIdentity = (
  context?: Pick<
    OffboardingExitManagementPolicyContext,
    "companyId" | "tenantId"
  >
): boolean => Boolean(context?.tenantId?.trim());

export function canReadOffboardingExitManagement(context: unknown): boolean {
  const normalized = normalizeReadContext(context);
  if (!(normalized && hasScopedIdentity(normalized))) {
    return false;
  }

  return (
    Boolean(normalized.canRead) ||
    hasAnyCapability(normalized, offboardingReadCapabilities)
  );
}

export function canWriteOffboardingExitManagement(context: unknown): boolean {
  const normalized = normalizeWriteContext(context);
  if (!(normalized && hasScopedIdentity(normalized))) {
    return false;
  }

  return (
    Boolean(normalized.canWrite) ||
    hasAnyCapability(normalized, offboardingExitManagementWriteCapabilities)
  );
}

export function canViewOffboardingExitManagementSensitiveData(
  context: unknown
): boolean {
  const normalized = normalizeReadContext(context);
  if (!(normalized && hasScopedIdentity(normalized))) {
    return false;
  }

  return (
    Boolean(normalized.canViewSensitive) ||
    hasAnyCapability(normalized, offboardingExitManagementSensitiveCapabilities)
  );
}

export function requireOffboardingExitManagementWriteAccess(
  context: unknown
): OffboardingMutationResult {
  return canWriteOffboardingExitManagement(context)
    ? { ok: true, targetId: "" }
    : { ok: false, error: "Write access denied for offboarding", targetId: "" };
}
