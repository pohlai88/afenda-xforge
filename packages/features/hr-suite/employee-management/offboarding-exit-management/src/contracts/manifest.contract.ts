import type { OffboardingExitManagementFeatureScope } from "../feature-scope.ts";
import type { OffboardingExitManagementFeatureId } from "../identity.ts";
import type {
  OffboardingExitManagementAcceptanceCode,
  OffboardingExitManagementRequirementCode,
} from "../registry/requirement-coverage.ts";
import type { OffboardingExitManagementBoundedContext } from "./bounded-context.contract.ts";
import type {
  OffboardingExitManagementCapability,
  OffboardingExitManagementCapabilityGroup,
} from "./capability.contract.ts";
import type { OffboardingExitManagementPermissionSet } from "./permission.contract.ts";
import type { OffboardingExitManagementRouteContractSet } from "./route.contract.ts";

export type OffboardingExitManagementManifest = {
  id: OffboardingExitManagementFeatureId;
  title: string;
  description: string;
  domain: OffboardingExitManagementFeatureScope["domain"];
  suite: OffboardingExitManagementFeatureScope["suite"];
  source: OffboardingExitManagementFeatureScope["source"];
  packageName: OffboardingExitManagementFeatureScope["packageName"];
  version: 1;
  lifecycle: "active" | "deprecated" | "retired";
  stability: "alpha" | "beta" | "stable";
  boundedContext: OffboardingExitManagementBoundedContext;
  capabilities: readonly OffboardingExitManagementCapability[];
  capabilityGroups: readonly OffboardingExitManagementCapabilityGroup[];
  permissions: OffboardingExitManagementPermissionSet;
  routeContracts: OffboardingExitManagementRouteContractSet;
  requirementCoverage: readonly OffboardingExitManagementRequirementCode[];
  acceptanceCoverage: readonly OffboardingExitManagementAcceptanceCode[];
};
