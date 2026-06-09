import { NextResponse } from "next/server";

import {
  dispatchQueuedWebhook,
  requireWebhookManagementAccess,
  writeWebhookOperationalAudit,
} from "../../_lib/runtime";

export async function POST(): Promise<NextResponse> {
  try {
    const access = await requireWebhookManagementAccess();
    const result = await dispatchQueuedWebhook(access.tenantId);

    if (result.status !== "empty" && result.deliveryId) {
      await writeWebhookOperationalAudit({
        action: `webhooks.queue.${result.status}`,
        requestId: crypto.randomUUID(),
        targetId: result.deliveryId,
        targetType: "webhook-delivery",
        tenantId: access.tenantId,
        userId: access.userId,
      });
    }

    return NextResponse.json(result, {
      status: result.status === "failed" ? 202 : 200,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook dispatch failed",
      },
      { status: 403 }
    );
  }
}
