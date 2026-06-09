import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { authorizeWebhookDispatchCron } from "../../../../webhooks/_lib/cron-auth";
import { dispatchQueuedWebhooksForAllTenants } from "../../../../webhooks/_lib/runtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    authorizeWebhookDispatchCron(
      request.headers.get("authorization"),
      request.headers.get("x-webhook-dispatch-secret")
    );

    const result = await dispatchQueuedWebhooksForAllTenants();

    return NextResponse.json(
      {
        ...result,
        status: "ok",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Scheduled webhook dispatch failed",
      },
      { status: 403 }
    );
  }
}
