/**
 * Server-only public door for the feature package.
 */
import "server-only";

export type {
  Company,
  CompanyHierarchyNode,
  CompanyLifecycleBody,
  CompanyList,
  CreateCompanyBody,
  ListCompaniesQuery,
  UpdateActiveCompanyBody,
  UpdateCompanyBody,
} from "./contract.ts";
export { companyFeatureManifest } from "./manifest.ts";
export { companyMetadata } from "./metadata.ts";
export {
  archiveCompany,
  companyOpenApiSchemas,
  companyRouteContracts,
  createCompany,
  createCompanyRouteContract,
  getActiveCompanyRouteContract,
  getCompany,
  listCompanies,
  listCompaniesRouteContract,
  listCompanyHierarchy,
  registerCompanyOpenApi,
  restoreCompany,
  updateActiveCompanyRouteContract,
  updateCompany,
} from "./server.ts";
