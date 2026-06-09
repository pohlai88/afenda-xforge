import type { EntityMetadata } from "@repo/metadata";

export const taxCodeMetadata: EntityMetadata = {
  id: "master-data.tax-codes",
  entity: "tax-code",
  title: "Tax Codes",
  description:
    "Governed metadata for tax code master-data used across taxation, invoicing, and compliance workflows.",
  labels: {
    singular: "Tax Code",
    plural: "Tax Codes",
  },
  presentation: {
    density: "default",
    icon: "receipt-text",
    size: "md",
    tone: "info",
    variant: "outline",
  },
  permissionHint: {
    action: "view",
    claim: "master-data.tax-codes:read",
    reason: "Read tax code records",
    scope: "tenant",
    subject: "tax-code",
  },
  fields: [
    {
      key: "code",
      label: "Code",
      kind: "text",
      required: true,
      placeholder: "VAT-STD",
      validationHint: "Use a stable tax code.",
    },
    {
      key: "name",
      label: "Name",
      kind: "text",
      required: true,
      placeholder: "Standard VAT",
      validationHint: "Use the tax code label.",
    },
    {
      key: "status",
      label: "Status",
      kind: "select",
      required: true,
      validationHint:
        "Use active for effective tax codes and inactive for retired tax codes.",
    },
  ],
  filters: [
    {
      key: "tax-code-code",
      label: "Code",
      field: "code",
      kind: "text",
      operator: "contains",
      placeholder: "Search code",
    },
    {
      key: "tax-code-status",
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
      key: "tax-code-create",
      label: "Create tax code",
      fieldKeys: ["code", "name", "status"],
      sectionKeys: ["tax-code-identity", "tax-code-lifecycle"],
      submitActionKey: "tax-code-create",
      cancelActionKey: "cancel",
      layout: "grid",
    },
    {
      key: "tax-code-edit",
      label: "Edit tax code",
      fieldKeys: ["code", "name", "status"],
      sectionKeys: ["tax-code-identity", "tax-code-lifecycle"],
      submitActionKey: "tax-code-save",
      cancelActionKey: "cancel",
      layout: "grid",
    },
  ],
  actions: [
    {
      key: "tax-code-create",
      label: "Create",
      kind: "create",
      placement: "primary",
    },
    {
      key: "tax-code-save",
      label: "Save changes",
      kind: "update",
      placement: "primary",
      permissionHint: "master-data.tax-codes:write",
    },
    {
      key: "tax-code-archive",
      label: "Archive",
      kind: "archive",
      placement: "overflow",
      dangerous: true,
      confirmMessage: "Archive this tax code record?",
      permissionHint: "master-data.tax-codes:write",
      stateTransition: {
        from: ["active"],
        to: "inactive",
      },
    },
    {
      key: "tax-code-restore",
      label: "Restore",
      kind: "restore",
      placement: "overflow",
      permissionHint: "master-data.tax-codes:write",
      stateTransition: {
        from: ["inactive"],
        to: "active",
      },
    },
  ],
  sections: [
    {
      key: "tax-code-identity",
      label: "Identity",
      fieldKeys: ["code", "name"],
      columns: 2,
    },
    {
      key: "tax-code-lifecycle",
      label: "Lifecycle",
      fieldKeys: ["status"],
      columns: 1,
      collapsible: true,
    },
  ],
  states: [
    {
      key: "tax-code-draft",
      label: "Draft",
      uiState: "empty",
      tone: "neutral",
    },
    {
      key: "tax-code-ready",
      label: "Ready",
      uiState: "ready",
      tone: "success",
    },
    {
      key: "tax-code-inactive",
      label: "Inactive",
      uiState: "forbidden",
      tone: "warning",
    },
  ],
  table: {
    defaultSort: "name",
    title: "Tax code directory",
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
