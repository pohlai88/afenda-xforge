import { requireActiveTenantMembership } from "@repo/auth/server";
import { NextResponse } from "next/server";
import { mapApiRouteError } from "../../../../lib/api/route-errors.ts";
import { executeUserShortcutOverridesUpdate } from "../../../../lib/workspace-shortcuts/execution.server.ts";
import { shortcutOverridesPostSchema } from "../../../../lib/workspace-shortcuts/override-schema.ts";
import { readWorkspaceShortcuts } from "../../../../lib/workspace-shortcuts/repository.server.ts";
import { resolveProductDefaults } from "../../../../lib/workspace-shortcuts/resolve-shortcuts.ts";

export async function GET(): Promise<NextResponse> {
  try {
    const membership = await requireActiveTenantMembership();

    try {
      const payload = await readWorkspaceShortcuts(
        membership.tenantId,
        membership.userId
      );

      return NextResponse.json(payload);
    } catch {
      return NextResponse.json(resolveProductDefaults());
    }
  } catch (error) {
    return mapApiRouteError(error, "Keyboard shortcut resolution failed");
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const membership = await requireActiveTenantMembership();
    const body = shortcutOverridesPostSchema.parse(await request.json());
    const payload = await executeUserShortcutOverridesUpdate(
      { overrides: body.overrides },
      {
        requestId: request.headers.get("x-request-id")?.trim() ?? undefined,
        tenantId: membership.tenantId,
        userId: membership.userId,
      }
    );

    return NextResponse.json({ payload });
  } catch (error) {
    return mapApiRouteError(error, "Keyboard shortcut update failed");
  }
}
