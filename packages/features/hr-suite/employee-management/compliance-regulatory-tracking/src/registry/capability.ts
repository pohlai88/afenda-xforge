import type {
  ComplianceRegulatoryTrackingCapability,
  ComplianceRegulatoryTrackingCapabilityGroup,
} from "../contracts/index.ts";
import {
  complianceRegulatoryTrackingCapabilityCatalogSchema,
  complianceRegulatoryTrackingCapabilityGroupsSchema,
  complianceRegulatoryTrackingCapabilityMapSchema,
  complianceRegulatoryTrackingCapabilityValueMap,
  complianceRegulatoryTrackingSensitiveCapabilitiesSchema,
  complianceRegulatoryTrackingWriteCapabilitiesSchema,
} from "../contracts/index.ts";

export type { ComplianceRegulatoryTrackingCapability } from "../contracts/index.ts";

export const complianceRegulatoryTrackingCapabilities =
  complianceRegulatoryTrackingCapabilityMapSchema.parse({
    ...complianceRegulatoryTrackingCapabilityValueMap,
  });

export const complianceRegulatoryTrackingCapabilityCatalog = Object.values(
  complianceRegulatoryTrackingCapabilities
) as readonly ComplianceRegulatoryTrackingCapability[];

export const complianceRegulatoryTrackingCapabilityGroups: ComplianceRegulatoryTrackingCapabilityGroup[] =
  [
    {
      id: "overview",
      label: "Overview",
      capabilities: [complianceRegulatoryTrackingCapabilities.overviewRead],
    },
    {
      id: "obligations",
      label: "Obligations",
      capabilities: [
        complianceRegulatoryTrackingCapabilities.obligationsRead,
        complianceRegulatoryTrackingCapabilities.obligationsWrite,
      ],
    },
    {
      id: "requirements",
      label: "Requirements",
      capabilities: [complianceRegulatoryTrackingCapabilities.requirementsRead],
    },
    {
      id: "evidence",
      label: "Evidence",
      capabilities: [
        complianceRegulatoryTrackingCapabilities.evidenceRead,
        complianceRegulatoryTrackingCapabilities.evidenceSensitiveRead,
        complianceRegulatoryTrackingCapabilities.evidenceWrite,
      ],
    },
    {
      id: "exceptions",
      label: "Exceptions",
      capabilities: [
        complianceRegulatoryTrackingCapabilities.exceptionsRead,
        complianceRegulatoryTrackingCapabilities.exceptionsWrite,
        complianceRegulatoryTrackingCapabilities.waiversApprove,
      ],
    },
    {
      id: "corrective-actions",
      label: "Corrective Actions",
      capabilities: [
        complianceRegulatoryTrackingCapabilities.correctiveActionsRead,
        complianceRegulatoryTrackingCapabilities.correctiveActionsWrite,
      ],
    },
    {
      id: "calendar-alerts",
      label: "Calendar & Alerts",
      capabilities: [
        complianceRegulatoryTrackingCapabilities.calendarRead,
        complianceRegulatoryTrackingCapabilities.alertsRead,
      ],
    },
    {
      id: "filings",
      label: "Filings",
      capabilities: [
        complianceRegulatoryTrackingCapabilities.filingsRead,
        complianceRegulatoryTrackingCapabilities.filingsWrite,
      ],
    },
    {
      id: "audit-reports",
      label: "Audit & Reports",
      capabilities: [
        complianceRegulatoryTrackingCapabilities.auditRead,
        complianceRegulatoryTrackingCapabilities.reportsRead,
        complianceRegulatoryTrackingCapabilities.reportsExport,
      ],
    },
  ];

export const complianceRegulatoryTrackingSensitiveCapabilities: ComplianceRegulatoryTrackingCapability[] =
  [
    complianceRegulatoryTrackingCapabilities.evidenceSensitiveRead,
    complianceRegulatoryTrackingCapabilities.waiversApprove,
    complianceRegulatoryTrackingCapabilities.reportsExport,
    complianceRegulatoryTrackingCapabilities.auditRead,
  ];

export const complianceRegulatoryTrackingWriteCapabilities: ComplianceRegulatoryTrackingCapability[] =
  [
    complianceRegulatoryTrackingCapabilities.obligationsWrite,
    complianceRegulatoryTrackingCapabilities.evidenceWrite,
    complianceRegulatoryTrackingCapabilities.exceptionsWrite,
    complianceRegulatoryTrackingCapabilities.correctiveActionsWrite,
    complianceRegulatoryTrackingCapabilities.filingsWrite,
    complianceRegulatoryTrackingCapabilities.waiversApprove,
  ];

complianceRegulatoryTrackingCapabilityCatalogSchema.parse(
  complianceRegulatoryTrackingCapabilityCatalog
);
complianceRegulatoryTrackingCapabilityGroupsSchema.parse(
  complianceRegulatoryTrackingCapabilityGroups
);
complianceRegulatoryTrackingSensitiveCapabilitiesSchema.parse(
  complianceRegulatoryTrackingSensitiveCapabilities
);
complianceRegulatoryTrackingWriteCapabilitiesSchema.parse(
  complianceRegulatoryTrackingWriteCapabilities
);
