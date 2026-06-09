import { NextResponse } from "next/server";

import {
  replayDeadLetterForTenant,
  requireWebhookManagementAccess,
  writeWebhookOperationalAudit,
} from "../../../_lib/runtime";

type RouteContext = {
  params: Promise<{
    deadLetterId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const access = await requireWebhookManagementAccess();
    const { deadLetterId } = await context.params;
    const result = await replayDeadLetterForTenant(
      access.tenantId,
      deadLetterId
    );

    await writeWebhookOperationalAudit({
      action: "webhooks.dead-letter.replay",
      deadLetterId,
      requestId: crypto.randomUUID(),
      targetId: result.deliveryId,
      targetType: "webhook-dead-letter",
      tenantId: access.tenantId,
      userId: access.userId,
    });

    return NextResponse.json(result, { status: 202 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Webhook replay failed",
      },
      { status: 403 }
    );
  }
}
