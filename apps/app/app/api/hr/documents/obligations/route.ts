import {
  createDocumentsManagementDocumentObligationInputSchema,
} from "@repo/features-employee-management-documents-management/contracts";
import { NextResponse } from "next/server";
import { mapApiRouteError } from "../../../../../lib/api/route-errors.ts";
import { getDocumentsManagementQuery } from "../_context.ts";
import {
  createObligationForTenant,
  listObligationsForTenant,
} from "../_execution.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const query = getDocumentsManagementQuery(request);

    return NextResponse.json(await listObligationsForTenant(query));
  } catch (error) {
    return mapApiRouteError(error, "Invalid query parameters");
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const createdObligation = await createObligationForTenant(
      createDocumentsManagementDocumentObligationInputSchema.parse(body)
    );

    return NextResponse.json(createdObligation, { status: 201 });
  } catch (error) {
    return mapApiRouteError(error, "Invalid obligation payload");
  }
}
