import { listComplianceRequirementsRecords } from "@repo/features-employee-management-compliance-regulatory-tracking/server";
import { NextResponse } from "next/server";
import { createComplianceReadContext, getQuery } from "../_lib/context.ts";
import {
  ensureComplianceReadAccess,
  ensureComplianceWriteAccess,
  respondWithComplianceError,
  mutationStatusFromComplianceResult,
} from "../_lib/http.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const context = await createComplianceReadContext(request);
    const denied = ensureComplianceReadAccess(context);
    if (denied) {
      return denied;
    }

    const data = await listComplianceRequirementsRecords(
      getQuery(request),
      context
    );

    return NextResponse.json(data);
  } catch (error) {
    return respondWithComplianceError(error);
  }
}
