import assert from "node:assert/strict";
import test from "node:test";
import { createTrustedTenantContext } from "@repo/auth/trusted";
import { ForbiddenError } from "@repo/errors";

process.env.DATABASE_URL ??=
  "postgres://postgres:postgres@localhost:5432/postgres";

test("customers list denies trusted context without read permission", async () => {
  const { listCustomers } = await import("../src/server.ts");

  await assert.rejects(
    () =>
      listCustomers(
        {
          page: 1,
          pageSize: 5,
        },
        {
          tenantId: "tenant-1",
          trustedSystem: createTrustedTenantContext({
            reason: "test",
            tenantId: "tenant-1",
          }),
          userId: "system:test",
        }
      ),
    ForbiddenError
  );
});

test("customer create validates body before execution", async () => {
  const { createCustomer } = await import("../src/server.ts");

  assert.throws(
    () =>
      createCustomer(
        {
          code: "",
          name: "",
        },
        {
          grantedPermissions: ["master-data.customers:write"],
          tenantId: "tenant-1",
          trustedSystem: createTrustedTenantContext({
            reason: "test",
            tenantId: "tenant-1",
          }),
          userId: "system:test",
        }
      ),
    /Too small/
  );
});

test("customer create denies trusted context without write permission", async () => {
  const { createCustomer } = await import("../src/server.ts");

  await assert.rejects(
    () =>
      createCustomer(
        {
          code: "ACME",
          name: "Acme",
        },
        {
          tenantId: "tenant-1",
          trustedSystem: createTrustedTenantContext({
            channel: "webhook",
            reason: "test",
            tenantId: "tenant-1",
          }),
          userId: "system:webhook",
        }
      ),
    ForbiddenError
  );
});
