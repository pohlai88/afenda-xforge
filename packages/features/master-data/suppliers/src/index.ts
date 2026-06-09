/**
 * Server-only public door for the feature package.
 */
import "server-only";

export type {
  CreateSupplierBody,
  ListSuppliersQuery,
  Supplier,
  SupplierList,
} from "./contract.ts";
export { supplierExecutionSurface } from "./execution/index.ts";
export { supplierFeatureManifest } from "./manifest.ts";
export { supplierMetadata } from "./metadata.ts";
export {
  createSupplier,
  createSupplierRouteContract,
  listSuppliers,
  listSuppliersRouteContract,
  registerSupplierOpenApi,
  supplierOpenApiSchemas,
  supplierRouteContracts,
} from "./server.ts";
export { supplierFeatureKey } from "./shared/index.ts";
