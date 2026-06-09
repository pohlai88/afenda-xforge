import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { queueInboundWebhook } from "../../_lib/runtime";

type RouteContext = {
  params: Promise<{
    provider: string;
  }>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { provider } = await context.params;
    const endpointId = request.headers.get("x-webhook-endpoint-id");
    const signature = request.headers.get("x-webhook-signature");
    const rawBody = await request.text();

    if (!(endpointId && signature)) {
      return NextResponse.json(
        {
          error: "Missing webhook endpoint id or signature",
        },
        { status: 400 }
      );
    }

    const payload = rawBody ? (JSON.parse(rawBody) as unknown) : {};
    const eventId =
      typeof payload === "object" &&
      payload !== null &&
      "eventId" in payload &&
      typeof payload.eventId === "string"
        ? payload.eventId
        : crypto.randomUUID();
    const eventType =
      typeof payload === "object" &&
      payload !== null &&
      "eventType" in payload &&
      typeof payload.eventType === "string"
        ? payload.eventType
        : `${provider}.received.v1`;

    const result = await queueInboundWebhook({
      endpointId,
      envelope: {
        eventId,
        eventType,
        payload,
        provider,
        rawBody,
        signature,
        timestamp: Number(
          request.headers.get("x-webhook-timestamp") ?? Date.now()
        ),
      },
    });

    return NextResponse.json(
      {
        deliveryId: result.deliveryId,
        duplicate: result.duplicate,
        tenantId: result.tenantId,
      },
      { status: result.duplicate ? 202 : 202 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Inbound webhook failed",
      },
      { status: 400 }
    );
  }
}
