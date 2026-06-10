import { roleAssignmentCommandSchema } from "@repo/features-system-admin-control-plane/contract";
import { assignSystemAdminRole } from "@repo/features-system-admin-control-plane/server";
import { NextResponse } from "next/server";
import { requireSystemAdminScope } from "../../_lib/context.ts";

export async function POST(request: Request): Promise<Response> {
  try {
    const scope = await requireSystemAdminScope(request);
    const body = roleAssignmentCommandSchema.parse(await request.json());

    return NextResponse.json(await assignSystemAdminRole(body, scope), {
      status: 202,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Role assignment failed",
      },
      { status: 400 }
    );
  }
}
