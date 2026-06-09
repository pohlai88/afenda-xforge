import { NextResponse } from "next/server";

import {
  listWebhookEndpointsForTenant,
  requireWebhookManagementAccess,
  upsertWebhookEndpointForTenant,
  writeWebhookOperationalAudit,
} from "../_lib/runtime";

export async function GET(): Promise<NextResponse> {
  try {
    const access = await requireWebhookManagementAccess();
    const endpoints = await listWebhookEndpointsForTenant(access.tenantId);

    return NextResponse.json(
      {
        items: endpoints,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook endpoint listing failed",
      },
      { status: 403 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const access = await requireWebhookManagementAccess();
    const payload = (await request.json()) as {
      applicationId?: string;
      applicationName?: string;
      companyId?: string;
      endpointId: string;
      eventOwner: string;
      provider: string;
      schemaVersion: string;
      secret: string;
      status?: string;
    };
    const endpoint = await upsertWebhookEndpointForTenant(
      access.tenantId,
      payload
    );

    await writeWebhookOperationalAudit({
      action: "webhooks.endpoint.upsert",
      requestId: crypto.randomUUID(),
      targetId: endpoint.id,
      targetType: "webhook-endpoint",
      tenantId: access.tenantId,
      userId: access.userId,
    });

    return NextResponse.json(endpoint, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook endpoint upsert failed",
      },
      { status: 400 }
    );
  }
}
