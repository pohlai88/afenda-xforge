import type { EntityMetadata } from "@repo/metadata";

export const productMetadata: EntityMetadata = {
  id: "master-data.products",
  entity: "product",
  title: "Products",
  description:
    "Governed metadata for product master-data used across inventory, sales, and purchasing workflows.",
  labels: {
    singular: "Product",
    plural: "Products",
  },
  presentation: {
    density: "default",
    icon: "package",
    size: "md",
    tone: "info",
    variant: "outline",
  },
  permissionHint: {
    action: "view",
    claim: "master-data.products:read",
    reason: "Read product records",
    scope: "tenant",
    subject: "product",
  },
  fields: [
    {
      key: "code",
      label: "Code",
      kind: "text",
      required: true,
      placeholder: "PROD-001",
      validationHint: "Use a stable product code.",
    },
    {
      key: "name",
      label: "Name",
      kind: "text",
      required: true,
      placeholder: "Industrial Valve",
      validationHint: "Use the catalog or display name.",
    },
    {
      key: "status",
      label: "Status",
      kind: "select",
      required: true,
      validationHint:
        "Use active for sellable products and inactive for retired products.",
    },
  ],
  filters: [
    {
      key: "product-code",
      label: "Code",
      field: "code",
      kind: "text",
      operator: "contains",
      placeholder: "Search code",
    },
    {
      key: "product-status",
      label: "Status",
      field: "status",
      kind: "status",
      operator: "equals",
      options: [
        {
          label: "Active",
          value: "active",
        },
        {
          label: "Inactive",
          value: "inactive",
        },
      ],
    },
  ],
  forms: [
    {
      key: "product-create",
      label: "Create product",
      fieldKeys: ["code", "name", "status"],
      sectionKeys: ["product-identity", "product-lifecycle"],
      submitActionKey: "product-create",
      cancelActionKey: "cancel",
      layout: "grid",
    },
    {
      key: "product-edit",
      label: "Edit product",
      fieldKeys: ["code", "name", "status"],
      sectionKeys: ["product-identity", "product-lifecycle"],
      submitActionKey: "product-save",
      cancelActionKey: "cancel",
      layout: "grid",
    },
  ],
  actions: [
    {
      key: "product-create",
      label: "Create",
      kind: "create",
      placement: "primary",
    },
    {
      key: "product-save",
      label: "Save changes",
      kind: "update",
      placement: "primary",
      permissionHint: "master-data.products:write",
    },
    {
      key: "product-archive",
      label: "Archive",
      kind: "archive",
      placement: "overflow",
      dangerous: true,
      confirmMessage: "Archive this product record?",
      permissionHint: "master-data.products:write",
      stateTransition: {
        from: ["active"],
        to: "inactive",
      },
    },
    {
      key: "product-restore",
      label: "Restore",
      kind: "restore",
      placement: "overflow",
      permissionHint: "master-data.products:write",
      stateTransition: {
        from: ["inactive"],
        to: "active",
      },
    },
  ],
  sections: [
    {
      key: "product-identity",
      label: "Identity",
      fieldKeys: ["code", "name"],
      columns: 2,
    },
    {
      key: "product-lifecycle",
      label: "Lifecycle",
      fieldKeys: ["status"],
      columns: 1,
      collapsible: true,
    },
  ],
  states: [
    {
      key: "product-draft",
      label: "Draft",
      uiState: "empty",
      tone: "neutral",
    },
    {
      key: "product-ready",
      label: "Ready",
      uiState: "ready",
      tone: "success",
    },
    {
      key: "product-inactive",
      label: "Inactive",
      uiState: "forbidden",
      tone: "warning",
    },
  ],
  table: {
    defaultSort: "name",
    title: "Product directory",
    columns: [
      {
        key: "code",
        label: "Code",
        field: "code",
        sortable: true,
        filterable: true,
        width: "sm",
      },
      {
        key: "name",
        label: "Name",
        field: "name",
        sortable: true,
        filterable: true,
        width: "lg",
      },
      {
        key: "status",
        label: "Status",
        field: "status",
        kind: "status",
        sortable: true,
        filterable: true,
        align: "center",
        width: "sm",
      },
    ],
  },
};
