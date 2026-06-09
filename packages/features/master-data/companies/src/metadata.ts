import type { EntityMetadata } from "@repo/metadata";

export const companyMetadata: EntityMetadata = {
  id: "master-data.companies",
  customization: {
    presentation: {
      density: true,
      icon: true,
      size: true,
      tone: true,
      variant: true,
    },
    scopes: ["tenant", "company"],
  },
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
      customization: {
        label: true,
        order: true,
        placeholder: true,
      },
      key: "code",
      label: "Code",
      kind: "text",
      required: true,
      placeholder: "COMP-001",
      validationHint: "Use a stable company code.",
    },
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
      placeholder: "Acme Holdings",
      validationHint: "Use the legal or display name.",
    },
    {
      customization: {
        label: true,
        order: true,
      },
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
      customization: {
        hidden: true,
        label: true,
      },
      key: "company-code",
      label: "Code",
      field: "code",
      kind: "text",
      operator: "contains",
      placeholder: "Search code",
    },
    {
      customization: {
        hidden: true,
        label: true,
      },
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
      customization: {
        label: true,
        layout: true,
        sectionKeys: true,
      },
      key: "company-create",
      label: "Create company",
      fieldKeys: ["code", "name", "status"],
      sectionKeys: ["company-identity", "company-lifecycle"],
      submitActionKey: "company-create",
      cancelActionKey: "cancel",
      layout: "grid",
    },
    {
      customization: {
        label: true,
        layout: true,
        sectionKeys: true,
      },
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
      customization: {
        hidden: true,
        label: true,
        placement: true,
        safe: true,
      },
      key: "company-create",
      label: "Create",
      kind: "create",
      placement: "primary",
      permissionHint: "master-data.companies:write",
    },
    {
      customization: {
        hidden: true,
        label: true,
        placement: true,
        safe: true,
      },
      key: "company-save",
      label: "Save changes",
      kind: "update",
      placement: "primary",
      permissionHint: "master-data.companies:write",
    },
    {
      customization: {
        safe: false,
      },
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
      customization: {
        safe: false,
      },
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
      customization: {
        columns: true,
        fieldKeys: true,
        label: true,
      },
      key: "company-identity",
      label: "Identity",
      fieldKeys: ["code", "name"],
      columns: 2,
    },
    {
      customization: {
        columns: true,
        fieldKeys: true,
        hidden: true,
        label: true,
      },
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
    customization: {
      columns: true,
      defaultSort: true,
      title: true,
    },
    defaultSort: "name",
    title: "Company directory",
    columns: [
      {
        customization: {
          hidden: true,
          label: true,
          order: true,
          width: true,
        },
        key: "code",
        label: "Code",
        field: "code",
        sortable: true,
        filterable: true,
        width: "sm",
      },
      {
        customization: {
          hidden: true,
          label: true,
          order: true,
          width: true,
        },
        key: "name",
        label: "Name",
        field: "name",
        sortable: true,
        filterable: true,
        width: "lg",
      },
      {
        customization: {
          align: true,
          hidden: true,
          label: true,
          order: true,
          width: true,
        },
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
