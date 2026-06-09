import { absenceAnalyticsTrendsRouteContracts } from "./contract.ts";

export type AbsenceAnalyticsTrendsManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof absenceAnalyticsTrendsRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const absenceAnalyticsTrendsManifest: AbsenceAnalyticsTrendsManifest = {
  id: "hr-suite.time-attendance.absence-analytics-trends",
  title: "Absence Analytics Trends",
  description:
    "Governed package for the legacy HR Suite absence-analytics-trends slice at afenda-erp/packages/features/hr-suite/src/time-attendance/absence-analytics-trends.",
  domain: "time-attendance",
  packageName: "@repo/features-time-attendance-absence-analytics-trends",
  routeContracts: absenceAnalyticsTrendsRouteContracts,
  suite: "hr-suite",
};
