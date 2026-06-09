export type RetailSeasonalHourlyWorkforceSchedulingMetadata = {
  description: string;
  domain: string;
  id: string;
  labels: {
    plural: string;
    singular: string;
  };
  source: "legacy-hr-suite";
  suite: "hr-suite";
  title: string;
};

export const retailSeasonalHourlyWorkforceSchedulingMetadata: RetailSeasonalHourlyWorkforceSchedulingMetadata =
  {
    id: "hr-suite.industry-specific.retail-seasonal-hourly-workforce-scheduling",
    title: "Retail Seasonal Hourly Workforce Scheduling",
    description:
      "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
    domain: "industry-specific",
    labels: {
      singular: "Retail Seasonal Hourly Workforce Scheduling record",
      plural: "Retail Seasonal Hourly Workforce Scheduling records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
