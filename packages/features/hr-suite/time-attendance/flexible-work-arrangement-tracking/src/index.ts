/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed flexible-work-arrangement contracts and
 * surfaces extracted from the legacy HR suite module.
 */
import "server-only";

export type {
  CreateFlexibleWorkArrangementTrackingInput,
  FlexibleWorkArrangementTrackingRecord,
  HrFwaRoutePath,
  ListFlexibleWorkArrangementTrackingQuery,
  UpdateFlexibleWorkArrangementTrackingInput,
} from "./contract.ts";
export { flexibleWorkArrangementTrackingExecutionSurface } from "./execution/index.ts";
export { flexibleWorkArrangementTrackingManifest } from "./manifest.ts";
export { flexibleWorkArrangementTrackingMetadata } from "./metadata.ts";
export {
  createFlexibleWorkArrangementTracking,
  flexibleWorkArrangementTrackingFeatureId,
  flexibleWorkArrangementTrackingRouteContracts,
  getFlexibleWorkArrangementTracking,
  hrFwaRoutePaths,
  hrTimeFwaComplianceReadPermission,
  hrTimeFwaPayrollReadPermission,
  hrTimeFwaReadPermission,
  hrTimeFwaWritePermission,
  listFlexibleWorkArrangementTracking,
  updateFlexibleWorkArrangementTracking,
} from "./server.ts";
export { flexibleWorkArrangementTrackingFeatureScope } from "./shared/index.ts";
