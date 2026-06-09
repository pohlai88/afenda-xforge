export type CompetencySkillsFrameworkStatus = "draft" | "active" | "archived";

export type CompetencySkillsFrameworkRecord = {
  id: string;
  name: string;
  status: CompetencySkillsFrameworkStatus;
};

export type ListCompetencySkillsFrameworkQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateCompetencySkillsFrameworkInput = {
  name: string;
};

export type UpdateCompetencySkillsFrameworkInput = {
  id: string;
  name?: string;
  status?: CompetencySkillsFrameworkStatus;
};

export const competencySkillsFrameworkRouteContracts = [] as const;

export const competencySkillsFrameworkFeatureId =
  "hr-suite.talent-management.competency-skills-framework" as const;
