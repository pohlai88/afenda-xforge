import assert from "node:assert/strict";
import { test } from "node:test";
import { mapSearchDocumentToUpsert } from "@repo/search/postgres/internal";

const testTenantId = "11111111-1111-4111-8111-111111111111";

test("indexes auth tenantId separately from HR organizationId", () => {
  const mapped = mapSearchDocumentToUpsert("hr_employee_records", {
    id: "rec-1",
    tenantId: testTenantId,
    title: "Alpha Employee",
    description: "Employee record",
    url: "/hr",
    metadata: {
      organizationId: "org-1",
      employmentStatus: "active",
      recordType: "hrEmployeeRecord",
    },
  });

  assert.equal(mapped.tenantId, testTenantId);
  assert.equal(mapped.metadata.organizationId, "org-1");
  assert.equal(mapped.entityId, "rec-1");
});
