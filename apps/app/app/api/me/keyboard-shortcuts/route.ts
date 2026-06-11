import { NextResponse } from "next/server";
import { mapApiRouteError } from "../../../../lib/api/route-errors.ts";
import { executeUserShortcutOverridesUpdate } from "../../../../lib/workspace-shortcuts/execution.server.ts";
import { shortcutOverridesPostSchema } from "../../../../lib/workspace-shortcuts/override-schema.ts";
import { queryWorkspaceShortcuts } from "../../../../lib/workspace-shortcuts/queries.server.ts";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const payload = await queryWorkspaceShortcuts({
      requestId: request.headers.get("x-request-id")?.trim() ?? undefined,
    });

    return NextResponse.json(payload);
  } catch (error) {
    return mapApiRouteError(error, "Keyboard shortcut resolution failed");
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = shortcutOverridesPostSchema.parse(await request.json());
    const payload = await executeUserShortcutOverridesUpdate(
      { overrides: body.overrides },
      {
        requestId: request.headers.get("x-request-id")?.trim() ?? undefined,
      }
    );

    return NextResponse.json({ payload });
  } catch (error) {
    return mapApiRouteError(error, "Keyboard shortcut update failed");
  }
}
