import type { OffboardingExitManagementMetadata } from "./contracts/index.ts";
import { offboardingExitManagementFeatureScope } from "./feature-scope.ts";
import { offboardingExitManagementFeatureId } from "./identity.ts";

export const offboardingExitManagementMetadata: OffboardingExitManagementMetadata =
  {
    id: offboardingExitManagementFeatureId,
    title: "Offboarding Exit Management",
    description:
      "Governed package foundation for orchestrating employee exit processes, clearance references, audit history, and post-employment closure.",
    domain: offboardingExitManagementFeatureScope.domain,
    labels: {
      singular: "Offboarding case",
      plural: "Offboarding cases",
    },
    source: offboardingExitManagementFeatureScope.source,
    suite: offboardingExitManagementFeatureScope.suite,
    tags: [
      "offboarding",
      "exit",
      "clearance",
      "handover",
      "asset-recovery",
      "access-revocation",
      "audit",
    ],
    keywords: [
      "resignation",
      "termination",
      "retirement",
      "notice period",
      "exit interview",
      "final settlement readiness",
      "rehire eligibility",
    ],
    icon: "log-out",
    maturity: "managed",
    visibility: "internal",
    version: 1,
  };
