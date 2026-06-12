import { NextResponse } from "next/server";
import { mapApiRouteError } from "../../../../lib/api/route-errors.ts";
import { queryWorkspaceSearch } from "../../../../lib/workspace-search/queries.server.ts";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const limit = Number.parseInt(searchParams.get("limit") ?? "10", 10);

    const payload = await queryWorkspaceSearch({
      limit: Number.isFinite(limit) ? limit : undefined,
      query,
      requestId: request.headers.get("x-request-id")?.trim() ?? undefined,
    });

    return NextResponse.json(payload);
  } catch (error) {
    return mapApiRouteError(error, "Workspace search failed");
  }
}
