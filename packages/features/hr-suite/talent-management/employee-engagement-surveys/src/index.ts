/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateEmployeeEngagementSurveysInput,
  EmployeeEngagementSurveysRecord,
  ListEmployeeEngagementSurveysQuery,
  UpdateEmployeeEngagementSurveysInput,
} from "./contract.ts";
export { employeeEngagementSurveysExecutionSurface } from "./execution/index.ts";
export { employeeEngagementSurveysManifest } from "./manifest.ts";
export { employeeEngagementSurveysMetadata } from "./metadata.ts";
export {
  createEmployeeEngagementSurveys,
  getEmployeeEngagementSurveys,
  listEmployeeEngagementSurveys,
  employeeEngagementSurveysRouteContracts,
  updateEmployeeEngagementSurveys,
} from "./server.ts";
export { employeeEngagementSurveysFeatureScope } from "./shared/index.ts";
