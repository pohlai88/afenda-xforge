export type FoodHandlerCertificationHealthComplianceStatus = "draft" | "active" | "archived";

export type FoodHandlerCertificationHealthComplianceRecord = {
  id: string;
  name: string;
  status: FoodHandlerCertificationHealthComplianceStatus;
};

export type ListFoodHandlerCertificationHealthComplianceQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateFoodHandlerCertificationHealthComplianceInput = {
  name: string;
};

export type UpdateFoodHandlerCertificationHealthComplianceInput = {
  id: string;
  name?: string;
  status?: FoodHandlerCertificationHealthComplianceStatus;
};

export const foodHandlerCertificationHealthComplianceRouteContracts = [] as const;

export const foodHandlerCertificationHealthComplianceFeatureId = "hr-suite.industry-specific.food-handler-certification-health-compliance" as const;
