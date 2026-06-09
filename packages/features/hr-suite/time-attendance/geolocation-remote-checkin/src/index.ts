/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed geolocation-remote-checkin slice extracted
 * from the legacy HR suite.
 */
import "server-only";

export type {
  CreateGeolocationRemoteCheckinInput,
  GeolocationRemoteCheckinRecord,
  GeolocationRemoteCheckinRoutePath,
  ListGeolocationRemoteCheckinQuery,
  UpdateGeolocationRemoteCheckinInput,
} from "./contract.ts";
export { geolocationRemoteCheckinExecutionSurface } from "./execution/index.ts";
export { geolocationRemoteCheckinManifest } from "./manifest.ts";
export { geolocationRemoteCheckinMetadata } from "./metadata.ts";
export {
  createGeolocationRemoteCheckin,
  GEO_AUDIT_KEYS,
  geolocationRemoteCheckinFeatureId,
  geolocationRemoteCheckinRouteContracts,
  geolocationRemoteCheckinRoutePaths,
  getGeolocationRemoteCheckin,
  hrTimeGeoLocationDetailReadPermission,
  hrTimeGeoReadPermission,
  hrTimeGeoWritePermission,
  listGeolocationRemoteCheckin,
  updateGeolocationRemoteCheckin,
} from "./server.ts";
export { geolocationRemoteCheckinFeatureScope } from "./shared/index.ts";
