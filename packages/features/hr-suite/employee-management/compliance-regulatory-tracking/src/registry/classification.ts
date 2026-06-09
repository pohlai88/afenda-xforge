import type {
  ComplianceRegulatoryTrackingDataClassification,
  ComplianceRegulatoryTrackingGovernance,
  ComplianceRegulatoryTrackingOwnership,
  ComplianceRegulatoryTrackingRiskClassification,
  ComplianceRegulatoryTrackingStatus,
} from "../contracts/index.ts";
import {
  complianceRegulatoryTrackingDataClassificationSchema,
  complianceRegulatoryTrackingGovernanceSchema,
  complianceRegulatoryTrackingOwnershipSchema,
  complianceRegulatoryTrackingRiskClassificationSchema,
  complianceRegulatoryTrackingStatusesSchema,
} from "../contracts/index.ts";

export const complianceRegulatoryTrackingOwnership: ComplianceRegulatoryTrackingOwnership =
  complianceRegulatoryTrackingOwnershipSchema.parse({
    businessOwner: "HR Compliance",
    technicalOwner: "HRM Platform",
    dataSteward: "HR Operations",
  });

export const complianceRegulatoryTrackingStatuses: ComplianceRegulatoryTrackingStatus[] =
  complianceRegulatoryTrackingStatusesSchema.parse([
    "compliant",
    "pending",
    "at_risk",
    "overdue",
    "expired",
    "waived",
    "non_compliant",
  ]);

export const complianceRegulatoryTrackingGovernance: ComplianceRegulatoryTrackingGovernance =
  complianceRegulatoryTrackingGovernanceSchema.parse({
    auditTrail: true,
    deterministicProjections: true,
    effectiveDating: true,
    exceptionManagement: true,
    jurisdictionalApplicability: true,
    sensitiveAccessControl: true,
  });

export const complianceRegulatoryTrackingDataClassification: ComplianceRegulatoryTrackingDataClassification =
  complianceRegulatoryTrackingDataClassificationSchema.parse({
    confidentiality: "restricted",
    containsPii: true,
    retentionRequired: true,
  });

export const complianceRegulatoryTrackingRiskClassification: ComplianceRegulatoryTrackingRiskClassification =
  complianceRegulatoryTrackingRiskClassificationSchema.parse({
    dataSensitivity: "high",
    auditRequired: true,
    approvalRequiredFor: [
      "approve-waiver",
      "close-corrective-action",
      "verify-sensitive-evidence",
      "export-compliance-report",
    ],
  });
