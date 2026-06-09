import type {
  ComplianceRegulatoryTrackingBoundedContext,
  ComplianceRegulatoryTrackingIntegration,
} from "../contracts/index.ts";
import {
  complianceRegulatoryTrackingBoundedContextSchema,
  complianceRegulatoryTrackingIntegrationsSchema,
} from "../contracts/index.ts";

export const complianceRegulatoryTrackingOwnedCapabilities = [
  "labor-law-compliance-tracking",
  "statutory-employment-compliance-tracking",
  "work-eligibility-tracking",
  "workplace-safety-compliance-tracking",
  "mandatory-filing-deadline-tracking",
  "policy-acknowledgment-compliance-tracking",
  "compliance-document-status-monitoring",
  "training-compliance-monitoring",
  "regulatory-calendar-management",
  "compliance-alerting",
  "exception-tracking",
  "corrective-action-tracking",
  "audit-readiness-monitoring",
  "compliance-reporting-read-models",
  "compliance-audit-trail",
] as const;

export const complianceRegulatoryTrackingOwnedEntities = [
  "compliance-obligation",
  "employee-compliance-requirement",
  "evidence-artifact-reference",
  "compliance-exception",
  "corrective-action",
  "regulatory-calendar-item",
  "compliance-alert",
  "compliance-audit-event",
] as const;

export const complianceRegulatoryTrackingInputs = [
  "employee-profile-context",
  "document-management-reference",
  "training-completion-reference",
  "payroll-statutory-readiness-reference",
  "identity-and-access-context",
] as const;

export const complianceRegulatoryTrackingOutputs = [
  "compliance-overview",
  "obligation-list",
  "requirement-list",
  "exception-list",
  "evidence-list",
  "corrective-action-list",
  "regulatory-calendar",
  "alert-list",
  "audit-trail",
  "risk-and-status-projections",
];

export const complianceRegulatoryTrackingIntegrations: ComplianceRegulatoryTrackingIntegration[] =
  complianceRegulatoryTrackingIntegrationsSchema.parse([
    {
      feature: "employee-records-management",
      relationship: "consumes",
      purpose:
        "Worker identity, legal entity, location, department, and employment context.",
    },
    {
      feature: "document-management",
      relationship: "references",
      purpose:
        "Evidence and supporting compliance document linkage without owning storage.",
    },
    {
      feature: "learning-training-management",
      relationship: "consumes",
      purpose: "Mandatory training completion and certification status inputs.",
    },
    {
      feature: "payroll",
      relationship: "consumes",
      purpose:
        "Statutory readiness and filing-adjacent signals without owning payroll calculation.",
    },
    {
      feature: "identity-and-access",
      relationship: "depends-on",
      purpose:
        "Authorization, sensitive-read controls, and actor identity for auditability.",
    },
    {
      feature: "reporting-and-analytics",
      relationship: "publishes",
      purpose:
        "Compliance projections, exceptions, and audit metrics for downstream analytics.",
    },
  ]);

export const complianceRegulatoryTrackingExclusions = [
  "employee-master-profile",
  "organization-structure",
  "employee-self-service-portal",
  "document-storage-engine",
  "employee-lifecycle-workflow",
  "payroll-calculation",
  "statutory-contribution-calculation",
  "leave-application",
  "attendance-clocking-records",
  "incident-investigation-workflow",
  "legal-case-management",
  "training-course-content-authoring",
  "offboarding-clearance-workflow",
  "asset-recovery",
];

export const complianceRegulatoryTrackingBoundedContext: ComplianceRegulatoryTrackingBoundedContext =
  complianceRegulatoryTrackingBoundedContextSchema.parse({
    ownedCapabilities: complianceRegulatoryTrackingOwnedCapabilities,
    ownedEntities: complianceRegulatoryTrackingOwnedEntities,
    inputs: complianceRegulatoryTrackingInputs,
    outputs: complianceRegulatoryTrackingOutputs,
    exclusions: complianceRegulatoryTrackingExclusions,
  });
