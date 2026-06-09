import type { EntityMetadata } from "@repo/metadata";
import { systemAdminCapabilities } from "./contract.ts";

export const systemAdminControlPlaneMetadata: EntityMetadata = {
  id: "system-admin.control-plane",
  entity: "system-admin-control-plane",
  title: "System Admin",
  description:
    "Governed control-plane surface for tenant administration, access, customization governance, audit, and operational summaries.",
  labels: {
    singular: "System Admin Section",
    plural: "System Admin Sections",
  },
  presentation: {
    density: "default",
    icon: "settings",
    size: "lg",
    tone: "warning",
    variant: "outline",
  },
  permissionHint: {
    action: "view",
    claim: systemAdminCapabilities.overviewRead,
    reason: "Read system administration overview",
    scope: "tenant",
    subject: "system-admin",
  },
  fields: [
    {
      key: "title",
      label: "Section",
      kind: "text",
      required: true,
    },
    {
      key: "domain",
      label: "Domain",
      kind: "select",
      required: true,
    },
    {
      key: "status",
      label: "Status",
      kind: "select",
      required: true,
    },
    {
      key: "requiredPermission",
      label: "Required permission",
      kind: "text",
      required: true,
    },
  ],
  actions: [
    {
      key: "tenant-setting-update",
      label: "Update tenant setting",
      kind: "update",
      placement: "primary",
      permissionHint: systemAdminCapabilities.tenantSettingsWrite,
    },
    {
      key: "role-assign",
      label: "Assign role",
      kind: "update",
      placement: "overflow",
      permissionHint: systemAdminCapabilities.usersAccessWrite,
    },
    {
      key: "customization-publish",
      label: "Publish customization",
      kind: "approve",
      placement: "primary",
      permissionHint: systemAdminCapabilities.customizationPublish,
    },
  ],
  filters: [
    {
      key: "system-admin-domain",
      label: "Domain",
      field: "domain",
      kind: "status",
      operator: "equals",
      options: [
        { label: "Overview", value: "overview" },
        { label: "Tenant Settings", value: "tenant-settings" },
        { label: "Users & Access", value: "users-access" },
        { label: "Customization", value: "customization-governance" },
        { label: "Audit", value: "audit" },
        { label: "Health & Metrics", value: "health-metrics" },
      ],
    },
  ],
  sections: [
    {
      key: "system-admin-governance",
      label: "Governance",
      fieldKeys: ["title", "domain", "requiredPermission", "status"],
      columns: 2,
    },
  ],
  table: {
    defaultSort: "title",
    title: "System admin control plane",
    columns: [
      {
        key: "title",
        label: "Section",
        field: "title",
        sortable: true,
        filterable: true,
        width: "lg",
      },
      {
        key: "domain",
        label: "Domain",
        field: "domain",
        kind: "status",
        sortable: true,
        filterable: true,
        width: "md",
      },
      {
        key: "status",
        label: "Status",
        field: "status",
        kind: "status",
        sortable: true,
        filterable: true,
        width: "sm",
      },
      {
        key: "requiredPermission",
        label: "Permission",
        field: "requiredPermission",
        sortable: true,
        width: "lg",
      },
    ],
  },
};
