import assert from "node:assert/strict";
import test from "node:test";

import { resolveTrustedWebhookTenantContext } from "../inbound/tenant-resolution.ts";

test("resolveTrustedWebhookTenantContext validates trusted tenant and company context", async () => {
  const context = await resolveTrustedWebhookTenantContext(
    {
      companyId: "company_1",
      endpointId: "endpoint_1",
      provider: "svix",
    },
    {
      resolveTenantId: (): string => "tenant_1",
      validateCompanyId: (tenantId: string, companyId: string): boolean =>
        tenantId === "tenant_1" && companyId === "company_1",
    }
  );

  assert.deepEqual(context, {
    companyId: "company_1",
    organizationId: undefined,
    tenantId: "tenant_1",
    workspaceId: undefined,
  });
});

test("resolveTrustedWebhookTenantContext rejects unsupported workspace context", async () => {
  await assert.rejects(
    resolveTrustedWebhookTenantContext(
      {
        endpointId: "endpoint_1",
        provider: "svix",
        workspaceId: "workspace_1",
      },
      {
        resolveTenantId: (): string => "tenant_1",
      }
    ),
    /workspace context is not supported/
  );
});
