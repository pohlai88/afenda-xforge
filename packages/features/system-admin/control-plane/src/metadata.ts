import type { EntityMetadata } from "@repo/metadata";
import { systemAdminCapabilities } from "./contract.ts";
import {
  systemAdminAccessAction,
  systemAdminAccessFilterOption,
} from "./domains/access/metadata.ts";
import { systemAdminAuditFilterOption } from "./domains/audit/metadata.ts";
import {
  systemAdminCustomizationAction,
  systemAdminCustomizationFilterOption,
} from "./domains/customization/metadata.ts";
import { systemAdminIntegrationsFilterOption } from "./domains/integrations/metadata.ts";
import { systemAdminOperationsFilterOption } from "./domains/operations/metadata.ts";
import { systemAdminOverviewFilterOption } from "./domains/overview/metadata.ts";
import {
  systemAdminTenantSettingsAction,
  systemAdminTenantSettingsFilterOption,
} from "./domains/tenant-settings/metadata.ts";

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
      ...systemAdminTenantSettingsAction,
      permissionHint: systemAdminCapabilities.tenantSettingsWrite,
    },
    {
      ...systemAdminAccessAction,
      permissionHint: systemAdminCapabilities.usersAccessWrite,
    },
    {
      ...systemAdminCustomizationAction,
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
        systemAdminOverviewFilterOption,
        systemAdminTenantSettingsFilterOption,
        systemAdminAccessFilterOption,
        systemAdminCustomizationFilterOption,
        systemAdminAuditFilterOption,
        systemAdminOperationsFilterOption,
        systemAdminIntegrationsFilterOption,
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
