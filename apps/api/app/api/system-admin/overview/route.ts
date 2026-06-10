import { readSystemAdminOverview } from "@repo/features-system-admin-control-plane/server";
import { NextResponse } from "next/server";
import { requireSystemAdminScope } from "../_lib/context.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const scope = await requireSystemAdminScope(request);
    return NextResponse.json(readSystemAdminOverview(scope));
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Overview failed",
      },
      { status: 403 }
    );
  }
}
