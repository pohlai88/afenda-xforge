/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed shift-scheduling slice extracted from the
 * legacy HR suite.
 */
import "server-only";

export type {
  CreateShiftSchedulingInput,
  HrSftRoutePath,
  HrTimeSftRoutePath,
  ListShiftSchedulingQuery,
  ShiftSchedulingRecord,
  ShiftSchedulingStatus,
  UpdateShiftSchedulingInput,
} from "./contract.ts";
export { shiftSchedulingExecutionSurface } from "./execution/index.ts";
export { shiftSchedulingManifest } from "./manifest.ts";
export { shiftSchedulingMetadata } from "./metadata.ts";
export {
  createShiftScheduling,
  getShiftScheduling,
  hrSftRoutePaths,
  hrTimeSftApprovePermission,
  hrTimeSftReadPermission,
  hrTimeSftRoutePaths,
  hrTimeSftWritePermission,
  listShiftScheduling,
  shiftSchedulingFeatureId,
  shiftSchedulingRouteContracts,
  updateShiftScheduling,
} from "./server.ts";
export { shiftSchedulingFeatureScope } from "./shared/index.ts";
