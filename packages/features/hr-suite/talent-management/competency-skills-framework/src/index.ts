/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateCompetencySkillsFrameworkInput,
  CompetencySkillsFrameworkRecord,
  ListCompetencySkillsFrameworkQuery,
  UpdateCompetencySkillsFrameworkInput,
} from "./contract.ts";
export { competencySkillsFrameworkExecutionSurface } from "./execution/index.ts";
export { competencySkillsFrameworkManifest } from "./manifest.ts";
export { competencySkillsFrameworkMetadata } from "./metadata.ts";
export {
  createCompetencySkillsFramework,
  getCompetencySkillsFramework,
  listCompetencySkillsFramework,
  competencySkillsFrameworkRouteContracts,
  updateCompetencySkillsFramework,
} from "./server.ts";
export { competencySkillsFrameworkFeatureScope } from "./shared/index.ts";
