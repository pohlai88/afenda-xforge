export type RetailSeasonalHourlyWorkforceSchedulingStatus =
  | "draft"
  | "active"
  | "archived";

export type RetailSeasonalHourlyWorkforceSchedulingRecord = {
  id: string;
  name: string;
  status: RetailSeasonalHourlyWorkforceSchedulingStatus;
};

export type ListRetailSeasonalHourlyWorkforceSchedulingQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateRetailSeasonalHourlyWorkforceSchedulingInput = {
  name: string;
};

export type UpdateRetailSeasonalHourlyWorkforceSchedulingInput = {
  id: string;
  name?: string;
  status?: RetailSeasonalHourlyWorkforceSchedulingStatus;
};

export const retailSeasonalHourlyWorkforceSchedulingRouteContracts =
  [] as const;

export const retailSeasonalHourlyWorkforceSchedulingFeatureId =
  "hr-suite.industry-specific.retail-seasonal-hourly-workforce-scheduling" as const;
