import type {
  ListOffboardingCasesQuery,
  OffboardingCaseRecord,
  OffboardingCaseStatus,
  OpenOffboardingCaseInput,
  UpdateOffboardingCaseInput,
} from "./contracts/index.ts";
import {
  openOffboardingCaseInputSchema,
  updateOffboardingCaseInputSchema,
} from "./contracts/index.ts";

export type {
  HrOffboardingRoutePath,
  HrWorkforceOffboardingAuditAction,
  ListOffboardingCasesQuery,
  OffboardingAccessDecision,
  OffboardingCaseProjection,
  OffboardingCaseRecord,
  OffboardingCaseStatus,
  OffboardingExitManagementAction,
  OffboardingExitManagementActionRisk,
  OffboardingExitManagementBoundedContext,
  OffboardingExitManagementManifest,
  OffboardingExitManagementMetadata,
  OffboardingLifecycleHandoffReference,
  OffboardingPolicyCapability,
  OffboardingPolicyContext,
  OffboardingReadContext,
  OffboardingSensitiveAccessDecision,
  OffboardingSensitiveFieldPolicy,
  OffboardingTaskProjection,
  OffboardingWriteContext,
  OpenOffboardingCaseInput,
  UpdateOffboardingCaseInput,
} from "./contracts/index.ts";
export {
  hrOffboardingRoutePaths,
  hrWorkforceOffboardingAuditActions,
  hrWorkforceOffboardingReadPermission,
  hrWorkforceOffboardingSensitiveReadPermission,
  hrWorkforceOffboardingWritePermission,
  offboardingAccessDecisionSchema,
  offboardingCaseProjectionSchema,
  offboardingCaseSensitiveFieldPolicy,
  offboardingChecklistProjectionSchema,
  offboardingExitInterviewProjectionSchema,
  offboardingExitInterviewSensitiveFieldPolicy,
  offboardingExitManagementActionCatalog,
  offboardingExitManagementActionRiskSchema,
  offboardingExitManagementActionSchema,
  offboardingExitManagementAuditActions,
  offboardingExitManagementBoundedContextSchema,
  offboardingExitManagementManifestRouteContracts,
  offboardingExitManagementManifestSchema,
  offboardingExitManagementMetadataSchema,
  offboardingExitManagementReadPermission,
  offboardingExitManagementRouteContracts,
  offboardingExitManagementRoutePaths,
  offboardingExitManagementSensitiveReadPermission,
  offboardingExitManagementWritePermission,
  offboardingOverviewProjectionSchema,
  offboardingPolicyCapabilitySchema,
  offboardingPolicyContextSchema,
  offboardingReadAccessContextSchema,
  offboardingSensitiveAccessDecisionSchema,
  offboardingSensitiveFieldPolicies,
  offboardingSensitiveFieldPolicySchema,
  offboardingTaskProjectionSchema,
  offboardingWriteAccessContextSchema,
  openOffboardingCaseInputSchema,
  updateOffboardingCaseInputSchema,
} from "./contracts/index.ts";
export type {
  HrSuiteFeatureContext,
  HrSuiteFeatureScope,
  OffboardingAccessContext,
  OffboardingExitManagementFeatureScope,
} from "./feature-scope.ts";
export {
  offboardingExitManagementFeatureId,
  offboardingExitManagementPackageName,
} from "./identity.ts";
export {
  offboardingCaseRecordSchema,
  offboardingLifecycleTriggerSnapshotSchema,
  offboardingReadContextSchema,
  offboardingWriteContextSchema,
} from "./schema.ts";

export type OffboardingExitManagementStatus = OffboardingCaseStatus;
export type OffboardingExitManagementRecord = OffboardingCaseRecord;
export type ListOffboardingExitManagementQuery = ListOffboardingCasesQuery;
export type CreateOffboardingExitManagementInput = OpenOffboardingCaseInput;
export type UpdateOffboardingExitManagementInput = UpdateOffboardingCaseInput;

export const createOffboardingExitManagementInputSchema =
  openOffboardingCaseInputSchema;

export const updateOffboardingExitManagementInputSchema =
  updateOffboardingCaseInputSchema;
