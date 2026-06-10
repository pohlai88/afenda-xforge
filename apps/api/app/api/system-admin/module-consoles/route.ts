import {
  listRegisteredModuleConsolesForSystemAdmin,
} from "@repo/features-system-admin-control-plane/server";
import { NextResponse } from "next/server";
import { ensureModuleConsoleRegistry } from "../../_lib/module-console-registry.ts";
import { requireSystemAdminModuleConsoleAccess } from "../../_lib/system-admin-access.ts";

export async function GET(): Promise<NextResponse> {
  try {
    ensureModuleConsoleRegistry();
    const access = await requireSystemAdminModuleConsoleAccess();
    const consoles = listRegisteredModuleConsolesForSystemAdmin({
      grantedPermissions: access.grantedPermissions,
      tenantId: access.tenantId,
      userId: access.userId,
    });

    return NextResponse.json(consoles, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Module console registry read failed",
      },
      { status: 403 }
    );
  }
}
