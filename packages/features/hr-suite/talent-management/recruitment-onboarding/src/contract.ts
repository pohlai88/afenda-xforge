export type RecruitmentOnboardingStatus = "draft" | "active" | "archived";

export type RecruitmentOnboardingRecord = {
  id: string;
  name: string;
  status: RecruitmentOnboardingStatus;
};

export type ListRecruitmentOnboardingQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateRecruitmentOnboardingInput = {
  name: string;
};

export type UpdateRecruitmentOnboardingInput = {
  id: string;
  name?: string;
  status?: RecruitmentOnboardingStatus;
};

export const recruitmentOnboardingRouteContracts = [] as const;

export const recruitmentOnboardingFeatureId = "hr-suite.talent-management.recruitment-onboarding" as const;
