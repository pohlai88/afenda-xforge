export type EmployeeEngagementSurveysStatus = "draft" | "active" | "archived";

export type EmployeeEngagementSurveysRecord = {
  id: string;
  name: string;
  status: EmployeeEngagementSurveysStatus;
};

export type ListEmployeeEngagementSurveysQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateEmployeeEngagementSurveysInput = {
  name: string;
};

export type UpdateEmployeeEngagementSurveysInput = {
  id: string;
  name?: string;
  status?: EmployeeEngagementSurveysStatus;
};

export const employeeEngagementSurveysRouteContracts = [] as const;

export const employeeEngagementSurveysFeatureId = "hr-suite.talent-management.employee-engagement-surveys" as const;
