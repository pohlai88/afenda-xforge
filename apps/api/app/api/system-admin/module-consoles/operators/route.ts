import {
  assignModuleConsoleOperatorForSystemAdmin,
  listModuleConsoleOperatorAssignmentsForSystemAdmin,
} from "@repo/features-system-admin-control-plane/server";
import { NextResponse } from "next/server";
import { ensureModuleConsoleRegistry } from "../../../_lib/module-console-registry.ts";
import { requireSystemAdminModuleConsoleAccess } from "../../../_lib/system-admin-access.ts";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    ensureModuleConsoleRegistry();
    const access = await requireSystemAdminModuleConsoleAccess();
    const url = new URL(request.url);
    const assignments = await listModuleConsoleOperatorAssignmentsForSystemAdmin(
      {
        companyId: url.searchParams.get("companyId") ?? undefined,
        consoleId: url.searchParams.get("consoleId") ?? undefined,
      },
      {
        grantedPermissions: access.grantedPermissions,
        tenantId: access.tenantId,
        userId: access.userId,
      }
    );

    return NextResponse.json(assignments, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Module console operator listing failed",
      },
      { status: 403 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    ensureModuleConsoleRegistry();
    const access = await requireSystemAdminModuleConsoleAccess();
    const payload = (await request.json()) as {
      capabilities?: string[];
      companyId: string;
      consoleId: string;
      operatorUserId: string;
      reason: string;
      validFrom?: string;
      validTo?: string;
    };
    const assignment = await assignModuleConsoleOperatorForSystemAdmin(
      payload,
      {
        grantedPermissions: access.grantedPermissions,
        operationId: access.operationId,
        requestId: access.requestId ?? crypto.randomUUID(),
        tenantId: access.tenantId,
        userId: access.userId,
      }
    );

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Module console operator assignment failed",
      },
      { status: 400 }
    );
  }
}
