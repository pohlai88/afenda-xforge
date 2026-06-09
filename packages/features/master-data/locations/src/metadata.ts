import type { EntityMetadata } from "@repo/metadata";

export const locationMetadata: EntityMetadata = {
  id: "master-data.locations",
  entity: "location",
  title: "Locations",
  description:
    "Governed metadata for location master-data used across warehousing, logistics, and operational routing.",
  labels: {
    singular: "Location",
    plural: "Locations",
  },
  presentation: {
    density: "default",
    icon: "map-pin",
    size: "md",
    tone: "info",
    variant: "outline",
  },
  permissionHint: {
    action: "view",
    claim: "master-data.locations:read",
    reason: "Read location records",
    scope: "tenant",
    subject: "location",
  },
  fields: [
    {
      key: "code",
      label: "Code",
      kind: "text",
      required: true,
      placeholder: "LOC-001",
      validationHint: "Use a stable location code.",
    },
    {
      key: "name",
      label: "Name",
      kind: "text",
      required: true,
      placeholder: "Main Warehouse",
      validationHint: "Use the site or warehouse name.",
    },
    {
      key: "status",
      label: "Status",
      kind: "select",
      required: true,
      validationHint:
        "Use active for open locations and inactive for retired locations.",
    },
  ],
  filters: [
    {
      key: "location-code",
      label: "Code",
      field: "code",
      kind: "text",
      operator: "contains",
      placeholder: "Search code",
    },
    {
      key: "location-status",
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
      key: "location-create",
      label: "Create location",
      fieldKeys: ["code", "name", "status"],
      sectionKeys: ["location-identity", "location-lifecycle"],
      submitActionKey: "location-create",
      cancelActionKey: "cancel",
      layout: "grid",
    },
    {
      key: "location-edit",
      label: "Edit location",
      fieldKeys: ["code", "name", "status"],
      sectionKeys: ["location-identity", "location-lifecycle"],
      submitActionKey: "location-save",
      cancelActionKey: "cancel",
      layout: "grid",
    },
  ],
  actions: [
    {
      key: "location-create",
      label: "Create",
      kind: "create",
      placement: "primary",
    },
    {
      key: "location-save",
      label: "Save changes",
      kind: "update",
      placement: "primary",
      permissionHint: "master-data.locations:write",
    },
    {
      key: "location-archive",
      label: "Archive",
      kind: "archive",
      placement: "overflow",
      dangerous: true,
      confirmMessage: "Archive this location record?",
      permissionHint: "master-data.locations:write",
      stateTransition: {
        from: ["active"],
        to: "inactive",
      },
    },
    {
      key: "location-restore",
      label: "Restore",
      kind: "restore",
      placement: "overflow",
      permissionHint: "master-data.locations:write",
      stateTransition: {
        from: ["inactive"],
        to: "active",
      },
    },
  ],
  sections: [
    {
      key: "location-identity",
      label: "Identity",
      fieldKeys: ["code", "name"],
      columns: 2,
    },
    {
      key: "location-lifecycle",
      label: "Lifecycle",
      fieldKeys: ["status"],
      columns: 1,
      collapsible: true,
    },
  ],
  states: [
    {
      key: "location-draft",
      label: "Draft",
      uiState: "empty",
      tone: "neutral",
    },
    {
      key: "location-ready",
      label: "Ready",
      uiState: "ready",
      tone: "success",
    },
    {
      key: "location-inactive",
      label: "Inactive",
      uiState: "forbidden",
      tone: "warning",
    },
  ],
  table: {
    defaultSort: "name",
    title: "Location directory",
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
