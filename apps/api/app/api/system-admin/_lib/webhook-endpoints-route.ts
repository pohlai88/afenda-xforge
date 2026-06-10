import type { SystemAdminScope } from "@repo/features-system-admin-control-plane";
import { upsertSystemAdminWebhookEndpointInputSchema } from "@repo/features-system-admin-control-plane/contract";
import {
  listSystemAdminWebhookEndpoints,
  upsertSystemAdminWebhookEndpoint,
} from "@repo/features-system-admin-control-plane/server";
import { NextResponse } from "next/server";
import { requireSystemAdminScope } from "./context.ts";

const withWebhookRequestScope = (
  scope: SystemAdminScope,
  request: Request
): SystemAdminScope => ({
  ...scope,
  requestId:
    request.headers.get("x-request-id")?.trim() ||
    scope.requestId ||
    crypto.randomUUID(),
});

export async function handleWebhookEndpointsGet(
  request: Request
): Promise<Response> {
  try {
    const scope = await requireSystemAdminScope(request);
    const endpoints = await listSystemAdminWebhookEndpoints(scope);

    return NextResponse.json({ items: endpoints }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Webhook endpoint listing failed",
      },
      { status: 403 }
    );
  }
}

export async function handleWebhookEndpointsPost(
  request: Request
): Promise<Response> {
  try {
    const scope = withWebhookRequestScope(
      await requireSystemAdminScope(request),
      request
    );
    const payload = upsertSystemAdminWebhookEndpointInputSchema.parse(
      await request.json()
    );
    const endpoint = await upsertSystemAdminWebhookEndpoint(payload, scope);

    return NextResponse.json(endpoint, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Webhook endpoint upsert failed",
      },
      { status: 400 }
    );
  }
}
