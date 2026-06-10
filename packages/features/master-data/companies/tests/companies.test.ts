import assert from "node:assert/strict";
import test from "node:test";
import { createTrustedTenantContext } from "@repo/auth/trusted";
import { ForbiddenError } from "@repo/errors";
import { buildCompanyHierarchy } from "../src/hierarchy.ts";
import type { Company } from "../src/schema.ts";
import { createCompanyBodySchema } from "../src/schema.ts";

process.env.DATABASE_URL ??=
  "postgres://postgres:postgres@localhost:5432/postgres";

const createCompanyRecord = (
  overrides: Partial<Company> & Pick<Company, "code" | "id" | "name">
): Company => ({
  isGroup: false,
  status: "active",
  ...overrides,
});

test("company create schema keeps required fields backward compatible", () => {
  const parsed = createCompanyBodySchema.parse({
    code: " ACME ",
    countryCode: "us",
    currencyCode: "usd",
    email: "ADMIN@EXAMPLE.COM",
    name: "Acme",
  });

  assert.equal(parsed.code, "ACME");
  assert.equal(parsed.countryCode, "US");
  assert.equal(parsed.currencyCode, "USD");
  assert.equal(parsed.email, "admin@example.com");
  assert.equal(parsed.isGroup, false);
  assert.equal(parsed.status, "active");
});

test("company create schema rejects invalid legal/contact fields", () => {
  assert.throws(() =>
    createCompanyBodySchema.parse({
      code: "ACME",
      countryCode: "USA",
      email: "not-an-email",
      name: "Acme",
      status: "retired",
      website: "not-a-url",
    })
  );
});

test("companies list denies trusted context without read permission", async () => {
  const { listCompanies } = await import("../src/server.ts");

  await assert.rejects(
    () =>
      listCompanies(
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

test("company create validates body before execution", async () => {
  const { createCompany } = await import("../src/server.ts");

  assert.throws(
    () =>
      createCompany(
        {
          code: "",
          name: "",
        },
        {
          grantedPermissions: ["master-data.companies:write"],
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

test("company mutations deny trusted context without write permission", async () => {
  const { archiveCompany, createCompany, restoreCompany } = await import(
    "../src/server.ts"
  );
  const trustedSystem = createTrustedTenantContext({
    channel: "webhook",
    reason: "test",
    tenantId: "tenant-1",
  });

  await assert.rejects(
    () =>
      createCompany(
        {
          code: "ACME",
          name: "Acme",
        },
        {
          tenantId: "tenant-1",
          trustedSystem,
          userId: "system:test",
        }
      ),
    ForbiddenError
  );
  await assert.rejects(
    () =>
      archiveCompany(
        {
          companyId: "company-1",
        },
        {
          tenantId: "tenant-1",
          trustedSystem,
          userId: "system:test",
        }
      ),
    ForbiddenError
  );
  await assert.rejects(
    () =>
      restoreCompany(
        {
          companyId: "company-1",
        },
        {
          tenantId: "tenant-1",
          trustedSystem,
          userId: "system:test",
        }
      ),
    ForbiddenError
  );
});

test("company hierarchy builds root and subtree projections", () => {
  const records = [
    createCompanyRecord({
      code: "ROOT",
      id: "root",
      isGroup: true,
      name: "Root",
    }),
    createCompanyRecord({
      code: "CHILD",
      id: "child",
      name: "Child",
      parentCompanyId: "root",
    }),
    createCompanyRecord({
      code: "GRAND",
      id: "grand",
      name: "Grandchild",
      parentCompanyId: "child",
    }),
    createCompanyRecord({ code: "SIDE", id: "side", name: "Side" }),
  ];

  const roots = buildCompanyHierarchy(records);
  assert.deepEqual(
    roots.map((node) => node.id),
    ["root", "side"]
  );
  assert.equal(roots[0]?.children[0]?.id, "child");
  assert.equal(roots[0]?.children[0]?.children[0]?.id, "grand");

  const subtree = buildCompanyHierarchy(records, "root");
  assert.deepEqual(
    subtree.map((node) => node.id),
    ["child"]
  );
});
