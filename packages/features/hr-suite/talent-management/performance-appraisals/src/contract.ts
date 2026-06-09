export type PerformanceAppraisalsStatus = "draft" | "active" | "archived";

export type PerformanceAppraisalsRecord = {
  id: string;
  name: string;
  status: PerformanceAppraisalsStatus;
};

export type ListPerformanceAppraisalsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreatePerformanceAppraisalsInput = {
  name: string;
};

export type UpdatePerformanceAppraisalsInput = {
  id: string;
  name?: string;
  status?: PerformanceAppraisalsStatus;
};

export const performanceAppraisalsRouteContracts = [] as const;

export const performanceAppraisalsFeatureId =
  "hr-suite.talent-management.performance-appraisals" as const;
