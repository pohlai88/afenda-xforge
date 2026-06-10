import type { OffboardingExitManagementManifest } from "./contracts/index.ts";
import {
  offboardingExitManagementManifestRouteContracts,
  offboardingExitManagementManifestSchema,
} from "./contracts/index.ts";
import {
  hrSuiteFeatureScope,
  offboardingExitManagementFeatureScope,
} from "./feature-scope.ts";
import { offboardingExitManagementMetadata } from "./metadata.ts";

export const offboardingExitManagementManifest: OffboardingExitManagementManifest =
  offboardingExitManagementManifestSchema.parse({
    id: offboardingExitManagementMetadata.id,
    title: offboardingExitManagementMetadata.title,
    description: offboardingExitManagementMetadata.description,
    domain: offboardingExitManagementMetadata.domain,
    version: 1,
    schemaVersion: 1,
    lifecycle: "active",
    stability: "alpha",
    packageName: offboardingExitManagementFeatureScope.packageName,
    source: hrSuiteFeatureScope.source,
    suite: hrSuiteFeatureScope.suite,
    boundedContext: {
      ownedCapabilities: [
        "post-exit offboarding case orchestration",
        "checklist task governance",
        "clearance progress tracking",
        "exit interview capture",
      ],
      ownedEntities: [
        "offboarding case",
        "offboarding task",
        "offboarding approval",
        "offboarding clearance item",
      ],
      inputs: [
        "lifecycle exit handoff",
        "employee record reference",
        "document reference",
        "asset and access recovery reference",
      ],
      outputs: [
        "offboarding case status",
        "settlement readiness reference",
        "rehire eligibility classification",
        "offboarding audit history",
      ],
      exclusions: [
        "employee master profile ownership",
        "exit lifecycle initiation",
        "payroll calculation",
        "document binary storage",
      ],
    },
    ownership: {
      businessOwner: "HR Operations",
      technicalOwner: "HR Platform",
      dataSteward: "People Governance",
    },
    integrations: [
      {
        feature: "employee-lifecycle-management",
        relationship: "consumes_handoff",
        purpose:
          "Starts offboarding from governed lifecycle trigger references.",
      },
      {
        feature: "employee-records-management",
        relationship: "reads_reference",
        purpose:
          "Uses employee identity references without taking over master ownership.",
      },
      {
        feature: "documents-management",
        relationship: "links_document_reference",
        purpose:
          "Stores document references for handover and closure evidence.",
      },
    ],
    routeContracts: offboardingExitManagementManifestRouteContracts,
  });
