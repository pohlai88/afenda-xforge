import assert from "node:assert/strict";
import test from "node:test";

import { customizationSchema } from "../schemas/customization.schema.ts";
import { assertCustomizationContract } from "../validation/assert-customization-contract.ts";
import { parseCustomization } from "../validation/parse-customization.ts";

const validCustomization = {
  id: "customer.records.customization",
  tenantId: "tenant-acme",
  featureId: "customer.records",
  entity: "customer",
  scope: "tenant",
  title: "Tenant Customer Layout",
  description: "Safe tenant-level UI overrides for the customer feature.",
  presentation: {
    density: "compact",
    tone: "info",
    variant: "outline",
  },
  fields: [
    {
      key: "name",
      label: "Customer Name",
      order: 1,
    },
    {
      key: "status",
      hidden: true,
    },
  ],
  forms: [
    {
      key: "customer-form",
      layout: "stack",
      sectionKeys: ["general"],
    },
  ],
  sections: [
    {
      key: "general",
      label: "Profile",
      fieldKeys: ["name"],
      columns: 1,
    },
  ],
  tables: [
    {
      key: "customer-table",
      columns: [
        {
          key: "name",
          label: "Customer Name",
          order: 1,
          width: "lg",
        },
      ],
    },
  ],
  table: {
    defaultSort: "name",
    title: "Tenant customer table",
    columns: [
      {
        key: "name",
        label: "Customer Name",
      },
    ],
  },
  filters: [
    {
      key: "status-filter",
      label: "Status",
    },
  ],
  actions: [
    {
      key: "save",
      label: "Save",
      placement: "primary",
    },
  ],
} as const;

test("customizationSchema parses a valid tenant override contract", () => {
  const parsed = customizationSchema.parse(validCustomization);

  assert.equal(parsed.scope, "tenant");
  assert.equal(parsed.fields?.[0].label, "Customer Name");
  assert.equal(parsed.tables?.[0].columns?.[0].width, "lg");
});

test("parseCustomization and assertCustomizationContract return the same contract", () => {
  const parsed = parseCustomization(validCustomization);
  const asserted = assertCustomizationContract(validCustomization);

  assert.deepEqual(asserted, parsed);
});

test("customizationSchema rejects empty tenant ids", () => {
  assert.throws(() => {
    customizationSchema.parse({
      ...validCustomization,
      tenantId: "",
    });
  });
});

test("customizationSchema rejects unsupported scopes", () => {
  assert.throws(() => {
    customizationSchema.parse({
      ...validCustomization,
      scope: "global",
    });
  });
});

test("customizationSchema requires companyId for company scope", () => {
  assert.throws(() => {
    customizationSchema.parse({
      ...validCustomization,
      scope: "company",
    });
  });

  const parsed = customizationSchema.parse({
    ...validCustomization,
    companyId: "company-main",
    scope: "company",
  });

  assert.equal(parsed.companyId, "company-main");
});

test("customizationSchema rejects companyId for tenant scope", () => {
  assert.throws(() => {
    customizationSchema.parse({
      ...validCustomization,
      companyId: "company-main",
    });
  });
});

test("customizationSchema rejects duplicate override keys", () => {
  assert.throws(() => {
    customizationSchema.parse({
      ...validCustomization,
      fields: [
        {
          key: "name",
          label: "Customer Name",
        },
        {
          key: "name",
          label: "Account Name",
        },
      ],
    });
  });
});

test("customizationSchema enforces lifecycle actor metadata", () => {
  assert.throws(() => {
    customizationSchema.parse({
      ...validCustomization,
      status: "published",
      version: 1,
    });
  }, /published customization requires published actor metadata/);

  const parsed = customizationSchema.parse({
    ...validCustomization,
    status: "published",
    version: 1,
    created: {
      at: "2026-06-09T00:00:00.000Z",
      by: "admin-user",
    },
    published: {
      at: "2026-06-09T00:00:00.000Z",
      by: "admin-user",
    },
  });

  assert.equal(parsed.status, "published");
  assert.equal(parsed.version, 1);
});
