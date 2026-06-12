import { NextResponse } from "next/server";
import { mapApiRouteError } from "../../../../../lib/api/route-errors.ts";
import {
  executeRetentionForTenant,
  listRetentionCandidatesForTenant,
} from "../_execution.ts";

export async function GET(request: Request): Promise<Response> {
  try {
    return NextResponse.json(await listRetentionCandidatesForTenant(request));
  } catch (error) {
    return mapApiRouteError(error, "Invalid query parameters");
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const executed = await executeRetentionForTenant(body);

    return NextResponse.json(executed);
  } catch (error) {
    return mapApiRouteError(error, "Invalid retention payload");
  }
}
