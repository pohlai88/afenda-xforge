export const organizationalChartHierarchyDashboardMetrics = {
  totalHeadcount: "total_headcount",
  totalPositions: "total_positions",
  totalReportingLines: "total_reporting_lines",
  totalUnits: "total_units",
  totalVacancies: "total_vacancies",
} as const;

export const organizationalChartHierarchyDashboards = [
  {
    id: "organization-structure-overview",
    label: "Organization Structure Overview",
    description:
      "Summarizes structural volume across units, positions, reporting lines, vacancies, and headcount.",
    metrics: [
      organizationalChartHierarchyDashboardMetrics.totalUnits,
      organizationalChartHierarchyDashboardMetrics.totalPositions,
      organizationalChartHierarchyDashboardMetrics.totalReportingLines,
      organizationalChartHierarchyDashboardMetrics.totalVacancies,
      organizationalChartHierarchyDashboardMetrics.totalHeadcount,
    ],
  },
  {
    id: "organization-structure-governance",
    label: "Organization Structure Governance",
    description:
      "Surfaces change volume and audit pressure around structural maintenance.",
    metrics: [
      organizationalChartHierarchyDashboardMetrics.totalUnits,
      organizationalChartHierarchyDashboardMetrics.totalPositions,
      organizationalChartHierarchyDashboardMetrics.totalReportingLines,
    ],
  },
] as const;
