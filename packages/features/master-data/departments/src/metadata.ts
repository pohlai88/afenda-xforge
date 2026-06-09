import type { EntityMetadata } from "@repo/metadata";

export const departmentMetadata: EntityMetadata = {
  id: "master-data.departments",
  entity: "department",
  title: "Departments",
  description:
    "Governed metadata for department master-data used across organizational reporting and workforce operations.",
  labels: {
    singular: "Department",
    plural: "Departments",
  },
  presentation: {
    density: "default",
    icon: "layers-3",
    size: "md",
    tone: "info",
    variant: "outline",
  },
  permissionHint: {
    action: "view",
    claim: "master-data.departments:read",
    reason: "Read department records",
    scope: "tenant",
    subject: "department",
  },
  fields: [
    {
      key: "code",
      label: "Code",
      kind: "text",
      required: true,
      placeholder: "DEPT-001",
      validationHint: "Use a stable department code.",
    },
    {
      key: "name",
      label: "Name",
      kind: "text",
      required: true,
      placeholder: "Operations",
      validationHint: "Use the business unit name.",
    },
    {
      key: "status",
      label: "Status",
      kind: "select",
      required: true,
      validationHint:
        "Use active for open departments and inactive for retired departments.",
    },
  ],
  filters: [
    {
      key: "department-code",
      label: "Code",
      field: "code",
      kind: "text",
      operator: "contains",
      placeholder: "Search code",
    },
    {
      key: "department-status",
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
      key: "department-create",
      label: "Create department",
      fieldKeys: ["code", "name", "status"],
      sectionKeys: ["department-identity", "department-lifecycle"],
      submitActionKey: "department-create",
      cancelActionKey: "cancel",
      layout: "grid",
    },
    {
      key: "department-edit",
      label: "Edit department",
      fieldKeys: ["code", "name", "status"],
      sectionKeys: ["department-identity", "department-lifecycle"],
      submitActionKey: "department-save",
      cancelActionKey: "cancel",
      layout: "grid",
    },
  ],
  actions: [
    {
      key: "department-create",
      label: "Create",
      kind: "create",
      placement: "primary",
    },
    {
      key: "department-save",
      label: "Save changes",
      kind: "update",
      placement: "primary",
      permissionHint: "master-data.departments:write",
    },
    {
      key: "department-archive",
      label: "Archive",
      kind: "archive",
      placement: "overflow",
      dangerous: true,
      confirmMessage: "Archive this department record?",
      permissionHint: "master-data.departments:write",
      stateTransition: {
        from: ["active"],
        to: "inactive",
      },
    },
    {
      key: "department-restore",
      label: "Restore",
      kind: "restore",
      placement: "overflow",
      permissionHint: "master-data.departments:write",
      stateTransition: {
        from: ["inactive"],
        to: "active",
      },
    },
  ],
  sections: [
    {
      key: "department-identity",
      label: "Identity",
      fieldKeys: ["code", "name"],
      columns: 2,
    },
    {
      key: "department-lifecycle",
      label: "Lifecycle",
      fieldKeys: ["status"],
      columns: 1,
      collapsible: true,
    },
  ],
  states: [
    {
      key: "department-draft",
      label: "Draft",
      uiState: "empty",
      tone: "neutral",
    },
    {
      key: "department-ready",
      label: "Ready",
      uiState: "ready",
      tone: "success",
    },
    {
      key: "department-inactive",
      label: "Inactive",
      uiState: "forbidden",
      tone: "warning",
    },
  ],
  table: {
    defaultSort: "name",
    title: "Department directory",
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
