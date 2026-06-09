import type { EntityMetadata } from "@repo/metadata";

export const currencyMetadata: EntityMetadata = {
  id: "master-data.currencies",
  entity: "currency",
  title: "Currencies",
  description:
    "Governed metadata for currency master-data used across pricing, billing, and finance workflows.",
  labels: {
    singular: "Currency",
    plural: "Currencies",
  },
  presentation: {
    density: "default",
    icon: "banknote",
    size: "md",
    tone: "info",
    variant: "outline",
  },
  permissionHint: {
    action: "view",
    claim: "master-data.currencies:read",
    reason: "Read currency records",
    scope: "tenant",
    subject: "currency",
  },
  fields: [
    {
      key: "code",
      label: "Code",
      kind: "text",
      required: true,
      placeholder: "USD",
      validationHint: "Use the ISO currency code.",
    },
    {
      key: "name",
      label: "Name",
      kind: "text",
      required: true,
      placeholder: "US Dollar",
      validationHint: "Use the full currency name.",
    },
    {
      key: "status",
      label: "Status",
      kind: "select",
      required: true,
      validationHint:
        "Use active for supported currencies and inactive for retired currencies.",
    },
  ],
  filters: [
    {
      key: "currency-code",
      label: "Code",
      field: "code",
      kind: "text",
      operator: "contains",
      placeholder: "Search code",
    },
    {
      key: "currency-status",
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
      key: "currency-create",
      label: "Create currency",
      fieldKeys: ["code", "name", "status"],
      sectionKeys: ["currency-identity", "currency-lifecycle"],
      submitActionKey: "currency-create",
      cancelActionKey: "cancel",
      layout: "grid",
    },
    {
      key: "currency-edit",
      label: "Edit currency",
      fieldKeys: ["code", "name", "status"],
      sectionKeys: ["currency-identity", "currency-lifecycle"],
      submitActionKey: "currency-save",
      cancelActionKey: "cancel",
      layout: "grid",
    },
  ],
  actions: [
    {
      key: "currency-create",
      label: "Create",
      kind: "create",
      placement: "primary",
    },
    {
      key: "currency-save",
      label: "Save changes",
      kind: "update",
      placement: "primary",
      permissionHint: "master-data.currencies:write",
    },
    {
      key: "currency-archive",
      label: "Archive",
      kind: "archive",
      placement: "overflow",
      dangerous: true,
      confirmMessage: "Archive this currency record?",
      permissionHint: "master-data.currencies:write",
      stateTransition: {
        from: ["active"],
        to: "inactive",
      },
    },
    {
      key: "currency-restore",
      label: "Restore",
      kind: "restore",
      placement: "overflow",
      permissionHint: "master-data.currencies:write",
      stateTransition: {
        from: ["inactive"],
        to: "active",
      },
    },
  ],
  sections: [
    {
      key: "currency-identity",
      label: "Identity",
      fieldKeys: ["code", "name"],
      columns: 2,
    },
    {
      key: "currency-lifecycle",
      label: "Lifecycle",
      fieldKeys: ["status"],
      columns: 1,
      collapsible: true,
    },
  ],
  states: [
    {
      key: "currency-draft",
      label: "Draft",
      uiState: "empty",
      tone: "neutral",
    },
    {
      key: "currency-ready",
      label: "Ready",
      uiState: "ready",
      tone: "success",
    },
    {
      key: "currency-inactive",
      label: "Inactive",
      uiState: "forbidden",
      tone: "warning",
    },
  ],
  table: {
    defaultSort: "name",
    title: "Currency directory",
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
