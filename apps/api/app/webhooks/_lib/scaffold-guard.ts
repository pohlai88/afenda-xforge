import { NextResponse } from "next/server";

export const rejectUnconfiguredWebhookRoute = (
  provider: string
): NextResponse =>
  NextResponse.json(
    {
      code: "webhook_handler_unconfigured",
      error: `The ${provider} webhook route is not enabled. Register an inbound endpoint and use /webhooks/inbound/[provider] with signed requests.`,
      ok: false,
    },
    { status: 503 }
  );
