import { ForbiddenError } from "@repo/errors";
import type {
  PermissionContext,
  PermissionDecision,
  PermissionKey,
  PermissionRequirement,
} from "./contract.ts";

export const normalizePermissions = (
  permissions: Iterable<PermissionKey>
): PermissionKey[] => Array.from(new Set(permissions)).sort();

export const hasPermission = (
  grantedPermissions: Iterable<PermissionKey>,
  requiredPermission: PermissionKey
): boolean => new Set(grantedPermissions).has(requiredPermission);

export const hasAllPermissions = (
  grantedPermissions: Iterable<PermissionKey>,
  requiredPermissions: PermissionKey[]
): boolean =>
  requiredPermissions.every((permission) =>
    hasPermission(grantedPermissions, permission)
  );

export const hasAnyPermission = (
  grantedPermissions: Iterable<PermissionKey>,
  requiredPermissions: PermissionKey[]
): boolean =>
  requiredPermissions.some((permission) =>
    hasPermission(grantedPermissions, permission)
  );

export const resolvePermissionDecision = (
  context: PermissionContext,
  requirement: PermissionRequirement
): PermissionDecision => {
  const grantedPermissions = normalizePermissions(context.grantedPermissions);
  const required: PermissionRequirement = {
    allOf: requirement.allOf?.filter(Boolean),
    anyOf: requirement.anyOf?.filter(Boolean),
    recordRules: requirement.recordRules?.filter(Boolean),
  };
  const scope = {
    companyId: context.companyId,
    record: context.record,
    resource: context.resource,
    tenantId: context.tenantId,
  };

  if (
    required.allOf?.length &&
    !hasAllPermissions(grantedPermissions, required.allOf)
  ) {
    const missing = required.allOf.filter(
      (permission) => !hasPermission(grantedPermissions, permission)
    );

    return {
      allow: false,
      reason: "missing-permissions",
      required,
      missing,
      scope,
    };
  }

  if (
    required.anyOf?.length &&
    !hasAnyPermission(grantedPermissions, required.anyOf)
  ) {
    return {
      allow: false,
      reason: "missing-permissions",
      required,
      missing: required.anyOf.filter(
        (permission) => !hasPermission(grantedPermissions, permission)
      ),
      scope,
    };
  }

  for (const recordRule of required.recordRules ?? []) {
    if (!recordRule.assess(context)) {
      return {
        allow: false,
        reason: "record-rule-denied",
        required,
        failedRecordRule: recordRule.name,
        scope,
      };
    }
  }

  return {
    allow: true,
    reason: "allowed",
    required,
    scope,
  };
};

export const requirePermission = (
  context: PermissionContext,
  requirement: PermissionRequirement
): void => {
  const decision = resolvePermissionDecision(context, requirement);

  if (!decision.allow) {
    throw new ForbiddenError(
      `Missing required permission(s) for ${context.action}`
    );
  }
};
