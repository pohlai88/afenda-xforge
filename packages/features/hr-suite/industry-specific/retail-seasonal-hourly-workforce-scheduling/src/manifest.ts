import { retailSeasonalHourlyWorkforceSchedulingRouteContracts } from "./contract.ts";

export type RetailSeasonalHourlyWorkforceSchedulingManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof retailSeasonalHourlyWorkforceSchedulingRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const retailSeasonalHourlyWorkforceSchedulingManifest: RetailSeasonalHourlyWorkforceSchedulingManifest =
  {
    id: "hr-suite.industry-specific.retail-seasonal-hourly-workforce-scheduling",
    title: "Retail Seasonal Hourly Workforce Scheduling",
    description:
      "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/industry-specific/retail-seasonal-hourly-workforce-scheduling.",
    domain: "industry-specific",
    packageName:
      "@repo/features-industry-specific-retail-seasonal-hourly-workforce-scheduling",
    routeContracts: retailSeasonalHourlyWorkforceSchedulingRouteContracts,
    suite: "hr-suite",
  };
