export type SuccessionPlanningStatus = "draft" | "active" | "archived";

export type SuccessionPlanningRecord = {
  id: string;
  name: string;
  status: SuccessionPlanningStatus;
};

export type ListSuccessionPlanningQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateSuccessionPlanningInput = {
  name: string;
};

export type UpdateSuccessionPlanningInput = {
  id: string;
  name?: string;
  status?: SuccessionPlanningStatus;
};

export const successionPlanningRouteContracts = [] as const;

export const successionPlanningFeatureId = "hr-suite.talent-management.succession-planning" as const;
