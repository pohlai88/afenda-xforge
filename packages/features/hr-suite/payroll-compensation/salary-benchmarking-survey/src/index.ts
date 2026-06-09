/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateSalaryBenchmarkingSurveyInput,
  ListSalaryBenchmarkingSurveyQuery,
  SalaryBenchmarkingSurveyRecord,
  UpdateSalaryBenchmarkingSurveyInput,
} from "./contract.ts";
export { salaryBenchmarkingSurveyExecutionSurface } from "./execution/index.ts";
export { salaryBenchmarkingSurveyManifest } from "./manifest.ts";
export { salaryBenchmarkingSurveyMetadata } from "./metadata.ts";
export {
  createSalaryBenchmarkingSurvey,
  getSalaryBenchmarkingSurvey,
  listSalaryBenchmarkingSurvey,
  salaryBenchmarkingSurveyRouteContracts,
  updateSalaryBenchmarkingSurvey,
} from "./server.ts";
export { salaryBenchmarkingSurveyFeatureScope } from "./shared/index.ts";
