import {
  tenantAdminSettingsReadSchema,
  tenantAdminSettingUpdateSchema,
} from "@repo/features-system-admin-control-plane/contract";
import {
  readTenantAdminSettingsForTenant,
  updateTenantAdminSetting,
} from "@repo/features-system-admin-control-plane/server";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import { NextResponse } from "next/server";
import { mapApiRouteError } from "../../../../lib/api/route-errors.ts";
import { requireSystemAdminScope } from "../_lib/context.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const scope = await requireSystemAdminScope(request);
    const access = await readTenantAdminSettingsForTenant(scope.tenantId);

    requirePermission(
      {
        action: permissionCatalog.systemAdmin.tenantSettingsRead,
        actorId: scope.userId,
        companyId: scope.companyId,
        grantedPermissions: scope.grantedPermissions,
        resource: "system-admin.tenant-settings",
        tenantId: scope.tenantId,
      },
      { allOf: [permissionCatalog.systemAdmin.tenantSettingsRead] }
    );

    return NextResponse.json(tenantAdminSettingsReadSchema.parse(access));
  } catch (error) {
    return mapApiRouteError(error, "Tenant settings read failed");
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const scope = await requireSystemAdminScope(request);
    const body = tenantAdminSettingUpdateSchema.parse(await request.json());
    return NextResponse.json(await updateTenantAdminSetting(body, scope), {
      status: 202,
    });
  } catch (error) {
    return mapApiRouteError(error, "Tenant settings update failed");
  }
}
