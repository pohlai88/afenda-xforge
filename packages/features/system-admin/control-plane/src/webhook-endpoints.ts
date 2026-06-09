import "server-only";

import { writeAuditEvent } from "@repo/audit";
import {
  companies,
  database,
  timeDatabaseQuery,
  webhookEndpoints,
} from "@repo/database";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import { and, eq } from "drizzle-orm";
import type { SystemAdminScope } from "./schema.ts";

const ACTIVE_WEBHOOK_ENDPOINT_STATUS = "active";
const SYSTEM_ADMIN_WEBHOOK_ROUTE = "/api/system-admin/webhooks/endpoints";

export type SystemAdminWebhookEndpoint = Readonly<{
  applicationId?: string;
  applicationName?: string;
  companyId?: string;
  endpointId: string;
  eventOwner: string;
  id: string;
  provider: string;
  schemaVersion: string;
  status: string;
  tenantId: string;
}>;

export type UpsertSystemAdminWebhookEndpointInput = Readonly<{
  applicationId?: string;
  applicationName?: string;
  companyId?: string;
  endpointId: string;
  eventOwner: string;
  provider: string;
  schemaVersion: string;
  secret: string;
  status?: string;
}>;

const requireWebhookAdministrationPermission = (
  context: SystemAdminScope
): void => {
  requirePermission(
    {
      action: "webhooks.manage",
      actorId: context.userId,
      companyId: context.companyId,
      grantedPermissions: context.grantedPermissions,
      metadata: {
        feature: "system-admin.control-plane",
      },
      resource: "webhooks",
      tenantId: context.tenantId,
    },
    {
      allOf: [permissionCatalog.webhooks.manage],
    }
  );
};

const validateCompanyInTenant = async (
  tenantId: string,
  companyId: string
): Promise<boolean> => {
  const [company] = await timeDatabaseQuery(
    () =>
      database
        .select({ id: companies.id })
        .from(companies)
        .where(
          and(eq(companies.id, companyId), eq(companies.tenantId, tenantId))
        )
        .limit(1),
    {
      operation: "select",
      resource: "companies",
      metadata: {
        companyId,
        tenantId,
      },
    }
  );

  return Boolean(company);
};

const mapSystemAdminWebhookEndpoint = (row: {
  applicationId: string | null;
  applicationName: string | null;
  companyId: string | null;
  endpointId: string;
  eventOwner: string;
  id: string;
  provider: string;
  schemaVersion: string;
  status: string;
  tenantId: string;
}): SystemAdminWebhookEndpoint => ({
  ...(row.applicationId
    ? {
        applicationId: row.applicationId,
      }
    : {}),
  ...(row.applicationName
    ? {
        applicationName: row.applicationName,
      }
    : {}),
  ...(row.companyId
    ? {
        companyId: row.companyId,
      }
    : {}),
  endpointId: row.endpointId,
  eventOwner: row.eventOwner,
  id: row.id,
  provider: row.provider,
  schemaVersion: row.schemaVersion,
  status: row.status,
  tenantId: row.tenantId,
});

export const listSystemAdminWebhookEndpoints = async (
  context: SystemAdminScope
): Promise<SystemAdminWebhookEndpoint[]> => {
  requireWebhookAdministrationPermission(context);

  const endpoints = await timeDatabaseQuery(
    () =>
      database
        .select({
          applicationId: webhookEndpoints.applicationId,
          applicationName: webhookEndpoints.applicationName,
          companyId: webhookEndpoints.companyId,
          endpointId: webhookEndpoints.endpointId,
          eventOwner: webhookEndpoints.eventOwner,
          id: webhookEndpoints.id,
          provider: webhookEndpoints.provider,
          schemaVersion: webhookEndpoints.schemaVersion,
          status: webhookEndpoints.status,
          tenantId: webhookEndpoints.tenantId,
        })
        .from(webhookEndpoints)
        .where(eq(webhookEndpoints.tenantId, context.tenantId)),
    {
      operation: "select",
      resource: "webhook_endpoints",
      metadata: {
        tenantId: context.tenantId,
      },
    }
  );

  return endpoints.map(mapSystemAdminWebhookEndpoint);
};

export const upsertSystemAdminWebhookEndpoint = async (
  input: UpsertSystemAdminWebhookEndpointInput,
  context: SystemAdminScope
): Promise<SystemAdminWebhookEndpoint> => {
  requireWebhookAdministrationPermission(context);

  if (
    input.companyId &&
    !(await validateCompanyInTenant(context.tenantId, input.companyId))
  ) {
    throw new Error("Webhook endpoint company scope is not trusted");
  }

  const [endpoint] = await timeDatabaseQuery(
    () =>
      database
        .insert(webhookEndpoints)
        .values({
          applicationId: input.applicationId?.trim() || null,
          applicationName: input.applicationName?.trim() || null,
          companyId: input.companyId?.trim() || null,
          endpointId: input.endpointId.trim(),
          eventOwner: input.eventOwner.trim(),
          provider: input.provider.trim(),
          schemaVersion: input.schemaVersion.trim(),
          secret: input.secret.trim(),
          status: input.status?.trim() || ACTIVE_WEBHOOK_ENDPOINT_STATUS,
          tenantId: context.tenantId,
        })
        .onConflictDoUpdate({
          target: [webhookEndpoints.provider, webhookEndpoints.endpointId],
          set: {
            applicationId: input.applicationId?.trim() || null,
            applicationName: input.applicationName?.trim() || null,
            companyId: input.companyId?.trim() || null,
            eventOwner: input.eventOwner.trim(),
            schemaVersion: input.schemaVersion.trim(),
            secret: input.secret.trim(),
            status: input.status?.trim() || ACTIVE_WEBHOOK_ENDPOINT_STATUS,
            updatedAt: new Date(),
          },
        })
        .returning({
          applicationId: webhookEndpoints.applicationId,
          applicationName: webhookEndpoints.applicationName,
          companyId: webhookEndpoints.companyId,
          endpointId: webhookEndpoints.endpointId,
          eventOwner: webhookEndpoints.eventOwner,
          id: webhookEndpoints.id,
          provider: webhookEndpoints.provider,
          schemaVersion: webhookEndpoints.schemaVersion,
          status: webhookEndpoints.status,
          tenantId: webhookEndpoints.tenantId,
        }),
    {
      operation: "upsert",
      resource: "webhook_endpoints",
      metadata: {
        endpointId: input.endpointId,
        provider: input.provider,
        tenantId: context.tenantId,
      },
    }
  );

  if (!endpoint) {
    throw new Error("Failed to upsert webhook endpoint");
  }

  await writeAuditEvent({
    action: "webhooks.endpoint.upsert",
    actorId: context.userId,
    actorType: "user",
    after: {},
    before: {},
    channel: "webhook",
    module: "system-admin",
    operationId: context.operationId,
    reason: "webhooks.endpoint.upsert",
    requestId: context.requestId ?? endpoint.id,
    route: SYSTEM_ADMIN_WEBHOOK_ROUTE,
    summary: `webhooks.endpoint.upsert executed for webhook-endpoint:${endpoint.id}`,
    targetId: endpoint.id,
    targetType: "webhook-endpoint",
    tenantId: context.tenantId,
  });

  return mapSystemAdminWebhookEndpoint(endpoint);
};
