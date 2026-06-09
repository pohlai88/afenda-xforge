/**
 * Server-only public door for the feature package.
 */
import "server-only";

export type {
  CreateTaxCodeBody,
  ListTaxCodesQuery,
  TaxCode,
  TaxCodeList,
} from "./contract.ts";
export { taxCodeExecutionSurface } from "./execution/index.ts";
export { taxCodeFeatureManifest } from "./manifest.ts";
export { taxCodeMetadata } from "./metadata.ts";
export {
  createTaxCode,
  createTaxCodeRouteContract,
  listTaxCodes,
  listTaxCodesRouteContract,
  registerTaxCodeOpenApi,
  taxCodeOpenApiSchemas,
  taxCodeRouteContracts,
} from "./server.ts";
export { taxCodeFeatureKey } from "./shared/index.ts";
