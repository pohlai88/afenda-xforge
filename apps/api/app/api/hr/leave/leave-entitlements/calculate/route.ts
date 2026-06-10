import { calculateLamLeaveEntitlement } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";

export async function POST(request: Request) {
  const body = await request.json();
  const context = createLamReadContext(request);
  const data = await calculateLamLeaveEntitlement(body, context);

  if (!context.canRead) {
    return NextResponse.json(
      { ok: false, error: "Read access denied for leave and attendance" },
      { status: 403 }
    );
  }

  return NextResponse.json(data);
}
