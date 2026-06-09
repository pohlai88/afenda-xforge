import type { PermissionContext } from "@repo/permissions";
import type { SystemAdminCapability, SystemAdminScope } from "./schema.ts";

export type SystemAdminPermissionResource =
  | "system-admin"
  | "system-admin.audit"
  | "system-admin.customization"
  | "system-admin.health"
  | "system-admin.tenant-settings"
  | "system-admin.users-access";

export const createSystemAdminPermissionContext = (
  context: SystemAdminScope,
  action: SystemAdminCapability,
  resource: SystemAdminPermissionResource = "system-admin"
): PermissionContext => ({
  action,
  actorId: context.userId,
  companyId: context.companyId,
  grantedPermissions: context.grantedPermissions,
  metadata: {
    feature: "system-admin.control-plane",
  },
  resource,
  tenantId: context.tenantId,
});
