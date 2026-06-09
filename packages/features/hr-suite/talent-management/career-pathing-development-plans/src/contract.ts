export type CareerPathingDevelopmentPlansStatus =
  | "draft"
  | "active"
  | "archived";

export type CareerPathingDevelopmentPlansRecord = {
  id: string;
  name: string;
  status: CareerPathingDevelopmentPlansStatus;
};

export type ListCareerPathingDevelopmentPlansQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateCareerPathingDevelopmentPlansInput = {
  name: string;
};

export type UpdateCareerPathingDevelopmentPlansInput = {
  id: string;
  name?: string;
  status?: CareerPathingDevelopmentPlansStatus;
};

export const careerPathingDevelopmentPlansRouteContracts = [] as const;

export const careerPathingDevelopmentPlansFeatureId =
  "hr-suite.talent-management.career-pathing-development-plans" as const;
