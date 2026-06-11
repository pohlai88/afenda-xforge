import { permissionCatalog, resolvePermissionsForTenantRole } from "@repo/permissions";
import {
  resetRuntimeTenantAccessForTesting,
  setRuntimeTenantAccessForTesting,
  type RuntimeTenantAccess,
} from "../app/_runtime-access.ts";

export const TEST_TENANT_ID = "tenant-a";
export const TEST_ACTOR_ID = "user-a";
export const TEST_ADMIN_ROLE = "admin";
export const TEST_COMPANY_ID = "company-a";

export const ESS_FULL_PERMISSIONS = [
  permissionCatalog.hrEmployeeSelfservicePortal.profileRead,
  permissionCatalog.hrEmployeeSelfservicePortal.recordsRead,
  permissionCatalog.hrEmployeeSelfservicePortal.recordsReadAll,
  permissionCatalog.hrEmployeeSelfservicePortal.sensitiveRead,
  permissionCatalog.hrEmployeeSelfservicePortal.write,
];

export const createTestRuntimeTenantAccess = (
  overrides: Partial<RuntimeTenantAccess> = {}
): RuntimeTenantAccess => ({
  actorId: TEST_ACTOR_ID,
  companyId: TEST_COMPANY_ID,
  grantedPermissions: resolvePermissionsForTenantRole(TEST_ADMIN_ROLE),
  role: TEST_ADMIN_ROLE,
  requestId: "test-request",
  tenantId: TEST_TENANT_ID,
  userEmail: "admin@tenant.test",
  ...overrides,
});

export const installTestRuntimeTenantAccess = (
  overrides: Partial<RuntimeTenantAccess> = {}
): void => {
  const access = createTestRuntimeTenantAccess(overrides);
  setRuntimeTenantAccessForTesting(async () => access);
};

export const uninstallTestRuntimeTenantAccess = (): void => {
  resetRuntimeTenantAccessForTesting();
};

export const installTestEssRuntimeTenantAccess = (
  overrides: Partial<RuntimeTenantAccess> = {}
): void => {
  installTestRuntimeTenantAccess({
    grantedPermissions: ESS_FULL_PERMISSIONS,
    tenantId: TEST_TENANT_ID,
    ...overrides,
  });
};

export const installTestDeniedHrRuntimeTenantAccess = (): void => {
  installTestRuntimeTenantAccess({
    grantedPermissions: [],
    role: "viewer",
  });
};
