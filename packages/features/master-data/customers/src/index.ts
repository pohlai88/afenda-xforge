export type {
  CreateCustomerBody,
  Customer,
  CustomerList,
  ListCustomersQuery,
} from "./contract.ts";
export { customerFeatureManifest } from "./manifest.ts";
export { customerMetadata } from "./metadata.ts";
export {
  createCustomer,
  createCustomerRouteContract,
  customerOpenApiSchemas,
  customerRouteContracts,
  listCustomers,
  listCustomersRouteContract,
  registerCustomerOpenApi,
} from "./server.ts";
export {
  type AuditSnapshot,
  createAuditSnapshot,
  customerFeatureKey,
} from "./shared/index.ts";
