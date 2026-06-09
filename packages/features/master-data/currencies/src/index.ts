/**
 * Server-only public door for the feature package.
 */
import "server-only";

export type {
  CreateCurrencyBody,
  Currency,
  CurrencyList,
  ListCurrenciesQuery,
} from "./contract.ts";
export { currencyExecutionSurface } from "./execution/index.ts";
export { currencyFeatureManifest } from "./manifest.ts";
export { currencyMetadata } from "./metadata.ts";
export {
  createCurrency,
  createCurrencyRouteContract,
  currencyOpenApiSchemas,
  currencyRouteContracts,
  listCurrencies,
  listCurrenciesRouteContract,
  registerCurrencyOpenApi,
} from "./server.ts";
export { currencyFeatureKey } from "./shared/index.ts";
