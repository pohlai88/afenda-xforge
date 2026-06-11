import { requireActiveTenantMembership } from "@repo/auth/server";
import {
  archiveAllNotifications,
  listNotificationInbox,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationsSeen,
} from "@repo/notifications";
import { NextResponse } from "next/server";
import { z } from "zod";
import { mapApiRouteError } from "../../../../lib/api/route-errors.ts";

const patchBodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("archive-all"),
  }),
  z.object({
    action: z.literal("mark-all-read"),
  }),
  z.object({
    action: z.literal("mark-read"),
    id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("mark-seen"),
    ids: z.array(z.string().uuid()).min(1),
  }),
]);

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const membership = await requireActiveTenantMembership();
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") ?? "30", 10);

    const inbox = await listNotificationInbox({
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 30,
      tenantId: membership.tenantId,
      userId: membership.userId,
    });

    return NextResponse.json(inbox);
  } catch (error) {
    return mapApiRouteError(error, "Notification request failed");
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const membership = await requireActiveTenantMembership();
    const body = patchBodySchema.parse(await request.json());

    if (body.action === "archive-all") {
      const archivedCount = await archiveAllNotifications({
        tenantId: membership.tenantId,
        userId: membership.userId,
      });

      return NextResponse.json({ archivedCount });
    }

    if (body.action === "mark-all-read") {
      const updatedCount = await markAllNotificationsRead({
        tenantId: membership.tenantId,
        userId: membership.userId,
      });

      return NextResponse.json({ updatedCount });
    }

    if (body.action === "mark-read") {
      const item = await markNotificationRead({
        id: body.id,
        tenantId: membership.tenantId,
        userId: membership.userId,
      });

      return NextResponse.json({ item });
    }

    const items = await markNotificationsSeen({
      ids: body.ids,
      tenantId: membership.tenantId,
      userId: membership.userId,
    });

    return NextResponse.json({ items });
  } catch (error) {
    return mapApiRouteError(error, "Notification inbox update failed");
  }
}
