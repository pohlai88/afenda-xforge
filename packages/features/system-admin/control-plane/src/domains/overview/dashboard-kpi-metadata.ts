import type { EntityMetadata } from "@repo/metadata";
import { systemAdminCapabilities } from "../../contract.ts";

export type DashboardKpiSectionTemplate = {
  description: string;
  key: string;
  title: string;
  tone: "info" | "primary" | "success" | "warning";
};

export const dashboardOverviewKpiSectionTemplates: readonly DashboardKpiSectionTemplate[] =
  [
    {
      description: "Customers",
      key: "dashboard-kpi-customers",
      title: "Customers",
      tone: "primary",
    },
    {
      description: "Companies",
      key: "dashboard-kpi-companies",
      title: "Companies",
      tone: "success",
    },
    {
      description: "Tenant access",
      key: "dashboard-kpi-role",
      title: "Role",
      tone: "info",
    },
  ] as const;

export const dashboardOverviewMetadata: EntityMetadata = {
  id: "system-admin.overview",
  entity: "dashboard-overview",
  title: "Overview",
  description: "Tenant-scoped dashboard KPI summary sections.",
  labels: {
    singular: "Overview metric",
    plural: "Overview metrics",
  },
  permissionHint: {
    action: "view",
    claim: systemAdminCapabilities.overviewRead,
    reason: "Read dashboard overview metrics",
    scope: "tenant",
    subject: "dashboard-overview",
  },
  sections: dashboardOverviewKpiSectionTemplates.map((section) => ({
    fieldKeys: [],
    key: section.key,
    label: section.title,
    description: section.description,
  })),
};
