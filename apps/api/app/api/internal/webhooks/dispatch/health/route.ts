import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { authorizeWebhookDispatchCron } from "../../../../../webhooks/_lib/cron-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: NextRequest): NextResponse {
  try {
    authorizeWebhookDispatchCron(
      request.headers.get("authorization"),
      request.headers.get("x-webhook-dispatch-secret")
    );

    return NextResponse.json(
      {
        auth: "ok",
        cronSecretConfigured: true,
        route: "/api/internal/webhooks/dispatch/health",
        status: "ok",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        auth: "failed",
        cronSecretConfigured:
          !(error instanceof Error) ||
          error.message !== "CRON_SECRET is not configured",
        error:
          error instanceof Error
            ? error.message
            : "Webhook dispatch health validation failed",
        route: "/api/internal/webhooks/dispatch/health",
        status: "error",
      },
      { status: 403 }
    );
  }
}
