import assert from "node:assert/strict";
import test from "node:test";
import { readSystemAdminOverview } from "../queries.ts";

test("system admin overview denies users without admin permission", () => {
  assert.throws(
    () =>
      readSystemAdminOverview({
        grantedPermissions: [],
        tenantId: "tenant_1",
        userId: "user_1",
      }),
    /Missing required permission/
  );
});

test("system admin overview returns tenant-scoped sections", () => {
  const overview = readSystemAdminOverview({
    grantedPermissions: ["system-admin.overview.read"],
    tenantId: "tenant_1",
    userId: "user_1",
  });

  assert.equal(overview.tenantId, "tenant_1");
  assert.ok(overview.sections.length >= 1);
});
