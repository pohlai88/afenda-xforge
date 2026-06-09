import "server-only";

export { createDepartment } from "./actions.ts";
export {
  createDepartmentRouteContract,
  departmentOpenApiSchemas,
  departmentRouteContracts,
  listDepartmentsRouteContract,
  registerDepartmentOpenApi,
} from "./contract.ts";
export { listDepartments } from "./queries.ts";
