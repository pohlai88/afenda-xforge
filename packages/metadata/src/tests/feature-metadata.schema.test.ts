import assert from "node:assert/strict";
import test from "node:test";

import {
  metadataFeatureSchema,
  metadataLabelsSchema,
  metadataPresentationSchema,
} from "../schemas/feature-metadata.schema.ts";
import { assertMetadataContract } from "../validation/assert-metadata-contract.ts";
import { parseFeatureMetadata } from "../validation/parse-feature-metadata.ts";

const validFeatureMetadata = {
  id: "customer.records",
  customization: {
    presentation: {
      density: true,
      tone: true,
      variant: true,
    },
    scopes: ["tenant", "company"],
  },
  entity: "customer",
  title: "Customer Records",
  description: "Declarative customer metadata for list and form surfaces.",
  labels: {
    singular: "Customer",
    plural: "Customers",
  },
  presentation: {
    density: "default",
    icon: "users",
    size: "md",
    tone: "info",
    variant: "outline",
  },
  permissionHint: {
    action: "view",
    claim: "customers.read",
    reason: "Read-only data surface",
    scope: "tenant",
    subject: "customer",
  },
  fields: [
    {
      customization: {
        label: true,
        order: true,
        placeholder: true,
      },
      key: "name",
      label: "Name",
      kind: "text",
      required: true,
      validationHint: "Use a descriptive business name.",
    },
    {
      customization: {
        hidden: "allow-required",
        label: true,
      },
      key: "status",
      label: "Status",
      kind: "select",
      permissionHint: "customers.status.view",
    },
  ],
  sections: [
    {
      customization: {
        columns: true,
        fieldKeys: true,
        label: true,
      },
      key: "general",
      label: "General",
      fieldKeys: ["name", "status"],
      columns: 2,
      collapsible: true,
    },
  ],
  tables: [
    {
      customization: {
        columns: true,
        title: true,
      },
      key: "customer-table",
      title: "Customers",
      columns: [
        {
          customization: {
            align: true,
            hidden: true,
            label: true,
            width: true,
          },
          key: "name",
          label: "Name",
          field: "name",
          sortable: true,
          filterable: true,
          align: "start",
          width: "lg",
        },
        {
          customization: {
            align: true,
            hidden: true,
            label: true,
            width: true,
          },
          key: "status",
          label: "Status",
          field: "status",
          sortable: true,
          filterable: true,
          align: "center",
          width: "sm",
        },
      ],
      supports: {
        pagination: true,
        sorting: true,
        filtering: true,
        rowActions: true,
        emptyState: true,
        permissionAwareActions: true,
      },
    },
  ],
  forms: [
    {
      customization: {
        label: true,
        layout: true,
        sectionKeys: true,
      },
      key: "customer-form",
      label: "Customer form",
      fieldKeys: ["name", "status"],
      sectionKeys: ["general"],
      submitActionKey: "save",
      cancelActionKey: "cancel",
      layout: "stack",
    },
  ],
  filters: [
    {
      customization: {
        hidden: true,
        label: true,
      },
      key: "status-filter",
      label: "Status",
      field: "status",
      kind: "status",
      operator: "equals",
      options: [
        {
          label: "Active",
          value: "active",
        },
      ],
    },
  ],
  actions: [
    {
      customization: {
        label: true,
        placement: true,
        safe: true,
      },
      key: "save",
      label: "Save",
      kind: "update",
      placement: "primary",
      requiresSelection: false,
    },
  ],
  states: [
    {
      key: "ready",
      label: "Ready",
      uiState: "ready",
      tone: "success",
    },
  ],
} as const;

test("metadataFeatureSchema parses a valid feature contract", () => {
  const parsed = metadataFeatureSchema.parse(validFeatureMetadata);

  assert.equal(parsed.labels.plural, "Customers");
  assert.equal(parsed.customization?.scopes?.[1], "company");
  assert.equal(parsed.tables?.[0].supports.pagination, true);
  assert.equal(parsed.states?.[0].uiState, "ready");
});

test("parseFeatureMetadata and assertMetadataContract return the same contract", () => {
  const parsed = parseFeatureMetadata(validFeatureMetadata);
  const asserted = assertMetadataContract(validFeatureMetadata);

  assert.deepEqual(asserted, parsed);
});

test("metadataPresentationSchema and metadataLabelsSchema reject empty strings", () => {
  assert.throws(() => {
    metadataLabelsSchema.parse({
      singular: "",
      plural: "Customers",
    });
  });

  assert.throws(() => {
    metadataPresentationSchema.parse({
      tone: "info",
      size: "md",
      density: "default",
      variant: "outline",
      icon: "",
    });
  });
});

test("metadataFeatureSchema rejects unsupported table support flags", () => {
  assert.throws(() => {
    metadataFeatureSchema.parse({
      ...validFeatureMetadata,
      tables: [
        {
          ...validFeatureMetadata.tables[0],
          supports: {
            pagination: true,
            sorting: true,
            filtering: true,
            rowActions: true,
            emptyState: false,
            permissionAwareActions: true,
          },
        },
      ],
    });
  });
});

test("metadataFeatureSchema rejects invalid customization scopes", () => {
  assert.throws(() => {
    metadataFeatureSchema.parse({
      ...validFeatureMetadata,
      customization: {
        ...validFeatureMetadata.customization,
        scopes: ["tenant", "global"],
      },
    });
  });
});
