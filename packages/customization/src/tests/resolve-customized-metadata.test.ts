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
  resolvePreviewCustomizationLayers,
  resolvePreviewCustomizedEntityMetadataResult,
  resolvePreviewCustomizedMetadataResult,
  resolvePublishedCustomizedEntityMetadataResult,
  resolvePublishedCustomizedMetadataResult,
} from "../resolution/resolve-layered-customization.ts";
import {
  assertCustomizationFixtureMatchesMetadata,
  createCustomizationFixture,
  deserializeCustomizationFixture,
  reviewCustomizationFixtureImport,
  serializeCustomizationFixture,
  validateCustomizationFixtureAgainstMetadata,
} from "../serialization/customization-fixture.ts";
import {
  assertCustomizationMatchesMetadata,
  validateCustomizationAgainstMetadata,
} from "../validation/validate-customization-against-metadata.ts";

const customerMetadata: MetadataFeatureContract = {
  id: "customer.records",
  customization: {
    presentation: {
      density: true,
      tone: true,
    },
    scopes: ["tenant", "company"],
  },
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
      customization: {
        label: true,
        order: true,
      },
      id: "customer.records.fields.name",
      key: "name",
      label: "Name",
      kind: "text",
      required: true,
    },
    {
      customization: {
        hidden: "allow-required",
      },
      id: "customer.records.fields.status",
      key: "status",
      label: "Status",
      kind: "select",
    },
  ],
  sections: [
    {
      customization: {
        columns: true,
        fieldKeys: true,
        label: true,
      },
      id: "customer.records.sections.general",
      key: "general",
      label: "General",
      fieldKeys: ["name", "status"],
      columns: 2,
    },
  ],
  forms: [
    {
      customization: {
        layout: true,
      },
      id: "customer.records.forms.customer-form",
      key: "customer-form",
      label: "Customer form",
      fieldKeys: ["name", "status"],
      layout: "grid",
    },
  ],
  tables: [
    {
      customization: {
        columns: true,
        title: true,
      },
      id: "customer.records.tables.customer-table",
      key: "customer-table",
      title: "Customers",
      columns: [
        {
          customization: {
            label: true,
            width: true,
          },
          id: "customer.records.tables.customer-table.columns.name",
          key: "name",
          label: "Name",
          field: "name",
          sortable: true,
          width: "lg",
        },
        {
          customization: {
            hidden: true,
          },
          id: "customer.records.tables.customer-table.columns.status",
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
      customization: {
        label: true,
        placement: true,
        safe: true,
      },
      id: "customer.records.actions.save",
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
  const originalMetadata = structuredClone(customerMetadata);
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
  assert.deepEqual(customerMetadata, originalMetadata);
});

test("resolveCustomizedMetadata keeps equal-order field overrides deterministic", () => {
  const resolved = resolveCustomizedMetadata(
    customerMetadata,
    {
      ...tenantCustomization,
      actions: undefined,
      fields: [
        {
          id: "customer.records.fields.status",
          key: "status",
          order: 1,
        },
        {
          id: "customer.records.fields.name",
          key: "name",
          order: 1,
        },
      ],
      forms: undefined,
      sections: undefined,
      tables: undefined,
    },
    {
      validate: false,
    }
  );

  assert.deepEqual(
    resolved.fields?.map((field) => field.key),
    ["name", "status"]
  );
});

test("resolveCustomizedMetadata matches overrides by stable metadata node id", () => {
  const resolved = resolveCustomizedMetadata(customerMetadata, {
    ...tenantCustomization,
    fields: [
      {
        id: "customer.records.fields.name",
        key: "legacy-name-key",
        label: "Canonical Account Name",
      },
    ],
    sections: undefined,
    forms: undefined,
    tables: undefined,
    actions: undefined,
  });

  assert.equal(resolved.fields?.[0].label, "Canonical Account Name");
});

test("resolveCustomizedMetadata removes hidden field references from sections and forms", () => {
  const resolved = resolveCustomizedMetadata(customerMetadata, {
    ...tenantCustomization,
    fields: [
      {
        key: "status",
        hidden: true,
      },
    ],
    forms: undefined,
    sections: undefined,
  });

  assert.deepEqual(resolved.sections?.[0].fieldKeys, ["name"]);
  assert.deepEqual(resolved.forms?.[0].fieldKeys, ["name"]);
});

test("resolveCustomizedMetadata prunes empty sections from form references", () => {
  const resolved = resolveCustomizedMetadata(
    {
      ...customerMetadata,
      fields: customerMetadata.fields?.map((field) =>
        field.key === "name"
          ? {
              ...field,
              customization: {
                ...field.customization,
                hidden: "allow-required",
              },
            }
          : field
      ),
      forms: customerMetadata.forms?.map((form) => ({
        ...form,
        customization: {
          ...form.customization,
          sectionKeys: true,
        },
      })),
    },
    {
      ...tenantCustomization,
      fields: [
        {
          key: "name",
          hidden: true,
        },
        {
          key: "status",
          hidden: true,
        },
      ],
      forms: [
        {
          key: "customer-form",
          sectionKeys: ["general"],
        },
      ],
      sections: undefined,
    }
  );

  assert.deepEqual(resolved.sections, []);
  assert.deepEqual(resolved.forms?.[0].sectionKeys, []);
  assert.deepEqual(resolved.forms?.[0].fieldKeys, []);
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

test("resolveCustomizedMetadata rejects malformed customization contracts before merge", () => {
  assert.throws(() => {
    resolveCustomizedMetadata(customerMetadata, {
      ...tenantCustomization,
      fields: [
        {
          key: "name",
        },
        {
          key: "name",
        },
      ],
    } as unknown as CustomizationContract);
  }, /duplicate override key/);
});

test("resolveCustomizedEntityMetadata applies current entity metadata overrides", () => {
  const entityMetadata: EntityMetadata = {
    customization: customerMetadata.customization,
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
      customization: {
        columns: true,
        defaultSort: true,
        title: true,
      },
      defaultSort: "status",
      title: "Customer directory",
      columns: [
        {
          customization: {
            label: true,
            width: true,
          },
          key: "name",
          label: "Name",
          field: "name",
          sortable: true,
          width: "lg",
        },
        {
          customization: {
            hidden: true,
          },
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
      customization: customerMetadata.customization,
      entity: customerMetadata.entity,
      labels: customerMetadata.labels,
      fields: customerMetadata.fields?.map((field) =>
        field.key === "name"
          ? {
              ...field,
              customization: {
                ...field.customization,
                hidden: "allow",
              },
            }
          : field
      ),
      sections: customerMetadata.sections,
      table: {
        customization: {
          columns: true,
          defaultSort: true,
          title: true,
        },
        defaultSort: "status",
        columns: [
          {
            customization: {
              label: true,
            },
            key: "name",
            label: "Name",
            field: "name",
            sortable: true,
          },
          {
            customization: {
              hidden: true,
            },
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

test("validateCustomizationAgainstMetadata denies policy-less sensitive overrides", () => {
  const result = validateCustomizationAgainstMetadata(
    {
      ...tenantCustomization,
      actions: [
        {
          key: "save",
          label: "Save account",
        },
      ],
      presentation: {
        density: "compact",
      },
    },
    {
      ...customerMetadata,
      actions: customerMetadata.actions?.map((action) => ({
        ...action,
        customization: undefined,
      })),
      customization: {
        presentation: {},
        scopes: ["tenant"],
      },
    }
  );

  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some((issue) => issue.code === "customization.unsafe_action")
  );
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "customization.override_not_allowed"
    )
  );
});

test("validateCustomizationAgainstMetadata distinguishes unknown ids, key drift, and tenant scope policy errors", () => {
  const result = validateCustomizationAgainstMetadata(
    {
      ...tenantCustomization,
      fields: [
        {
          id: "customer.records.fields.name",
          key: "legacy-name-key",
          label: "Canonical Account Name",
        },
        {
          id: "customer.records.fields.missing",
          key: "name",
          label: "Broken override",
        },
      ],
      actions: undefined,
      sections: undefined,
      tables: undefined,
    },
    {
      ...customerMetadata,
      customization: {
        ...customerMetadata.customization,
        scopes: ["company"],
      },
    }
  );

  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.code === "customization.node_renamed" &&
        issue.metadataNodeId === "customer.records.fields.name" &&
        issue.targetNodeKey === "legacy-name-key"
    )
  );
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.code === "customization.node_removed" &&
        issue.targetNodeId === "customer.records.fields.missing"
    )
  );
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "customization.tenant_scope_not_allowed"
    )
  );
});

test("validateCustomizationAgainstMetadata rejects duplicate canonical targets", () => {
  const result = validateCustomizationAgainstMetadata(
    {
      ...tenantCustomization,
      actions: undefined,
      fields: [
        {
          id: "customer.records.fields.name",
          key: "name",
          label: "Customer Name",
        },
        {
          id: "customer.records.fields.name",
          key: "legacy-name-key",
          description: "Duplicate canonical target",
        },
      ],
      filters: undefined,
      forms: undefined,
      sections: undefined,
      tables: undefined,
    },
    customerMetadata
  );

  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.code === "customization.duplicate_target" &&
        issue.metadataNodeId === "customer.records.fields.name"
    )
  );
});

test("validateCustomizationAgainstMetadata rejects unsupported table surfaces", () => {
  const noTableMetadata: EntityMetadata = {
    actions: customerMetadata.actions,
    entity: customerMetadata.entity,
    fields: customerMetadata.fields,
    filters: customerMetadata.filters,
    forms: customerMetadata.forms,
    id: customerMetadata.id,
    labels: customerMetadata.labels,
    sections: customerMetadata.sections,
    title: customerMetadata.title,
  };

  const result = validateCustomizationAgainstMetadata(
    {
      ...tenantCustomization,
      table: {
        defaultSort: "name",
        columns: [
          {
            key: "name",
            label: "Account Name",
          },
        ],
      },
      tables: [
        {
          key: "customer-table",
        },
      ],
    },
    noTableMetadata,
    {
      rejectUnsupportedMetadataSurfaces: true,
    }
  );

  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "customization.entity_table_not_supported"
    )
  );
  assert.ok(
    result.issues.some((issue) => issue.code === "customization.unknown_key")
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
    baseMetadataFingerprint: "customer.records@2026-06-09",
    created: publishedAt,
    published: publishedAt,
    status: "published",
    updated: publishedAt,
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
    baseMetadataFingerprint: "customer.records@2026-06-09",
    companyId: "company-main",
    created: publishedAt,
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
    updated: publishedAt,
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
    actions: undefined,
    fields: undefined,
    forms: undefined,
    presentation: undefined,
    sections: undefined,
    table: undefined,
    tables: undefined,
    status: "draft",
    title: "Draft Accounts",
    version: 1,
  };
  const entityMetadata: EntityMetadata = {
    actions: customerMetadata.actions,
    customization: customerMetadata.customization,
    id: customerMetadata.id,
    entity: customerMetadata.entity,
    fields: customerMetadata.fields,
    forms: customerMetadata.forms,
    labels: customerMetadata.labels,
    presentation: customerMetadata.presentation,
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

test("resolveLayeredCustomizedMetadata rejects invalid layer scopes and tenant mismatches", () => {
  const publishedLifecycle = {
    baseMetadataFingerprint: "customer.records@2026-06-09",
    created: {
      at: "2026-06-09T00:00:00.000Z",
      by: "admin-user",
    },
    published: {
      at: "2026-06-09T00:00:00.000Z",
      by: "admin-user",
    },
    status: "published" as const,
    updated: {
      at: "2026-06-09T00:00:00.000Z",
      by: "admin-user",
    },
    version: 1,
  };

  assert.throws(() => {
    resolveLayeredCustomizedMetadata(customerMetadata, {
      tenant: {
        ...tenantCustomization,
        scope: "company",
        companyId: "company-main",
      },
    });
  }, /tenant customization layer received company scoped customization/);

  assert.throws(() => {
    resolveLayeredCustomizedMetadata(customerMetadata, {
      company: {
        ...tenantCustomization,
        ...publishedLifecycle,
        companyId: "company-main",
        id: "customer.records.company-main",
        scope: "company",
        tenantId: "tenant-other",
      },
      tenant: {
        ...tenantCustomization,
        ...publishedLifecycle,
      },
    });
  }, /must target the same tenant/);
});

test("resolvePreviewCustomizationLayers excludes archived customization", () => {
  const archivedTenant: CustomizationContract = {
    ...tenantCustomization,
    archived: {
      at: "2026-06-09T00:00:00.000Z",
      by: "admin-user",
    },
    baseMetadataFingerprint: "customer.records@2026-06-09",
    created: {
      at: "2026-06-09T00:00:00.000Z",
      by: "admin-user",
    },
    status: "archived",
    updated: {
      at: "2026-06-09T00:00:00.000Z",
      by: "admin-user",
    },
    version: 2,
  };

  assert.deepEqual(
    resolvePreviewCustomizationLayers({
      tenant: archivedTenant,
    }),
    []
  );
});

test("resolvePreviewCustomizationLayers excludes customizations without explicit draft or published status", () => {
  assert.deepEqual(
    resolvePreviewCustomizationLayers({
      tenant: {
        ...tenantCustomization,
        status: undefined,
      } as unknown as CustomizationContract,
    }),
    []
  );
});

test("customization fixtures serialize deterministically", () => {
  const fixture = createCustomizationFixture({
    customization: tenantCustomization,
    exportedAt: "2026-06-09T00:00:00.000Z",
    exportedBy: "admin-user",
    metadata: customerMetadata,
  });
  const serialized = serializeCustomizationFixture(fixture);
  const deserialized = deserializeCustomizationFixture(serialized);

  assert.equal(deserialized.schemaVersion, 2);
  assert.deepEqual(deserialized, fixture);
  assert.ok(serialized.endsWith("\n"));
  assert.ok(
    serialized.indexOf('"customization"') < serialized.indexOf('"exportedAt"')
  );
  assert.ok((deserialized.metadataSnapshot?.length ?? 0) > 0);
});

test("customization fixtures reuse metadata-aware validation", () => {
  const fixture = createCustomizationFixture({
    customization: tenantCustomization,
    exportedAt: "2026-06-09T00:00:00.000Z",
    exportedBy: "admin-user",
  });

  const validResult = validateCustomizationFixtureAgainstMetadata(
    fixture,
    customerMetadata
  );
  const invalidResult = validateCustomizationFixtureAgainstMetadata(
    createCustomizationFixture({
      customization: {
        ...tenantCustomization,
        fields: [
          {
            key: "unknown-field",
          },
        ],
      },
      exportedAt: "2026-06-09T00:00:00.000Z",
      exportedBy: "admin-user",
    }),
    customerMetadata
  );

  assert.equal(validResult.valid, true);
  assert.equal(
    assertCustomizationFixtureMatchesMetadata(fixture, customerMetadata),
    fixture
  );
  assert.equal(invalidResult.valid, false);
});

test("reviewCustomizationFixtureImport warns for stale draft imports and rejects strict publishability", () => {
  const fixture = createCustomizationFixture({
    customization: {
      ...tenantCustomization,
      baseMetadataFingerprint: "customer.records@stale",
    },
    exportedAt: "2026-06-09T00:00:00.000Z",
    exportedBy: "admin-user",
    metadata: customerMetadata,
  });

  const draftReview = reviewCustomizationFixtureImport({
    fixture,
    metadata: customerMetadata,
    mode: "draft-with-warnings",
    options: {
      metadataFingerprint: "customer.records@2026-06-09",
    },
  });
  const strictReview = reviewCustomizationFixtureImport({
    fixture,
    metadata: customerMetadata,
    mode: "strict",
    options: {
      metadataFingerprint: "customer.records@2026-06-09",
    },
  });

  assert.equal(draftReview.valid, true);
  assert.equal(draftReview.publishable, false);
  assert.ok(
    draftReview.issues.some(
      (issue) =>
        issue.code === "customization.stale_metadata" &&
        issue.severity === "warning"
    )
  );
  assert.equal(strictReview.valid, false);
  assert.equal(strictReview.publishable, false);
});

test("fixture snapshots report renamed and changed nodes", () => {
  const fixture = createCustomizationFixture({
    customization: tenantCustomization,
    exportedAt: "2026-06-09T00:00:00.000Z",
    exportedBy: "admin-user",
    metadata: customerMetadata,
  });

  const review = reviewCustomizationFixtureImport({
    fixture,
    metadata: {
      ...customerMetadata,
      fields: customerMetadata.fields?.map((field) =>
        field.key === "name"
          ? {
              ...field,
              kind: "select",
              key: "account-name",
            }
          : field
      ),
    },
    mode: "draft-with-warnings",
  });

  assert.ok(
    review.issues.some(
      (issue) =>
        issue.code === "customization.node_renamed" &&
        issue.metadataNodeKey === "account-name"
    )
  );
  assert.ok(
    review.issues.some(
      (issue) =>
        issue.code === "customization.node_shape_drift" &&
        issue.surface === "field"
    )
  );
});

test("reviewCustomizationFixtureImport detects removed nodes from fixture snapshots", () => {
  const fixture = createCustomizationFixture({
    customization: tenantCustomization,
    exportedAt: "2026-06-09T00:00:00.000Z",
    exportedBy: "admin-user",
    metadata: customerMetadata,
  });

  const review = reviewCustomizationFixtureImport({
    fixture,
    metadata: {
      ...customerMetadata,
      fields: customerMetadata.fields?.filter((field) => field.key !== "name"),
    },
    mode: "strict",
  });

  assert.equal(review.valid, false);
  assert.ok(
    review.issues.some(
      (issue) =>
        issue.code === "customization.node_removed" &&
        issue.targetNodeKey === "name"
    )
  );
});

test("resolvePublishedCustomizedMetadataResult fails closed for invalid layer contracts", () => {
  const result = resolvePublishedCustomizedMetadataResult(customerMetadata, {
    tenant: {
      ...tenantCustomization,
      status: "published",
      version: 1,
    },
  });

  assert.equal(result.status, "base_fallback");
  assert.equal(result.metadata, customerMetadata);
  assert.deepEqual(result.appliedCustomizations, []);
  assert.ok(
    result.diagnostics.some(
      (issue) => issue.code === "customization.invalid_contract"
    )
  );
});

test("resolvePublishedCustomizedEntityMetadataResult fails closed for invalid published overlays", () => {
  const entityMetadata: EntityMetadata = {
    actions: customerMetadata.actions,
    customization: customerMetadata.customization,
    entity: customerMetadata.entity,
    fields: customerMetadata.fields?.map((field) =>
      field.key === "status"
        ? {
            ...field,
            customization: undefined,
          }
        : field
    ),
    id: customerMetadata.id,
    labels: customerMetadata.labels,
    sections: customerMetadata.sections,
    table: {
      customization: {
        columns: true,
        defaultSort: true,
        title: true,
      },
      columns: [
        {
          customization: {
            label: true,
          },
          field: "name",
          key: "name",
          label: "Name",
          sortable: true,
        },
        {
          customization: {
            hidden: true,
          },
          field: "status",
          key: "status",
          label: "Status",
        },
      ],
      defaultSort: "status",
      title: "Customer directory",
    },
    title: customerMetadata.title,
  };

  const result = resolvePublishedCustomizedEntityMetadataResult(
    entityMetadata,
    {
      tenant: {
        ...tenantCustomization,
        baseMetadataFingerprint: "customer.records@2026-06-09",
        created: {
          at: "2026-06-09T00:00:00.000Z",
          by: "admin-user",
        },
        published: {
          at: "2026-06-09T00:00:00.000Z",
          by: "admin-user",
        },
        status: "published",
        updated: {
          at: "2026-06-09T00:00:00.000Z",
          by: "admin-user",
        },
        version: 1,
      },
    }
  );

  assert.equal(result.status, "base_fallback");
  assert.equal(result.metadata, entityMetadata);
  assert.ok(
    result.diagnostics.some(
      (issue) => issue.code === "customization.override_not_allowed"
    )
  );
});

test("resolvePreviewCustomizedMetadataResult fails closed for preview layer mismatches", () => {
  const result = resolvePreviewCustomizedMetadataResult(customerMetadata, {
    company: {
      ...tenantCustomization,
      companyId: "company-main",
      id: "customer.records.company-main",
      scope: "company",
      status: "draft",
      tenantId: "tenant-other",
    },
    tenant: {
      ...tenantCustomization,
      status: "draft",
    },
  });

  assert.equal(result.status, "base_fallback");
  assert.equal(result.metadata, customerMetadata);
  assert.deepEqual(result.appliedCustomizations, []);
  assert.ok(
    result.diagnostics.some(
      (issue) =>
        issue.code === "customization.invalid_contract" &&
        issue.message.includes("same tenant")
    )
  );
});

test("resolvePreviewCustomizedEntityMetadataResult surfaces preview warnings without failing closed", () => {
  const entityMetadata: EntityMetadata = {
    actions: customerMetadata.actions,
    customization: customerMetadata.customization,
    entity: customerMetadata.entity,
    fields: customerMetadata.fields,
    id: customerMetadata.id,
    labels: customerMetadata.labels,
    presentation: customerMetadata.presentation,
    sections: customerMetadata.sections,
    table: {
      customization: {
        columns: true,
        defaultSort: true,
        title: true,
      },
      columns: [
        {
          customization: {
            label: true,
          },
          field: "name",
          key: "name",
          label: "Name",
          sortable: true,
        },
      ],
      defaultSort: "name",
      title: "Customer directory",
    },
    title: customerMetadata.title,
  };

  const result = resolvePreviewCustomizedEntityMetadataResult(
    entityMetadata,
    {
      tenant: {
        ...tenantCustomization,
        actions: undefined,
        baseMetadataFingerprint: "customer.records@stale",
        fields: undefined,
        forms: undefined,
        presentation: undefined,
        sections: undefined,
        status: "draft",
        table: undefined,
        tables: undefined,
        title: "Draft Accounts",
        version: 1,
      },
    },
    {
      metadataFingerprint: "customer.records@2026-06-09",
    }
  );

  assert.equal(result.status, "resolved");
  assert.ok(
    result.diagnostics.some(
      (issue) =>
        issue.code === "customization.stale_metadata" &&
        issue.severity === "warning"
    )
  );
});

test("resolvePublishedCustomizedEntityMetadataResult fails closed for invalid layer contracts", () => {
  const entityMetadata: EntityMetadata = {
    actions: customerMetadata.actions,
    customization: customerMetadata.customization,
    entity: customerMetadata.entity,
    fields: customerMetadata.fields,
    id: customerMetadata.id,
    labels: customerMetadata.labels,
    sections: customerMetadata.sections,
    title: customerMetadata.title,
  };

  const result = resolvePublishedCustomizedEntityMetadataResult(
    entityMetadata,
    {
      company: {
        ...tenantCustomization,
        companyId: undefined,
        scope: "company",
        status: "published",
      } as unknown as CustomizationContract,
    }
  );

  assert.equal(result.status, "base_fallback");
  assert.equal(result.metadata, entityMetadata);
  assert.ok(
    result.diagnostics.some(
      (issue) => issue.code === "customization.invalid_contract"
    )
  );
});
