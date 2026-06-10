import type { EmployeeLifecycleManagementPolicyContext } from "./contracts/index.ts";

export type { EmployeeLifecycleManagementPolicyContext } from "./contracts/index.ts";

const hasScopedIdentity = (
  context?: EmployeeLifecycleManagementPolicyContext
): boolean => Boolean(context?.companyId?.trim() || context?.tenantId?.trim());

export function canReadEmployeeLifecycleManagement(
  context?: EmployeeLifecycleManagementPolicyContext
): boolean {
  return hasScopedIdentity(context) && Boolean(context?.canRead);
}

export function canWriteEmployeeLifecycleManagement(
  context?: EmployeeLifecycleManagementPolicyContext
): boolean {
  return hasScopedIdentity(context) && Boolean(context?.canWrite);
}

export function canViewEmployeeLifecycleManagementSensitiveData(
  context?: EmployeeLifecycleManagementPolicyContext
): boolean {
  return hasScopedIdentity(context) && Boolean(context?.canViewSensitive);
}

export function requireEmployeeLifecycleManagementReadAccess(
  context?: EmployeeLifecycleManagementPolicyContext
): void {
  if (canReadEmployeeLifecycleManagement(context)) {
    return;
  }

  throw new Error("Read access denied for employee lifecycle management");
}

export function requireEmployeeLifecycleManagementWriteAccess(
  context?: EmployeeLifecycleManagementPolicyContext
): void {
  if (canWriteEmployeeLifecycleManagement(context)) {
    return;
  }

  throw new Error("Write access denied for employee lifecycle management");
}

export function normalizeEmployeeLifecycleManagementActorId(
  context?: EmployeeLifecycleManagementPolicyContext
): string {
  return context?.actorId?.trim() || "system";
}

export function buildEmployeeLifecycleManagementAuditMetadata(
  input: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}

export function redactEmployeeLifecycleManagementText(
  value: string | null | undefined,
  canViewSensitive: boolean
): string | null | undefined {
  return canViewSensitive ? value : null;
}
