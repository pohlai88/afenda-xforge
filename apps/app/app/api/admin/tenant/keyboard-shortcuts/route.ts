import { permissionCatalog, requirePermission } from "@repo/permissions";
import { NextResponse } from "next/server";
import { mapWorkspaceShortcutApiError } from "../../../../../lib/workspace-shortcuts/api-errors.ts";
import { executeTenantKeyboardShortcutPolicyUpdate } from "../../../../../lib/workspace-shortcuts/execution.server.ts";
import { readTenantKeyboardShortcutPolicy } from "../../../../../lib/workspace-shortcuts/repository.server.ts";
import { tenantKeyboardShortcutPolicyPostSchema } from "../../../../../lib/workspace-shortcuts/tenant-policy-schema.ts";
import { requireSystemAdminScope } from "../../../system-admin/_lib/context.ts";

const ADMIN_RESOURCE = "system-admin.tenant-settings";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const scope = await requireSystemAdminScope(request);

    requirePermission(
      {
        action: permissionCatalog.systemAdmin.tenantSettingsRead,
        actorId: scope.userId,
        companyId: scope.companyId,
        grantedPermissions: scope.grantedPermissions,
        resource: ADMIN_RESOURCE,
        tenantId: scope.tenantId,
      },
      { allOf: [permissionCatalog.systemAdmin.tenantSettingsRead] }
    );

    const payload = await readTenantKeyboardShortcutPolicy(scope.tenantId);

    return NextResponse.json(payload);
  } catch (error) {
    return mapWorkspaceShortcutApiError(
      error,
      "Tenant keyboard shortcut policy read failed"
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const scope = await requireSystemAdminScope(request);
    const body = tenantKeyboardShortcutPolicyPostSchema.parse(
      await request.json()
    );
    const payload = await executeTenantKeyboardShortcutPolicyUpdate(body, {
      companyId: scope.companyId,
      grantedPermissions: scope.grantedPermissions,
      operationId: scope.operationId,
      requestId: scope.requestId ?? request.headers.get("x-request-id")?.trim(),
      tenantId: scope.tenantId,
      userId: scope.userId,
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return mapWorkspaceShortcutApiError(
      error,
      "Tenant keyboard shortcut policy update failed"
    );
  }
}
