/**
 * Server-only public door for the feature package.
 */
import "server-only";

export type {
  CreateCustomerBody,
  Customer,
  CustomerList,
  ListCustomersQuery,
  UpdateCustomerBody,
} from "./contract.ts";
export { customerExecutionSurface } from "./execution/index.ts";
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
