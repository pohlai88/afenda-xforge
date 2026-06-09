export type TrainingDevelopmentStatus = "draft" | "active" | "archived";

export type TrainingDevelopmentRecord = {
  id: string;
  name: string;
  status: TrainingDevelopmentStatus;
};

export type ListTrainingDevelopmentQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateTrainingDevelopmentInput = {
  name: string;
};

export type UpdateTrainingDevelopmentInput = {
  id: string;
  name?: string;
  status?: TrainingDevelopmentStatus;
};

export const trainingDevelopmentRouteContracts = [] as const;

export const trainingDevelopmentFeatureId = "hr-suite.talent-management.training-development" as const;
