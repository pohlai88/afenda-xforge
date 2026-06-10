import { z } from "zod";
import {
  offboardingAuditEventProjectionSchema,
  offboardingCaseProjectionSchema,
  offboardingChecklistProjectionSchema,
  offboardingClearanceItemProjectionSchema,
  offboardingExitInterviewProjectionSchema,
  offboardingOverviewProjectionSchema,
} from "./projection.contract.ts";

export const OFFBOARDING_EXIT_MANAGEMENT_CONTRACT_VERSION = 1 as const;

export const offboardingExitManagementRoutePaths = {
  hub: "/hr",
  offboarding: "/hr/offboarding",
  detail: (caseId: string): `/hr/offboarding/${string}` =>
    `/hr/offboarding/${caseId}`,
  checklist: (caseId: string): `/hr/offboarding/${string}/checklist` =>
    `/hr/offboarding/${caseId}/checklist`,
  exitInterview: (caseId: string): `/hr/offboarding/${string}/exit-interview` =>
    `/hr/offboarding/${caseId}/exit-interview`,
  clearance: (caseId: string): `/hr/offboarding/${string}/clearance` =>
    `/hr/offboarding/${caseId}/clearance`,
} as const;

export type OffboardingExitManagementRoutePath =
  | (typeof offboardingExitManagementRoutePaths)["hub"]
  | (typeof offboardingExitManagementRoutePaths)["offboarding"]
  | ReturnType<typeof offboardingExitManagementRoutePaths.detail>
  | ReturnType<typeof offboardingExitManagementRoutePaths.checklist>
  | ReturnType<typeof offboardingExitManagementRoutePaths.exitInterview>
  | ReturnType<typeof offboardingExitManagementRoutePaths.clearance>;

export const hrOffboardingRoutePaths = {
  hub: offboardingExitManagementRoutePaths.hub,
  offboarding: offboardingExitManagementRoutePaths.offboarding,
} as const;

export type HrOffboardingRoutePath =
  (typeof hrOffboardingRoutePaths)[keyof typeof hrOffboardingRoutePaths];

export const offboardingExitManagementRouteContracts = {
  overview: offboardingOverviewProjectionSchema,
  cases: z.array(offboardingCaseProjectionSchema),
  checklist: offboardingChecklistProjectionSchema,
  exitInterview: offboardingExitInterviewProjectionSchema,
  clearance: z.array(offboardingClearanceItemProjectionSchema),
  auditTrail: z.array(offboardingAuditEventProjectionSchema),
} as const;

export const offboardingExitManagementManifestRouteContracts = {} as const;
