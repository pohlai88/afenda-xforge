import assert from "node:assert/strict";
import test from "node:test";
import { listSystemAdminSections } from "../queries.ts";

test("system admin includes module consoles section", () => {
  const sections = listSystemAdminSections(
    {},
    {
      grantedPermissions: ["system-admin.overview.read"],
      tenantId: "tenant_1",
      userId: "user_1",
    }
  );

  assert.ok(
    sections.some((section) => section.domain === "module-consoles")
  );
});
