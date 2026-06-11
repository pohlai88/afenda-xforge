import assert from "node:assert/strict";
import test from "node:test";
import { permissionCatalog } from "@repo/permissions";
import type { SystemAdminWebhookEndpointServiceDependencies } from "../webhook-endpoints.ts";
import { createSystemAdminWebhookEndpointService } from "../webhook-endpoints.ts";

const createDependencies = (
  overrides: SystemAdminWebhookEndpointServiceDependencies = {}
): SystemAdminWebhookEndpointServiceDependencies => ({
  listWebhookEndpoints: async () => [],
  upsertWebhookEndpoint: async () => ({
    applicationId: null,
    applicationName: null,
    companyId: null,
    endpointId: "endpoint_1",
    eventOwner: "system-admin",
    id: "row_1",
    provider: "stripe",
    schemaVersion: "2026-06-10",
    status: "active",
    tenantId: "tenant_1",
  }),
  validateCompanyInTenant: async () => true,
  writeAuditEvent: async () => undefined,
  ...overrides,
});

test("webhook listing denies callers without manage permission", async () => {
  const service = createSystemAdminWebhookEndpointService(createDependencies());

  await assert.rejects(
    () =>
      service.listSystemAdminWebhookEndpoints({
        grantedPermissions: [],
        tenantId: "tenant_1",
        userId: "user_1",
      }),
    /Missing required permission/
  );
});

test("webhook upsert fails closed when company is outside tenant scope", async () => {
  const service = createSystemAdminWebhookEndpointService(
    createDependencies({
      validateCompanyInTenant: async () => false,
    })
  );

  await assert.rejects(
    () =>
      service.upsertSystemAdminWebhookEndpoint(
        {
          companyId: "company_outside_tenant",
          endpointId: "endpoint_1",
          eventOwner: "system-admin",
          provider: "stripe",
          schemaVersion: "2026-06-10",
          secret: "secret",
        },
        {
          grantedPermissions: [permissionCatalog.systemAdmin.integrationsWrite],
          tenantId: "tenant_1",
          userId: "user_1",
        }
      ),
    /Webhook endpoint company scope is not trusted/
  );
});

test("webhook upsert writes audit evidence after successful upsert", async () => {
  const auditEvents: Array<{
    action: string;
    tenantId: string;
    targetId: string;
  }> = [];
  let receivedTenantId = "";

  const service = createSystemAdminWebhookEndpointService(
    createDependencies({
      upsertWebhookEndpoint: (_input, tenantId) => {
        receivedTenantId = tenantId;

        return Promise.resolve({
          applicationId: "app_1",
          applicationName: "Billing",
          companyId: "company_1",
          endpointId: "endpoint_1",
          eventOwner: "billing",
          id: "row_1",
          provider: "stripe",
          schemaVersion: "2026-06-10",
          status: "active",
          tenantId,
        });
      },
      writeAuditEvent: (event) => {
        auditEvents.push({
          action: event.action,
          targetId: event.targetId,
          tenantId: event.tenantId,
        });
      },
    })
  );

  const endpoint = await service.upsertSystemAdminWebhookEndpoint(
    {
      applicationId: "app_1",
      applicationName: "Billing",
      companyId: "company_1",
      endpointId: "endpoint_1",
      eventOwner: "billing",
      provider: "stripe",
      schemaVersion: "2026-06-10",
      secret: "secret",
    },
    {
      grantedPermissions: [permissionCatalog.systemAdmin.integrationsWrite],
      operationId: "op_1",
      requestId: "req_1",
      tenantId: "tenant_1",
      userId: "user_1",
    }
  );

  assert.equal(receivedTenantId, "tenant_1");
  assert.equal(endpoint.tenantId, "tenant_1");
  assert.equal(endpoint.companyId, "company_1");
  assert.deepEqual(auditEvents, [
    {
      action: "webhooks.endpoint.upsert",
      targetId: "row_1",
      tenantId: "tenant_1",
    },
  ]);
});

test("webhook listing stays tenant-scoped through dependency calls", async () => {
  const tenantIds: string[] = [];
  const service = createSystemAdminWebhookEndpointService(
    createDependencies({
      listWebhookEndpoints: (tenantId) => {
        tenantIds.push(tenantId);

        return Promise.resolve([
          {
            applicationId: null,
            applicationName: null,
            companyId: null,
            endpointId: "endpoint_1",
            eventOwner: "billing",
            id: "row_1",
            provider: "stripe",
            schemaVersion: "2026-06-10",
            status: "active",
            tenantId,
          },
        ]);
      },
    })
  );

  const endpoints = await service.listSystemAdminWebhookEndpoints({
    grantedPermissions: [permissionCatalog.systemAdmin.integrationsRead],
    tenantId: "tenant_1",
    userId: "user_1",
  });

  assert.deepEqual(tenantIds, ["tenant_1"]);
  assert.equal(endpoints.length, 1);
  assert.equal(endpoints[0]?.tenantId, "tenant_1");
});
