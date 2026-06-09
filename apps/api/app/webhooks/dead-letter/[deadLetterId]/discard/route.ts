import { NextResponse } from "next/server";

import {
  discardDeadLetterForTenant,
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

    await discardDeadLetterForTenant(access.tenantId, deadLetterId);
    await writeWebhookOperationalAudit({
      action: "webhooks.dead-letter.discard",
      deadLetterId,
      requestId: crypto.randomUUID(),
      targetId: deadLetterId,
      targetType: "webhook-dead-letter",
      tenantId: access.tenantId,
      userId: access.userId,
    });

    return NextResponse.json(
      {
        deadLetterId,
        status: "discarded",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook discard failed",
      },
      { status: 403 }
    );
  }
}
