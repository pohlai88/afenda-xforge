import type {
  complianceRegulatoryTrackingRoutePaths,
  hrComplianceRoutePaths,
} from "./route.contract.ts";

export type ComplianceRegulatoryTrackingRoutePath =
  | (typeof complianceRegulatoryTrackingRoutePaths)["hub"]
  | (typeof complianceRegulatoryTrackingRoutePaths)["compliance"]
  | ReturnType<typeof complianceRegulatoryTrackingRoutePaths.detail>;

export type HrComplianceRoutePath =
  (typeof hrComplianceRoutePaths)[keyof typeof hrComplianceRoutePaths];
