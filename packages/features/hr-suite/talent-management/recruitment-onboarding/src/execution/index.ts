import {
  createRecruitmentOnboarding,
  getRecruitmentOnboarding,
  listRecruitmentOnboarding,
  updateRecruitmentOnboarding,
} from "../server.ts";

export const recruitmentOnboardingExecutionSurface = {
  create: createRecruitmentOnboarding,
  getById: getRecruitmentOnboarding,
  list: listRecruitmentOnboarding,
  update: updateRecruitmentOnboarding,
};
