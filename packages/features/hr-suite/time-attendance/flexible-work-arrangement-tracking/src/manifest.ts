import { flexibleWorkArrangementTrackingRouteContracts } from "./contract.ts";

export type FlexibleWorkArrangementTrackingManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof flexibleWorkArrangementTrackingRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const flexibleWorkArrangementTrackingManifest: FlexibleWorkArrangementTrackingManifest =
  {
    id: "hr-suite.time-attendance.flexible-work-arrangement-tracking",
    title: "Flexible Work Arrangement Tracking",
    description:
      "Governed package for the legacy HR Suite flexible-work-arrangement-tracking slice at afenda-erp/packages/features/hr-suite/src/time-attendance/flexible-work-arrangement-tracking.",
    domain: "time-attendance",
    packageName:
      "@repo/features-time-attendance-flexible-work-arrangement-tracking",
    routeContracts: flexibleWorkArrangementTrackingRouteContracts,
    suite: "hr-suite",
  };
