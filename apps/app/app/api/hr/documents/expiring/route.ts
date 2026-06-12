import { NextResponse } from "next/server";
import { mapApiRouteError } from "../../../../../lib/api/route-errors.ts";
import { getDocumentsManagementQuery } from "../_context.ts";
import { listExpiringDocumentsForTenant } from "../_execution.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    const query = getDocumentsManagementQuery(request);

    return NextResponse.json(await listExpiringDocumentsForTenant(query));
  } catch (error) {
    return mapApiRouteError(error, "Invalid query parameters");
  }
}
