/**
 * Server-only public door for the feature package.
 */
import "server-only";

export type {
  Company,
  CompanyList,
  CreateCompanyBody,
  ListCompaniesQuery,
  UpdateActiveCompanyBody,
} from "./contract.ts";
export { companyExecutionSurface } from "./execution/index.ts";
export { companyFeatureManifest } from "./manifest.ts";
export { companyMetadata } from "./metadata.ts";
export {
  companyOpenApiSchemas,
  companyRouteContracts,
  createCompany,
  createCompanyRouteContract,
  getActiveCompanyRouteContract,
  getCompany,
  listCompanies,
  listCompaniesRouteContract,
  registerCompanyOpenApi,
  updateActiveCompanyRouteContract,
  updateCompany,
} from "./server.ts";
export { companyFeatureScope } from "./shared/index.ts";
