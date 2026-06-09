import type { SystemAdminScope } from "@repo/features-system-admin-control-plane";
import {
  listSystemAdminWebhookEndpoints,
  upsertSystemAdminWebhookEndpoint,
} from "@repo/features-system-admin-control-plane/server";
import { NextResponse } from "next/server";

import { requireWebhookManagementAccess } from "../_lib/runtime";

const createSystemAdminScope = (access: {
  grantedPermissions: string[];
  role: string;
  tenantId: string;
  userId: string;
}): SystemAdminScope => ({
  grantedPermissions: access.grantedPermissions,
  tenantId: access.tenantId,
  userId: access.userId,
});

export async function GET(): Promise<NextResponse> {
  try {
    const access = await requireWebhookManagementAccess();
    const endpoints = await listSystemAdminWebhookEndpoints(
      createSystemAdminScope(access)
    );

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
    const endpoint = await upsertSystemAdminWebhookEndpoint(payload, {
      ...createSystemAdminScope(access),
      requestId: crypto.randomUUID(),
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
