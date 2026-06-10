import {
  hrSuiteFeatureSource,
  hrSuiteFeatureSuite,
  leaveAttendanceManagementDomain,
  leaveAttendanceManagementFeature,
  leaveAttendanceManagementPackageName,
} from "./identity.ts";
import type { LamPolicyContext } from "./policy.ts";

export type HrSuiteFeatureContext = LamPolicyContext;
export type LamAccessContext = HrSuiteFeatureContext;

export const hrSuiteFeatureScope = {
  source: hrSuiteFeatureSource,
  suite: hrSuiteFeatureSuite,
} as const;

export type HrSuiteFeatureScope = typeof hrSuiteFeatureScope;

export const leaveAttendanceManagementFeatureScope = {
  ...hrSuiteFeatureScope,
  domain: leaveAttendanceManagementDomain,
  feature: leaveAttendanceManagementFeature,
  packageName: leaveAttendanceManagementPackageName,
} as const;

export type LeaveAttendanceManagementFeatureScope =
  typeof leaveAttendanceManagementFeatureScope;
