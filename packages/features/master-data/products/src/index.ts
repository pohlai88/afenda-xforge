/**
 * Server-only public door for the feature package.
 */
import "server-only";

export type {
  CreateProductBody,
  ListProductsQuery,
  Product,
  ProductList,
} from "./contract.ts";
export { productExecutionSurface } from "./execution/index.ts";
export { productFeatureManifest } from "./manifest.ts";
export { productMetadata } from "./metadata.ts";
export {
  createProduct,
  createProductRouteContract,
  listProducts,
  listProductsRouteContract,
  productOpenApiSchemas,
  productRouteContracts,
  registerProductOpenApi,
} from "./server.ts";
export { productFeatureKey } from "./shared/index.ts";
