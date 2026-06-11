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
import type { SystemAdminScope } from "../../../schema.ts";
import type { integrationCapabilities } from "../contract.ts";

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

type WebhookEndpointRow = {
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
};

export type SystemAdminWebhookEndpointServiceDependencies = {
  listWebhookEndpoints?: (tenantId: string) => Promise<WebhookEndpointRow[]>;
  upsertWebhookEndpoint?: (
    input: UpsertSystemAdminWebhookEndpointInput,
    tenantId: string
  ) => Promise<WebhookEndpointRow | undefined>;
  validateCompanyInTenant?: (
    tenantId: string,
    companyId: string
  ) => Promise<boolean>;
  writeAuditEvent?: (
    event: Parameters<typeof writeAuditEvent>[0]
  ) => Promise<unknown> | unknown;
};

const requireWebhookAdministrationPermission = (
  permission:
    | typeof integrationCapabilities.integrationsRead
    | typeof integrationCapabilities.integrationsWrite,
  context: SystemAdminScope
): void => {
  requirePermission(
    {
      action: permission,
      actorId: context.userId,
      companyId: context.companyId,
      grantedPermissions: context.grantedPermissions,
      metadata: {
        feature: "system-admin.control-plane",
      },
      resource: "system-admin.integrations",
      tenantId: context.tenantId,
    },
    {
      allOf: [permission],
    }
  );
};

const mapSystemAdminWebhookEndpoint = (
  row: WebhookEndpointRow
): SystemAdminWebhookEndpoint => ({
  ...(row.applicationId ? { applicationId: row.applicationId } : {}),
  ...(row.applicationName ? { applicationName: row.applicationName } : {}),
  ...(row.companyId ? { companyId: row.companyId } : {}),
  endpointId: row.endpointId,
  eventOwner: row.eventOwner,
  id: row.id,
  provider: row.provider,
  schemaVersion: row.schemaVersion,
  status: row.status,
  tenantId: row.tenantId,
});

const defaultDependencies: Required<SystemAdminWebhookEndpointServiceDependencies> =
  {
    listWebhookEndpoints: async (tenantId) =>
      timeDatabaseQuery(
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
            .where(eq(webhookEndpoints.tenantId, tenantId)),
        {
          operation: "select",
          resource: "webhook_endpoints",
          metadata: {
            tenantId,
          },
        }
      ),
    upsertWebhookEndpoint: async (input, tenantId) => {
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
              tenantId,
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
            tenantId,
          },
        }
      );

      return endpoint;
    },
    validateCompanyInTenant: async (tenantId, companyId) => {
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
    },
    writeAuditEvent,
  };

export const createSystemAdminWebhookEndpointService = (
  dependencies: SystemAdminWebhookEndpointServiceDependencies = {}
) => {
  const resolved = {
    ...defaultDependencies,
    ...dependencies,
  };

  return {
    listSystemAdminWebhookEndpoints: async (
      context: SystemAdminScope
    ): Promise<SystemAdminWebhookEndpoint[]> => {
      requireWebhookAdministrationPermission(
        permissionCatalog.systemAdmin.integrationsRead,
        context
      );
      const endpoints = await resolved.listWebhookEndpoints(context.tenantId);
      return endpoints.map(mapSystemAdminWebhookEndpoint);
    },
    upsertSystemAdminWebhookEndpoint: async (
      input: UpsertSystemAdminWebhookEndpointInput,
      context: SystemAdminScope
    ): Promise<SystemAdminWebhookEndpoint> => {
      requireWebhookAdministrationPermission(
        permissionCatalog.systemAdmin.integrationsWrite,
        context
      );

      if (
        input.companyId &&
        !(await resolved.validateCompanyInTenant(
          context.tenantId,
          input.companyId
        ))
      ) {
        throw new Error("Webhook endpoint company scope is not trusted");
      }

      const endpoint = await resolved.upsertWebhookEndpoint(
        input,
        context.tenantId
      );

      if (!endpoint) {
        throw new Error("Failed to upsert webhook endpoint");
      }

      await resolved.writeAuditEvent({
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
    },
  };
};

const defaultWebhookEndpointService = createSystemAdminWebhookEndpointService();

export const listSystemAdminWebhookEndpoints =
  defaultWebhookEndpointService.listSystemAdminWebhookEndpoints;

export const upsertSystemAdminWebhookEndpoint =
  defaultWebhookEndpointService.upsertSystemAdminWebhookEndpoint;
