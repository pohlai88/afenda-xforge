/**
 * Server-only public door for the feature package.
 *
 * This package exposes the governed offboarding contracts and surfaces
 * extracted from the legacy HR suite module.
 */
import "server-only";

export type {
  CreateOffboardingExitManagementInput,
  HrOffboardingRoutePath,
  HrSuiteFeatureContext,
  HrSuiteFeatureScope,
  HrWorkforceOffboardingAuditAction,
  ListOffboardingCasesQuery,
  ListOffboardingExitManagementQuery,
  OffboardingCaseProjection,
  OffboardingCaseRecord,
  OffboardingExitManagementFeatureScope,
  OffboardingExitManagementManifest,
  OffboardingExitManagementMetadata,
  OffboardingExitManagementRecord,
  OffboardingPolicyContext,
  OffboardingReadContext,
  OffboardingWriteContext,
  OpenOffboardingCaseInput,
  UpdateOffboardingCaseInput,
  UpdateOffboardingExitManagementInput,
} from "./contract.ts";
export {
  createOffboardingExitManagementInputSchema,
  hrOffboardingRoutePaths,
  hrWorkforceOffboardingAuditActions,
  hrWorkforceOffboardingReadPermission,
  hrWorkforceOffboardingSensitiveReadPermission,
  hrWorkforceOffboardingWritePermission,
  offboardingCaseProjectionSchema,
  offboardingCaseRecordSchema,
  offboardingExitManagementFeatureId,
  offboardingExitManagementRouteContracts,
  offboardingExitManagementRoutePaths,
  offboardingExitManagementWritePermission,
  offboardingPolicyCapabilitySchema,
  openOffboardingCaseInputSchema,
  updateOffboardingCaseInputSchema,
} from "./contract.ts";
export { offboardingExitManagementManifest } from "./manifest.ts";
export { offboardingExitManagementMetadata } from "./metadata.ts";
export {
  createOffboardingExitManagement,
  getOffboardingCaseById,
  getOffboardingExitManagement,
  listOffboardingCases,
  listOffboardingExitManagement,
  openOffboardingCase,
  updateOffboardingCase,
  updateOffboardingExitManagement,
} from "./server.ts";
