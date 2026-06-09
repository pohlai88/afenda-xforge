/**
 * Server-only public door for the feature package.
 */
import "server-only";

export type {
  CreateDepartmentBody,
  Department,
  DepartmentList,
  ListDepartmentsQuery,
} from "./contract.ts";
export { departmentExecutionSurface } from "./execution/index.ts";
export { departmentFeatureManifest } from "./manifest.ts";
export { departmentMetadata } from "./metadata.ts";
export {
  createDepartment,
  createDepartmentRouteContract,
  departmentOpenApiSchemas,
  departmentRouteContracts,
  listDepartments,
  listDepartmentsRouteContract,
  registerDepartmentOpenApi,
} from "./server.ts";
export { departmentFeatureKey } from "./shared/index.ts";
