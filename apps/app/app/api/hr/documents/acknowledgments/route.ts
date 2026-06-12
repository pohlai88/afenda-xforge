import {
  acknowledgeDocumentsManagementPolicyInputSchema,
} from "@repo/features-employee-management-documents-management/contracts";
import { NextResponse } from "next/server";
import { mapApiRouteError } from "../../../../../lib/api/route-errors.ts";
import { getDocumentsManagementQuery } from "../_context.ts";
import {
  acknowledgePolicyForTenant,
  listAcknowledgmentsForTenant,
} from "../_execution.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const query = getDocumentsManagementQuery(request);

    return NextResponse.json(await listAcknowledgmentsForTenant(query));
  } catch (error) {
    return mapApiRouteError(error, "Invalid query parameters");
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const acknowledged = await acknowledgePolicyForTenant(
      acknowledgeDocumentsManagementPolicyInputSchema.parse(body)
    );

    return NextResponse.json(acknowledged);
  } catch (error) {
    return mapApiRouteError(error, "Invalid acknowledgment payload");
  }
}
