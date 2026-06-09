import type { OrganizationalChartHierarchyRoutePath } from "./route.types.ts";

export const ORGANIZATIONAL_CHART_HIERARCHY_CONTRACT_VERSION = "v1" as const;

export const organizationalChartHierarchyRoutePaths: Record<
  string,
  OrganizationalChartHierarchyRoutePath
> = {
  units: "/api/hr/org/units",
  positions: "/api/hr/org/positions",
  reportingLines: "/api/hr/org/reporting-lines",
  overview: "/api/hr/org/overview",
  auditTrail: "/api/hr/org/audit-trail",
} as const;

export const hrOrgRoutePaths: typeof organizationalChartHierarchyRoutePaths =
  organizationalChartHierarchyRoutePaths;

export const organizationalChartHierarchyRouteContracts = {
  units: {
    method: "GET",
    path: organizationalChartHierarchyRoutePaths.units,
    version: ORGANIZATIONAL_CHART_HIERARCHY_CONTRACT_VERSION,
  },
  positions: {
    method: "GET",
    path: organizationalChartHierarchyRoutePaths.positions,
    version: ORGANIZATIONAL_CHART_HIERARCHY_CONTRACT_VERSION,
  },
  reportingLines: {
    method: "GET",
    path: organizationalChartHierarchyRoutePaths.reportingLines,
    version: ORGANIZATIONAL_CHART_HIERARCHY_CONTRACT_VERSION,
  },
  overview: {
    method: "GET",
    path: organizationalChartHierarchyRoutePaths.overview,
    version: ORGANIZATIONAL_CHART_HIERARCHY_CONTRACT_VERSION,
  },
  auditTrail: {
    method: "GET",
    path: organizationalChartHierarchyRoutePaths.auditTrail,
    version: ORGANIZATIONAL_CHART_HIERARCHY_CONTRACT_VERSION,
  },
} as const;
