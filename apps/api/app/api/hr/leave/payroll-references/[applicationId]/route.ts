import { getLamPayrollReferenceByApplicationId } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamPayrollReadContext } from "../../_lib/context.ts";

export async function GET(
  request: Request,
  context: { params: Promise<{ applicationId: string }> }
) {
  const { applicationId } = await context.params;
  const data = await getLamPayrollReferenceByApplicationId(
    applicationId,
    await createLamPayrollReadContext(request)
  );

  if (!data) {
    return NextResponse.json(
      { error: "Payroll reference not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
