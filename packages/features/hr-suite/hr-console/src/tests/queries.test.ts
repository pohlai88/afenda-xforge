import assert from "node:assert/strict";
import test from "node:test";
import { permissionCatalog } from "@repo/permissions";
import { listHrConsoleSections } from "../queries.ts";

test("hr console sections require resolved overview permission", async () => {
  await assert.rejects(
    () =>
      listHrConsoleSections(
        {},
        {
          companyId: "company_1",
          grantedPermissions: [],
          tenantId: "tenant_1",
          tenantRole: "member",
          userId: "user_1",
        },
        []
      ),
    /Missing required permission/
  );
});

test("hr console sections filter by granted capabilities", async () => {
  const sections = await listHrConsoleSections(
    {},
    {
      companyId: "company_1",
      grantedPermissions: [
        permissionCatalog.hrConsole.overviewRead,
        permissionCatalog.hrConsole.sectionsRead,
        permissionCatalog.hrConsole.delegationRead,
      ],
      tenantId: "tenant_1",
      tenantRole: "admin",
      userId: "admin_1",
    },
    []
  );

  assert.ok(sections.some((section) => section.domain === "leave"));
  assert.ok(sections.some((section) => section.domain === "delegation"));
});
