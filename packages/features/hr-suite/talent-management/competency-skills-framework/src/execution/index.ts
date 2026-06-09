import {
  createCompetencySkillsFramework,
  getCompetencySkillsFramework,
  listCompetencySkillsFramework,
  updateCompetencySkillsFramework,
} from "../server.ts";

export const competencySkillsFrameworkExecutionSurface = {
  create: createCompetencySkillsFramework,
  getById: getCompetencySkillsFramework,
  list: listCompetencySkillsFramework,
  update: updateCompetencySkillsFramework,
};
