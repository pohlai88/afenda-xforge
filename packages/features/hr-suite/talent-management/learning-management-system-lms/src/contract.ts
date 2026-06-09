export type LearningManagementSystemLmsStatus = "draft" | "active" | "archived";

export type LearningManagementSystemLmsRecord = {
  id: string;
  name: string;
  status: LearningManagementSystemLmsStatus;
};

export type ListLearningManagementSystemLmsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateLearningManagementSystemLmsInput = {
  name: string;
};

export type UpdateLearningManagementSystemLmsInput = {
  id: string;
  name?: string;
  status?: LearningManagementSystemLmsStatus;
};

export const learningManagementSystemLmsRouteContracts = [] as const;

export const learningManagementSystemLmsFeatureId = "hr-suite.talent-management.learning-management-system-lms" as const;
