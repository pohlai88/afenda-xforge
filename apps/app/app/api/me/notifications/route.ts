import { NextResponse } from "next/server";
import { executeNotificationInboxMutation } from "../../../../lib/notifications-inbox/execution.server.ts";
import { queryNotificationInbox } from "../../../../lib/notifications-inbox/queries.server.ts";
import { mapApiRouteError } from "../../../../lib/api/route-errors.ts";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") ?? "30", 10);
    const inbox = await queryNotificationInbox({
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 30,
      requestId: request.headers.get("x-request-id")?.trim() ?? undefined,
    });

    return NextResponse.json(inbox);
  } catch (error) {
    return mapApiRouteError(error, "Notification request failed");
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const result = await executeNotificationInboxMutation(await request.json(), {
      requestId: request.headers.get("x-request-id")?.trim() ?? undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return mapApiRouteError(error, "Notification inbox update failed");
  }
}
