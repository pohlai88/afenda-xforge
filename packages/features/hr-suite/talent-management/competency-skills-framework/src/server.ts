import "server-only";

export {
  createCompetencySkillsFrameworkRecord as createCompetencySkillsFramework,
  updateCompetencySkillsFrameworkRecord as updateCompetencySkillsFramework,
} from "./actions.ts";
export { competencySkillsFrameworkRouteContracts } from "./contract.ts";
export {
  getCompetencySkillsFrameworkRecord as getCompetencySkillsFramework,
  listCompetencySkillsFrameworkRecords as listCompetencySkillsFramework,
} from "./queries.ts";
