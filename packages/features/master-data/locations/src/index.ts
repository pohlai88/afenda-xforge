/**
 * Server-only public door for the feature package.
 */
import "server-only";

export type {
  CreateLocationBody,
  ListLocationsQuery,
  Location,
  LocationList,
} from "./contract.ts";
export { locationExecutionSurface } from "./execution/index.ts";
export { locationFeatureManifest } from "./manifest.ts";
export { locationMetadata } from "./metadata.ts";
export {
  createLocation,
  createLocationRouteContract,
  listLocations,
  listLocationsRouteContract,
  locationOpenApiSchemas,
  locationRouteContracts,
  registerLocationOpenApi,
} from "./server.ts";
export { locationFeatureKey } from "./shared/index.ts";
