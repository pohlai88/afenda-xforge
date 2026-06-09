import type { EntityMetadata } from "@repo/metadata";

export const companyMetadata: EntityMetadata = {
  id: "master-data.companies",
  entity: "company",
  title: "Companies",
  description:
    "Tenant-scoped company master-data used to govern organizational structure, legal entities, and company grants.",
  labels: {
    singular: "Company",
    plural: "Companies",
  },
  presentation: {
    density: "default",
    icon: "building-2",
    size: "md",
    tone: "info",
    variant: "outline",
  },
  permissionHint: {
    action: "view",
    claim: "master-data.companies:read",
    reason: "Read company records",
    scope: "tenant",
    subject: "company",
  },
  fields: [
    {
      key: "code",
      label: "Code",
      kind: "text",
      required: true,
      placeholder: "COMP-001",
      validationHint: "Use a stable company code.",
    },
    {
      key: "name",
      label: "Name",
      kind: "text",
      required: true,
      placeholder: "Acme Holdings",
      validationHint: "Use the legal or display name.",
    },
    {
      key: "status",
      label: "Status",
      kind: "select",
      required: true,
      validationHint:
        "Use active for operating entities and inactive for retired entities.",
    },
  ],
  filters: [
    {
      key: "company-code",
      label: "Code",
      field: "code",
      kind: "text",
      operator: "contains",
      placeholder: "Search code",
    },
    {
      key: "company-status",
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
      key: "company-create",
      label: "Create company",
      fieldKeys: ["code", "name", "status"],
      sectionKeys: ["company-identity", "company-lifecycle"],
      submitActionKey: "company-create",
      cancelActionKey: "cancel",
      layout: "grid",
    },
    {
      key: "company-edit",
      label: "Edit company",
      fieldKeys: ["code", "name", "status"],
      sectionKeys: ["company-identity", "company-lifecycle"],
      submitActionKey: "company-save",
      cancelActionKey: "cancel",
      layout: "grid",
    },
  ],
  actions: [
    {
      key: "company-create",
      label: "Create",
      kind: "create",
      placement: "primary",
      permissionHint: "master-data.companies:write",
    },
    {
      key: "company-save",
      label: "Save changes",
      kind: "update",
      placement: "primary",
      permissionHint: "master-data.companies:write",
    },
    {
      key: "company-archive",
      label: "Archive",
      kind: "archive",
      placement: "overflow",
      dangerous: true,
      confirmMessage: "Archive this company record?",
      permissionHint: "master-data.companies:write",
      stateTransition: {
        from: ["active"],
        to: "inactive",
      },
    },
    {
      key: "company-restore",
      label: "Restore",
      kind: "restore",
      placement: "overflow",
      permissionHint: "master-data.companies:write",
      stateTransition: {
        from: ["inactive"],
        to: "active",
      },
    },
  ],
  sections: [
    {
      key: "company-identity",
      label: "Identity",
      fieldKeys: ["code", "name"],
      columns: 2,
    },
    {
      key: "company-lifecycle",
      label: "Lifecycle",
      fieldKeys: ["status"],
      columns: 1,
      collapsible: true,
    },
  ],
  states: [
    {
      key: "company-draft",
      label: "Draft",
      uiState: "empty",
      tone: "neutral",
    },
    {
      key: "company-ready",
      label: "Ready",
      uiState: "ready",
      tone: "success",
    },
    {
      key: "company-inactive",
      label: "Inactive",
      uiState: "forbidden",
      tone: "warning",
    },
  ],
  table: {
    defaultSort: "name",
    title: "Company directory",
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
