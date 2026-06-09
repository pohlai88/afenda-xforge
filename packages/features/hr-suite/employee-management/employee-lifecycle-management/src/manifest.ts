import {
  employeeLifecycleManagementAcceptanceCoverage,
  employeeLifecycleManagementBoundedContext,
  employeeLifecycleManagementCapabilityCatalog,
  employeeLifecycleManagementFeatureId,
  employeeLifecycleManagementFeatureLabel,
  employeeLifecycleManagementFeatureScope,
  employeeLifecycleManagementPermissions,
  employeeLifecycleManagementRequirementCoverage,
  employeeLifecycleManagementRouteContracts,
} from "./contract.ts";
import type { EmployeeLifecycleManagementManifest } from "./contracts/index.ts";

export const employeeLifecycleManagementManifest: EmployeeLifecycleManagementManifest =
  {
    id: employeeLifecycleManagementFeatureId,
    title: employeeLifecycleManagementFeatureLabel,
    description:
      "Governed package for the employee lifecycle management slice extracted from the legacy HR Suite.",
    domain: employeeLifecycleManagementFeatureScope.domain,
    suite: employeeLifecycleManagementFeatureScope.suite,
    source: employeeLifecycleManagementFeatureScope.source,
    packageName: employeeLifecycleManagementFeatureScope.packageName,
    version: 1,
    lifecycle: "active",
    stability: "alpha",
    boundedContext: employeeLifecycleManagementBoundedContext,
    capabilities: employeeLifecycleManagementCapabilityCatalog,
    permissions: employeeLifecycleManagementPermissions,
    routeContracts: employeeLifecycleManagementRouteContracts,
    requirementCoverage: employeeLifecycleManagementRequirementCoverage,
    acceptanceCoverage: employeeLifecycleManagementAcceptanceCoverage,
  };
