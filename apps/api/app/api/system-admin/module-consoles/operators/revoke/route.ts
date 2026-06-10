import { revokeModuleConsoleOperatorForSystemAdmin } from "@repo/features-system-admin-control-plane/server";
import { NextResponse } from "next/server";
import { ensureModuleConsoleRegistry } from "../../../../_lib/module-console-registry.ts";
import { requireSystemAdminModuleConsoleAccess } from "../../../../_lib/system-admin-access.ts";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    ensureModuleConsoleRegistry();
    const access = await requireSystemAdminModuleConsoleAccess();
    const payload = (await request.json()) as {
      assignmentId: string;
      reason: string;
    };
    const assignment = await revokeModuleConsoleOperatorForSystemAdmin(
      payload,
      {
        grantedPermissions: access.grantedPermissions,
        operationId: access.operationId,
        requestId: access.requestId ?? crypto.randomUUID(),
        tenantId: access.tenantId,
        userId: access.userId,
      }
    );

    return NextResponse.json(assignment, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Module console operator revoke failed",
      },
      { status: 400 }
    );
  }
}
