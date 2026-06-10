import { getLamMedicalLeaveReferencesForApplication } from "@repo/features-time-attendance-leave-attendance-management/server";
import { NextResponse } from "next/server";
import { createLamReadContext } from "../../../_lib/context.ts";

export async function GET(
  request: Request,
  context: { params: Promise<{ applicationId: string }> }
) {
  const { applicationId } = await context.params;
  const data = await getLamMedicalLeaveReferencesForApplication(
    applicationId,
    createLamReadContext(request)
  );

  return NextResponse.json(data);
}
