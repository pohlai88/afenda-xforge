import type { OffboardingExitManagementMetadata } from "./contracts/index.ts";
import { offboardingExitManagementMetadataSchema } from "./contracts/index.ts";
import {
  offboardingExitManagementDomain,
  offboardingExitManagementFeature,
  offboardingExitManagementFeatureId,
} from "./identity.ts";

export const offboardingExitManagementMetadata: OffboardingExitManagementMetadata =
  offboardingExitManagementMetadataSchema.parse({
    id: offboardingExitManagementFeatureId,
    title: "Offboarding & Exit Management",
    description:
      "Governed offboarding case orchestration for post-exit approvals, checklists, clearance, interviews, recovery references, settlement readiness, and closure audit history.",
    domain: offboardingExitManagementDomain,
    feature: offboardingExitManagementFeature,
    category: "employee-management",
    tags: [
      "offboarding",
      "exit-management",
      "clearance",
      "handover",
      "asset-recovery",
      "audit",
    ],
    keywords: [
      "employee separation",
      "exit checklist",
      "access revocation",
      "asset recovery",
      "exit interview",
      "final settlement readiness",
    ],
    icon: "door-open",
    maturity: "managed",
    visibility: "internal",
    version: 1,
  });
