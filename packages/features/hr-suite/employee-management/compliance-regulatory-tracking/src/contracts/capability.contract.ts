import { z } from "zod";

const capabilityStringSchema = z.string().trim().min(1);

export const complianceRegulatoryTrackingCapabilityValueMap = {
  overviewRead: "hr.compliance.overview.read",
  obligationsRead: "hr.compliance.obligations.read",
  obligationsWrite: "hr.compliance.obligations.write",
  requirementsRead: "hr.compliance.requirements.read",
  evidenceRead: "hr.compliance.evidence.read",
  evidenceSensitiveRead: "hr.compliance.evidence.sensitive.read",
  evidenceWrite: "hr.compliance.evidence.write",
  exceptionsRead: "hr.compliance.exceptions.read",
  exceptionsWrite: "hr.compliance.exceptions.write",
  correctiveActionsRead: "hr.compliance.corrective-actions.read",
  correctiveActionsWrite: "hr.compliance.corrective-actions.write",
  calendarRead: "hr.compliance.calendar.read",
  alertsRead: "hr.compliance.alerts.read",
  auditRead: "hr.compliance.audit.read",
  filingsRead: "hr.compliance.filings.read",
  filingsWrite: "hr.compliance.filings.write",
  reportsRead: "hr.compliance.reports.read",
  reportsExport: "hr.compliance.reports.export",
  waiversApprove: "hr.compliance.waivers.approve",
} as const;

export const complianceRegulatoryTrackingCapabilityValues = Object.values(
  complianceRegulatoryTrackingCapabilityValueMap
) as [
  (typeof complianceRegulatoryTrackingCapabilityValueMap)[keyof typeof complianceRegulatoryTrackingCapabilityValueMap],
  ...(typeof complianceRegulatoryTrackingCapabilityValueMap)[keyof typeof complianceRegulatoryTrackingCapabilityValueMap][],
];

export const complianceRegulatoryTrackingCapabilityMapSchema = z.object({
  overviewRead: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.overviewRead
  ),
  obligationsRead: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.obligationsRead
  ),
  obligationsWrite: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.obligationsWrite
  ),
  requirementsRead: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.requirementsRead
  ),
  evidenceRead: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.evidenceRead
  ),
  evidenceSensitiveRead: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.evidenceSensitiveRead
  ),
  evidenceWrite: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.evidenceWrite
  ),
  exceptionsRead: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.exceptionsRead
  ),
  exceptionsWrite: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.exceptionsWrite
  ),
  correctiveActionsRead: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.correctiveActionsRead
  ),
  correctiveActionsWrite: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.correctiveActionsWrite
  ),
  calendarRead: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.calendarRead
  ),
  alertsRead: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.alertsRead
  ),
  auditRead: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.auditRead
  ),
  filingsRead: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.filingsRead
  ),
  filingsWrite: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.filingsWrite
  ),
  reportsRead: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.reportsRead
  ),
  reportsExport: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.reportsExport
  ),
  waiversApprove: z.literal(
    complianceRegulatoryTrackingCapabilityValueMap.waiversApprove
  ),
});

export type ComplianceRegulatoryTrackingCapabilityMap = z.infer<
  typeof complianceRegulatoryTrackingCapabilityMapSchema
>;

export const complianceRegulatoryTrackingCapabilitySchema = z.enum(
  complianceRegulatoryTrackingCapabilityValues
);

export type ComplianceRegulatoryTrackingCapability = z.infer<
  typeof complianceRegulatoryTrackingCapabilitySchema
>;

export const complianceRegulatoryTrackingCapabilityCatalogSchema = z
  .array(complianceRegulatoryTrackingCapabilitySchema)
  .min(1);

export const complianceRegulatoryTrackingCapabilityGroupSchema = z.object({
  id: capabilityStringSchema,
  label: capabilityStringSchema,
  capabilities: z.array(complianceRegulatoryTrackingCapabilitySchema).min(1),
});

export const complianceRegulatoryTrackingCapabilityGroupsSchema = z
  .array(complianceRegulatoryTrackingCapabilityGroupSchema)
  .min(1);

export const complianceRegulatoryTrackingSensitiveCapabilitiesSchema = z
  .array(complianceRegulatoryTrackingCapabilitySchema)
  .min(1);

export const complianceRegulatoryTrackingWriteCapabilitiesSchema = z
  .array(complianceRegulatoryTrackingCapabilitySchema)
  .min(1);

export type ComplianceRegulatoryTrackingCapabilityGroup = z.infer<
  typeof complianceRegulatoryTrackingCapabilityGroupSchema
>;
