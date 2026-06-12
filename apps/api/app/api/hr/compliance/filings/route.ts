import {
  listComplianceFilingsRecords,
  recordComplianceFiling,
} from "@repo/features-employee-management-compliance-regulatory-tracking/server";
import { NextResponse } from "next/server";
import {
  createComplianceReadContext,
  createComplianceWriteContext,
  getQuery,
} from "../_lib/context.ts";
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

    const data = await listComplianceFilingsRecords(
      getQuery(request),
      context
    );

    return NextResponse.json(data);
  } catch (error) {
    return respondWithComplianceError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const context = await createComplianceWriteContext(request);
    const denied = ensureComplianceWriteAccess(context);
    if (denied) {
      return denied;
    }

    const result = await recordComplianceFiling(
      await request.json(),
      context
    );

    return NextResponse.json(result, {
      status: mutationStatusFromComplianceResult(result, 201),
    });
  } catch (error) {
    return respondWithComplianceError(error);
  }
}
