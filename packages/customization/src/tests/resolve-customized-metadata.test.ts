import assert from "node:assert/strict";
import test from "node:test";

import type { EntityMetadata, MetadataFeatureContract } from "@repo/metadata";

import type { CustomizationContract } from "../contracts/customization.contract.ts";
import {
  resolveCustomizedEntityMetadata,
  resolveCustomizedMetadata,
} from "../resolution/resolve-customized-metadata.ts";
import {
  resolveLayeredCustomizedEntityMetadata,
  resolveLayeredCustomizedMetadata,
} from "../resolution/resolve-layered-customization.ts";
import {
  createCustomizationFixture,
  deserializeCustomizationFixture,
  serializeCustomizationFixture,
} from "../serialization/customization-fixture.ts";
import {
  assertCustomizationMatchesMetadata,
  validateCustomizationAgainstMetadata,
} from "../validation/validate-customization-against-metadata.ts";

const customerMetadata: MetadataFeatureContract = {
  id: "customer.records",
  entity: "customer",
  title: "Customer Records",
  labels: {
    singular: "Customer",
    plural: "Customers",
  },
  presentation: {
    density: "default",
    tone: "neutral",
  },
  fields: [
    {
      key: "name",
      label: "Name",
      kind: "text",
      required: true,
    },
    {
      key: "status",
      label: "Status",
      kind: "select",
    },
  ],
  sections: [
    {
      key: "general",
      label: "General",
      fieldKeys: ["name", "status"],
      columns: 2,
    },
  ],
  forms: [
    {
      key: "customer-form",
      label: "Customer form",
      fieldKeys: ["name", "status"],
      layout: "grid",
    },
  ],
  tables: [
    {
      key: "customer-table",
      title: "Customers",
      columns: [
        {
          key: "name",
          label: "Name",
          field: "name",
          sortable: true,
          width: "lg",
        },
        {
          key: "status",
          label: "Status",
          field: "status",
          width: "sm",
        },
      ],
      supports: {
        emptyState: true,
        filtering: true,
        pagination: true,
        permissionAwareActions: true,
        rowActions: true,
        sorting: true,
      },
    },
  ],
  actions: [
    {
      key: "save",
      label: "Save",
      kind: "update",
      placement: "primary",
    },
  ],
};

const tenantCustomization: CustomizationContract = {
  id: "customer.records.tenant-acme",
  tenantId: "tenant-acme",
  featureId: "customer.records",
  entity: "customer",
  scope: "tenant",
  title: "Accounts",
  presentation: {
    density: "compact",
    tone: "info",
  },
  fields: [
    {
      key: "status",
      hidden: true,
    },
    {
      key: "name",
      label: "Account Name",
      order: 1,
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
  forms: [
    {
      key: "customer-form",
      layout: "stack",
    },
  ],
  tables: [
    {
      key: "customer-table",
      title: "Accounts",
      columns: [
        {
          key: "status",
          hidden: true,
        },
        {
          key: "name",
          label: "Account Name",
          width: "auto",
        },
      ],
    },
  ],
  table: {
    title: "Accounts",
    defaultSort: "name",
    columns: [
      {
        key: "status",
        hidden: true,
      },
      {
        key: "name",
        label: "Account Name",
        width: "auto",
      },
    ],
  },
  actions: [
    {
      key: "save",
      label: "Save account",
      placement: "secondary",
    },
  ],
};

test("resolveCustomizedMetadata applies governed tenant overrides", () => {
  const resolved = resolveCustomizedMetadata(
    customerMetadata,
    tenantCustomization
  );

  assert.equal(resolved.title, "Accounts");
  assert.equal(resolved.presentation?.density, "compact");
  assert.equal(resolved.presentation?.tone, "info");
  assert.equal(resolved.fields?.length, 1);
  assert.equal(resolved.fields?.[0].label, "Account Name");
  assert.deepEqual(resolved.sections?.[0].fieldKeys, ["name"]);
  assert.equal(resolved.sections?.[0].columns, 1);
  assert.equal(resolved.forms?.[0].layout, "stack");
  assert.equal(resolved.tables?.[0].title, "Accounts");
  assert.equal(resolved.tables?.[0].columns.length, 1);
  assert.equal(resolved.tables?.[0].columns[0].width, "auto");
  assert.equal(resolved.actions?.[0].label, "Save account");
  assert.equal(resolved.actions?.[0].placement, "secondary");
});

test("resolveCustomizedMetadata refuses mismatched feature overlays", () => {
  assert.throws(() => {
    resolveCustomizedMetadata(customerMetadata, {
      ...tenantCustomization,
      featureId: "supplier.records",
    });
  }, /featureId/);

  assert.throws(() => {
    resolveCustomizedMetadata(customerMetadata, {
      ...tenantCustomization,
      entity: "supplier",
    });
  }, /entity/);
});

test("resolveCustomizedEntityMetadata applies current entity metadata overrides", () => {
  const entityMetadata: EntityMetadata = {
    id: customerMetadata.id,
    entity: customerMetadata.entity,
    title: customerMetadata.title,
    labels: customerMetadata.labels,
    presentation: customerMetadata.presentation,
    fields: customerMetadata.fields,
    sections: customerMetadata.sections,
    forms: customerMetadata.forms,
    actions: customerMetadata.actions,
    table: {
      defaultSort: "status",
      title: "Customer directory",
      columns: [
        {
          key: "name",
          label: "Name",
          field: "name",
          sortable: true,
          width: "lg",
        },
        {
          key: "status",
          label: "Status",
          field: "status",
          width: "sm",
        },
      ],
    },
  };

  const resolved = resolveCustomizedEntityMetadata(
    entityMetadata,
    tenantCustomization
  );

  assert.equal(resolved.table?.title, "Accounts");
  assert.equal(resolved.table?.defaultSort, "name");
  assert.equal(resolved.table?.columns.length, 1);
  assert.equal(resolved.table?.columns[0].label, "Account Name");
});

test("validateCustomizationAgainstMetadata reports unsafe metadata drift", () => {
  const result = validateCustomizationAgainstMetadata(
    {
      ...tenantCustomization,
      fields: [
        {
          key: "unknown-field",
          label: "Unknown",
        },
        {
          key: "name",
          hidden: true,
        },
      ],
      sections: [
        {
          key: "general",
          fieldKeys: ["unknown-field"],
        },
      ],
      table: {
        defaultSort: "unknown-sort",
        columns: [
          {
            key: "unknown-column",
          },
        ],
      },
    },
    {
      id: customerMetadata.id,
      entity: customerMetadata.entity,
      labels: customerMetadata.labels,
      fields: customerMetadata.fields,
      sections: customerMetadata.sections,
      table: {
        defaultSort: "status",
        columns: [
          {
            key: "name",
            label: "Name",
            field: "name",
            sortable: true,
          },
          {
            key: "status",
            label: "Status",
            field: "status",
          },
        ],
      },
    }
  );

  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some((issue) => issue.code === "customization.unknown_key")
  );
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "customization.hidden_required_field"
    )
  );
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "customization.invalid_default_sort"
    )
  );
});

test("assertCustomizationMatchesMetadata accepts compatible customization", () => {
  assert.equal(
    assertCustomizationMatchesMetadata(tenantCustomization, customerMetadata),
    tenantCustomization
  );
});

test("resolveLayeredCustomizedMetadata applies published tenant before company", () => {
  const publishedAt = {
    at: "2026-06-09T00:00:00.000Z",
    by: "admin-user",
  };
  const publishedTenant: CustomizationContract = {
    ...tenantCustomization,
    published: publishedAt,
    status: "published",
    version: 1,
  };
  const publishedCompany: CustomizationContract = {
    ...tenantCustomization,
    actions: [
      {
        key: "save",
        label: "Save company account",
      },
    ],
    companyId: "company-main",
    fields: [
      {
        key: "name",
        label: "Company Account Name",
      },
    ],
    id: "customer.records.company-main",
    published: publishedAt,
    scope: "company",
    status: "published",
    title: "Company Accounts",
    version: 1,
  };

  const resolved = resolveLayeredCustomizedMetadata(
    customerMetadata,
    {
      company: publishedCompany,
      tenant: publishedTenant,
    },
    {
      companyAware: true,
    }
  );

  assert.equal(resolved.title, "Company Accounts");
  assert.equal(resolved.fields?.[0].label, "Company Account Name");
  assert.equal(resolved.actions?.[0].label, "Save company account");
});

test("resolveLayeredCustomizedEntityMetadata ignores drafts outside preview", () => {
  const draftTenant: CustomizationContract = {
    ...tenantCustomization,
    status: "draft",
    title: "Draft Accounts",
    version: 1,
  };
  const entityMetadata: EntityMetadata = {
    actions: customerMetadata.actions,
    id: customerMetadata.id,
    entity: customerMetadata.entity,
    fields: customerMetadata.fields,
    forms: customerMetadata.forms,
    labels: customerMetadata.labels,
    sections: customerMetadata.sections,
    title: customerMetadata.title,
  };

  const runtimeResolved = resolveLayeredCustomizedEntityMetadata(
    entityMetadata,
    {
      tenant: draftTenant,
    }
  );
  const previewResolved = resolveLayeredCustomizedEntityMetadata(
    entityMetadata,
    {
      tenant: draftTenant,
    },
    {
      includeDraftsForPreview: true,
    }
  );

  assert.equal(runtimeResolved.title, "Customer Records");
  assert.equal(previewResolved.title, "Draft Accounts");
});

test("customization fixtures serialize deterministically", () => {
  const fixture = createCustomizationFixture({
    customization: tenantCustomization,
    exportedAt: "2026-06-09T00:00:00.000Z",
    exportedBy: "admin-user",
  });
  const serialized = serializeCustomizationFixture(fixture);
  const deserialized = deserializeCustomizationFixture(serialized);

  assert.equal(deserialized.schemaVersion, 1);
  assert.deepEqual(deserialized, fixture);
  assert.ok(serialized.endsWith("\n"));
});
