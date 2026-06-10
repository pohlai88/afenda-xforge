import type { CalculateLamLeaveEntitlementInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { calculateLamLeaveEntitlement } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../_lib/context.ts";
import { parseLamJsonBody } from "../../_lib/parse-json-body.ts";

export async function POST(request: Request) {
  const parsedBody = await parseLamJsonBody(request);
  if (!parsedBody.ok) {
    return NextResponse.json(
      { ok: false, error: parsedBody.error },
      { status: 400 }
    );
  }

  const context = createLamReadContext(request);
  if (!context.canRead) {
    return NextResponse.json(
      { ok: false, error: "Read access denied for leave and attendance" },
      { status: 403 }
    );
  }

  const data = await calculateLamLeaveEntitlement(
    parsedBody.body as CalculateLamLeaveEntitlementInput,
    context
  );
  return NextResponse.json(data);
}
