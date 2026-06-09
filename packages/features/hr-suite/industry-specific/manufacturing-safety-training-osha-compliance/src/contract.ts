export type ManufacturingSafetyTrainingOshaComplianceStatus = "draft" | "active" | "archived";

export type ManufacturingSafetyTrainingOshaComplianceRecord = {
  id: string;
  name: string;
  status: ManufacturingSafetyTrainingOshaComplianceStatus;
};

export type ListManufacturingSafetyTrainingOshaComplianceQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateManufacturingSafetyTrainingOshaComplianceInput = {
  name: string;
};

export type UpdateManufacturingSafetyTrainingOshaComplianceInput = {
  id: string;
  name?: string;
  status?: ManufacturingSafetyTrainingOshaComplianceStatus;
};

export const manufacturingSafetyTrainingOshaComplianceRouteContracts = [] as const;

export const manufacturingSafetyTrainingOshaComplianceFeatureId = "hr-suite.industry-specific.manufacturing-safety-training-osha-compliance" as const;
