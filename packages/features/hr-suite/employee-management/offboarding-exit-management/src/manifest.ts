import type { OffboardingExitManagementManifest } from "./contracts/index.ts";
import {
  offboardingExitManagementPermissions,
  offboardingExitManagementRouteContracts,
} from "./contracts/index.ts";
import { offboardingExitManagementFeatureScope } from "./feature-scope.ts";
import {
  offboardingExitManagementFeatureId,
  offboardingExitManagementFeatureLabel,
} from "./identity.ts";
import {
  offboardingExitManagementAcceptanceCoverage,
  offboardingExitManagementBoundedContext,
  offboardingExitManagementCapabilityCatalog,
  offboardingExitManagementCapabilityGroups,
  offboardingExitManagementRequirementCoverage,
} from "./registry/index.ts";

export const offboardingExitManagementManifest: OffboardingExitManagementManifest =
  {
    id: offboardingExitManagementFeatureId,
    title: offboardingExitManagementFeatureLabel,
    description:
      "Governed package foundation for offboarding exit management aligned to the HR suite architecture and ownership boundaries.",
    domain: offboardingExitManagementFeatureScope.domain,
    suite: offboardingExitManagementFeatureScope.suite,
    source: offboardingExitManagementFeatureScope.source,
    packageName: offboardingExitManagementFeatureScope.packageName,
    version: 1,
    lifecycle: "active",
    stability: "alpha",
    boundedContext: offboardingExitManagementBoundedContext,
    capabilities: offboardingExitManagementCapabilityCatalog,
    capabilityGroups: offboardingExitManagementCapabilityGroups,
    permissions: offboardingExitManagementPermissions,
    routeContracts: offboardingExitManagementRouteContracts,
    requirementCoverage: offboardingExitManagementRequirementCoverage,
    acceptanceCoverage: offboardingExitManagementAcceptanceCoverage,
  };
