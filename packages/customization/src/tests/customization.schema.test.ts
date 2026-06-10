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

test("customizationSchema rejects unknown properties", () => {
  assert.throws(() => {
    customizationSchema.parse({
      ...validCustomization,
      unexpected: true,
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

test("customizationSchema still allows additive id migration fields", () => {
  const parsed = customizationSchema.parse({
    ...validCustomization,
    fields: [
      {
        id: "customer.records.fields.name",
        key: "name",
        label: "Customer Name",
      },
    ],
  });

  assert.equal(parsed.fields?.[0].id, "customer.records.fields.name");
});

test("customizationSchema enforces lifecycle actor metadata", () => {
  assert.throws(() => {
    customizationSchema.parse({
      ...validCustomization,
      status: "published",
      version: 1,
    });
  }, /requires/);

  const parsed = customizationSchema.parse({
    ...validCustomization,
    baseMetadataFingerprint: "customer.records@2026-06-09",
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
    updated: {
      at: "2026-06-09T00:00:00.000Z",
      by: "admin-user",
    },
  });

  assert.equal(parsed.status, "published");
  assert.equal(parsed.version, 1);
});

test("customizationSchema accepts rollback metadata for rollback-ready versions", () => {
  const parsed = customizationSchema.parse({
    ...validCustomization,
    baseMetadataFingerprint: "customer.records@2026-06-09",
    created: {
      at: "2026-06-09T00:00:00.000Z",
      by: "admin-user",
    },
    updated: {
      at: "2026-06-09T00:00:00.000Z",
      by: "admin-user",
    },
    rolledBack: {
      at: "2026-06-09T00:00:00.000Z",
      by: "admin-user",
      fromVersion: 2,
    },
    status: "published",
    version: 3,
    published: {
      at: "2026-06-09T00:00:00.000Z",
      by: "admin-user",
    },
  });

  assert.equal(parsed.rolledBack?.fromVersion, 2);
});

test("customizationSchema rejects duplicate layout references", () => {
  assert.throws(() => {
    customizationSchema.parse({
      ...validCustomization,
      forms: [
        {
          key: "customer-form",
          sectionKeys: ["general", "general"],
        },
      ],
    });
  }, /duplicate form section reference/);

  assert.throws(() => {
    customizationSchema.parse({
      ...validCustomization,
      sections: [
        {
          key: "general",
          fieldKeys: ["name", "name"],
        },
      ],
    });
  }, /duplicate section field reference/);
});

test("customizationSchema enforces lifecycle chronology and rollback version ordering", () => {
  assert.throws(() => {
    customizationSchema.parse({
      ...validCustomization,
      baseMetadataFingerprint: "customer.records@2026-06-09",
      created: {
        at: "2026-06-09T02:00:00.000Z",
        by: "admin-user",
      },
      updated: {
        at: "2026-06-09T01:00:00.000Z",
        by: "admin-user",
      },
      published: {
        at: "2026-06-09T03:00:00.000Z",
        by: "admin-user",
      },
      status: "published",
      version: 2,
    });
  }, /updated timestamp cannot be earlier than created timestamp/);

  assert.throws(() => {
    customizationSchema.parse({
      ...validCustomization,
      baseMetadataFingerprint: "customer.records@2026-06-09",
      created: {
        at: "2026-06-09T00:00:00.000Z",
        by: "admin-user",
      },
      updated: {
        at: "2026-06-09T01:00:00.000Z",
        by: "admin-user",
      },
      published: {
        at: "2026-06-09T01:00:00.000Z",
        by: "admin-user",
      },
      rolledBack: {
        at: "2026-06-09T02:00:00.000Z",
        by: "admin-user",
        fromVersion: 2,
      },
      status: "published",
      version: 2,
    });
  }, /rollback fromVersion must be earlier than the published version/);
});
