import type { HrOrgPolicyContext } from "./contracts/index.ts";

export type { HrOrgPolicyContext } from "./contracts/index.ts";

const hasCapability = (
  context: HrOrgPolicyContext | undefined,
  capability: string
): boolean => context?.grantedCapabilities?.includes(capability) ?? false;

export function canReadHrOrg(context: unknown): boolean {
  const candidate = context as HrOrgPolicyContext | undefined;
  return (
    candidate?.canRead === true ||
    hasCapability(candidate, "hr.organization_structure.read")
  );
}

export function canWriteHrOrg(context: unknown): boolean {
  const candidate = context as HrOrgPolicyContext | undefined;
  return (
    candidate?.canWrite === true ||
    hasCapability(candidate, "hr.organization_structure.write")
  );
}

export function requireHrOrgWriteAccess(
  context: unknown
): { ok: true } | { ok: false; error: string } {
  if (canWriteHrOrg(context)) {
    return { ok: true };
  }

  return { ok: false, error: "Write access denied for organization structure" };
}
