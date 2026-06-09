export type CompensationPlanningModelingStatus = "draft" | "active" | "archived";

export type CompensationPlanningModelingRecord = {
  id: string;
  name: string;
  status: CompensationPlanningModelingStatus;
};

export type ListCompensationPlanningModelingQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateCompensationPlanningModelingInput = {
  name: string;
};

export type UpdateCompensationPlanningModelingInput = {
  id: string;
  name?: string;
  status?: CompensationPlanningModelingStatus;
};

export const compensationPlanningModelingRouteContracts = [] as const;

export const compensationPlanningModelingFeatureId = "hr-suite.payroll-compensation.compensation-planning-modeling" as const;
