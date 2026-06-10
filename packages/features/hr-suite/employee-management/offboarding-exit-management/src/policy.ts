import "server-only";

import type {
  OffboardingCaseRecord,
  OffboardingReadContext,
  OffboardingWriteContext,
} from "./contracts/index.ts";
import {
  offboardingExitManagementReadPermission,
  offboardingExitManagementSensitiveReadPermission,
  offboardingExitManagementWritePermission,
} from "./contracts/permission.contract.ts";
import {
  offboardingReadContextSchema,
  offboardingWriteContextSchema,
} from "./schema.ts";

export type OffboardingRepositoryScope = {
  companyId?: string | null;
  tenantId?: string | null;
};

export type ResolvedOffboardingRepositoryScope = {
  companyId: string;
  tenantId: string;
};

const permissionToken = (permission: {
  function: string;
  module: string;
  object: string;
}): string =>
  `${permission.module}.${permission.object}.${permission.function}`;

const offboardingReadPermissionToken = permissionToken(
  offboardingExitManagementReadPermission
);
const offboardingWritePermissionToken = permissionToken(
  offboardingExitManagementWritePermission
);
const offboardingSensitiveReadPermissionToken = permissionToken(
  offboardingExitManagementSensitiveReadPermission
);

const normalizeScopeValue = (
  value: string | null | undefined
): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const hasExplicitAccessList = (context: {
  grantedCapabilities?: readonly string[];
  grantedPermissions?: readonly string[];
}): boolean =>
  (context.grantedCapabilities?.length ?? 0) > 0 ||
  (context.grantedPermissions?.length ?? 0) > 0;

const includesGrantedValue = (
  values: readonly string[] | undefined,
  expectedValue: string
): boolean => values?.includes(expectedValue) ?? false;

export const resolveOffboardingRepositoryScope = (
  scope?: OffboardingRepositoryScope
): ResolvedOffboardingRepositoryScope | null => {
  const tenantId = normalizeScopeValue(scope?.tenantId);
  const companyId = normalizeScopeValue(scope?.companyId);

  if (!(tenantId && companyId)) {
    return null;
  }

  return {
    companyId,
    tenantId,
  };
};

export const matchesOffboardingScope = (
  record: Pick<OffboardingCaseRecord, "companyId" | "tenantId">,
  scope?: OffboardingRepositoryScope
): boolean => {
  const resolvedScope = resolveOffboardingRepositoryScope(scope);

  return (
    resolvedScope?.tenantId === record.tenantId &&
    resolvedScope.companyId === record.companyId
  );
};

export const canReadOffboardingCases = (
  context?: OffboardingReadContext
): boolean => {
  const parsedContext = offboardingReadContextSchema.parse(context ?? {});

  if (resolveOffboardingRepositoryScope(parsedContext) === null) {
    return false;
  }

  if (parsedContext.canRead === false) {
    return false;
  }

  if (parsedContext.canRead === true) {
    return true;
  }

  if (!hasExplicitAccessList(parsedContext)) {
    return true;
  }

  return (
    includesGrantedValue(
      parsedContext.grantedCapabilities,
      "hr.offboarding.case.read"
    ) ||
    includesGrantedValue(
      parsedContext.grantedPermissions,
      offboardingReadPermissionToken
    )
  );
};

export const canWriteOffboardingCases = (
  context?: OffboardingWriteContext
): boolean => {
  const parsedContext = offboardingWriteContextSchema.parse(context ?? {});

  if (resolveOffboardingRepositoryScope(parsedContext) === null) {
    return false;
  }

  if (parsedContext.canWrite === false) {
    return false;
  }

  if (parsedContext.canWrite === true) {
    return true;
  }

  if (!hasExplicitAccessList(parsedContext)) {
    return true;
  }

  return (
    includesGrantedValue(
      parsedContext.grantedCapabilities,
      "hr.offboarding.case.write"
    ) ||
    includesGrantedValue(
      parsedContext.grantedPermissions,
      offboardingWritePermissionToken
    )
  );
};

export const canReadSensitiveOffboardingFields = (
  context?: OffboardingReadContext
): boolean => {
  const parsedContext = offboardingReadContextSchema.parse(context ?? {});

  if (parsedContext.sensitiveReadGranted === true) {
    return true;
  }

  return (
    includesGrantedValue(
      parsedContext.grantedCapabilities,
      "hr.offboarding.case.sensitive.read"
    ) ||
    includesGrantedValue(
      parsedContext.grantedPermissions,
      offboardingSensitiveReadPermissionToken
    )
  );
};

export const requireOffboardingReadScope = (
  context?: OffboardingReadContext
): ResolvedOffboardingRepositoryScope => {
  const parsedContext = offboardingReadContextSchema.parse(context ?? {});
  const resolvedScope = resolveOffboardingRepositoryScope(parsedContext);

  if (resolvedScope === null) {
    throw new Error(
      "Tenant and company scope are required for offboarding reads."
    );
  }

  if (!canReadOffboardingCases(parsedContext)) {
    throw new Error("Read access denied for offboarding cases.");
  }

  return resolvedScope;
};

export const requireOffboardingWriteScope = (
  context?: OffboardingWriteContext
): ResolvedOffboardingRepositoryScope => {
  const parsedContext = offboardingWriteContextSchema.parse(context ?? {});
  const resolvedScope = resolveOffboardingRepositoryScope(parsedContext);

  if (resolvedScope === null) {
    throw new Error(
      "Tenant and company scope are required for offboarding writes."
    );
  }

  if (!canWriteOffboardingCases(parsedContext)) {
    throw new Error("Write access denied for offboarding cases.");
  }

  return resolvedScope;
};
