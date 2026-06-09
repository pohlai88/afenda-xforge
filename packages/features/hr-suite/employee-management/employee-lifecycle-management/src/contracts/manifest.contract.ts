import type { EmployeeLifecycleManagementFeatureScope } from "../feature-scope.ts";
import type { EmployeeLifecycleManagementFeatureId } from "../identity.ts";
import type {
  EmployeeLifecycleManagementAcceptanceCode,
  EmployeeLifecycleManagementRequirementCode,
} from "../registry/requirement-coverage.ts";
import type { EmployeeLifecycleManagementBoundedContext } from "./bounded-context.contract.ts";
import type { EmployeeLifecycleManagementCapability } from "./capability.contract.ts";
import type { EmployeeLifecycleManagementPermissionSet } from "./permission.contract.ts";
import type { EmployeeLifecycleManagementRouteContractSet } from "./route.contract.ts";

export type EmployeeLifecycleManagementManifest = {
  id: EmployeeLifecycleManagementFeatureId;
  title: string;
  description: string;
  domain: EmployeeLifecycleManagementFeatureScope["domain"];
  suite: EmployeeLifecycleManagementFeatureScope["suite"];
  source: EmployeeLifecycleManagementFeatureScope["source"];
  packageName: EmployeeLifecycleManagementFeatureScope["packageName"];
  version: 1;
  lifecycle: "active" | "deprecated" | "retired";
  stability: "alpha" | "beta" | "stable";
  boundedContext: EmployeeLifecycleManagementBoundedContext;
  capabilities: readonly EmployeeLifecycleManagementCapability[];
  permissions: EmployeeLifecycleManagementPermissionSet;
  routeContracts: EmployeeLifecycleManagementRouteContractSet;
  requirementCoverage: readonly EmployeeLifecycleManagementRequirementCode[];
  acceptanceCoverage: readonly EmployeeLifecycleManagementAcceptanceCode[];
};
