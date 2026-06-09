import type { ComplianceRegulatoryTrackingMetadata } from "./contracts/index.ts";
import { complianceRegulatoryTrackingMetadataSchema } from "./contracts/index.ts";
import {
  complianceRegulatoryTrackingDomain,
  complianceRegulatoryTrackingFeature,
  complianceRegulatoryTrackingFeatureId,
} from "./identity.ts";

export const complianceRegulatoryTrackingMetadata: ComplianceRegulatoryTrackingMetadata =
  complianceRegulatoryTrackingMetadataSchema.parse({
    id: complianceRegulatoryTrackingFeatureId,
    title: "Compliance & Regulatory Tracking",
    description:
      "Tracks employee-related compliance obligations, work eligibility, statutory requirements, compliance evidence, regulatory deadlines, exceptions, corrective actions, and audit readiness.",
    domain: complianceRegulatoryTrackingDomain,
    feature: complianceRegulatoryTrackingFeature,
    category: "employee-management",
    tags: [
      "compliance",
      "regulatory",
      "work-eligibility",
      "statutory",
      "audit",
      "governance",
      "risk",
      "training",
    ],
    keywords: [
      "labor law",
      "work permit",
      "visa",
      "passport",
      "right to work",
      "regulatory filing",
      "compliance exception",
      "corrective action",
      "compliance evidence",
      "audit trail",
    ],
    icon: "shield-check",
    maturity: "enterprise",
    visibility: "internal",
    version: 1,
  });
