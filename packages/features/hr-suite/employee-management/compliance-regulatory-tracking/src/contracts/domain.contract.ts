import type { z } from "zod";
import type {
  complianceAlertKindSchema,
  complianceAlertSchema,
  complianceAlertSeveritySchema,
  complianceAlertStateSchema,
  complianceAlertStatusSchema,
  complianceAuditEventSchema,
  complianceCalendarItemSchema,
  complianceCalendarKindSchema,
  complianceCalendarStatusSchema,
  complianceCorrectiveActionSchema,
  complianceCorrectiveActionStatusSchema,
  complianceEvidenceArtifactSchema,
  complianceEvidenceSensitivitySchema,
  complianceEvidenceStatusSchema,
  complianceExceptionSchema,
  complianceExceptionStatusSchema,
  complianceFilingRecordSchema,
  complianceFilingStatusSchema,
  complianceObligationSchema,
  complianceOverviewSchema,
  complianceReadContextSchema,
  complianceReportExportFormatSchema,
  complianceReportExportSchema,
  complianceRepositoryEntityTypeSchema,
  complianceRequirementKindSchema,
  complianceRequirementSchema,
  complianceRiskLevelSchema,
  complianceScopeSchema,
  complianceStatusSchema,
  complianceWorkerProfileSchema,
  complianceWriteContextSchema,
} from "../schema.ts";

export type ComplianceStatus = z.infer<typeof complianceStatusSchema>;
export type ComplianceRiskLevel = z.infer<typeof complianceRiskLevelSchema>;
export type ComplianceRequirementKind = z.infer<
  typeof complianceRequirementKindSchema
>;
export type ComplianceEvidenceStatus = z.infer<
  typeof complianceEvidenceStatusSchema
>;
export type ComplianceEvidenceSensitivity = z.infer<
  typeof complianceEvidenceSensitivitySchema
>;
export type ComplianceExceptionStatus = z.infer<
  typeof complianceExceptionStatusSchema
>;
export type ComplianceCorrectiveActionStatus = z.infer<
  typeof complianceCorrectiveActionStatusSchema
>;
export type ComplianceAlertKind = z.infer<typeof complianceAlertKindSchema>;
export type ComplianceAlertSeverity = z.infer<
  typeof complianceAlertSeveritySchema
>;
export type ComplianceAlertStatus = z.infer<typeof complianceAlertStatusSchema>;
export type ComplianceCalendarKind = z.infer<
  typeof complianceCalendarKindSchema
>;
export type ComplianceCalendarStatus = z.infer<
  typeof complianceCalendarStatusSchema
>;
export type ComplianceFilingStatus = z.infer<
  typeof complianceFilingStatusSchema
>;
export type ComplianceReportExportFormat = z.infer<
  typeof complianceReportExportFormatSchema
>;
export type ComplianceRepositoryEntityType = z.infer<
  typeof complianceRepositoryEntityTypeSchema
>;
export type ComplianceScope = z.infer<typeof complianceScopeSchema>;
export type ComplianceObligation = z.infer<typeof complianceObligationSchema>;
export type ComplianceWorkerProfile = z.infer<
  typeof complianceWorkerProfileSchema
>;
export type ComplianceEvidenceArtifact = z.infer<
  typeof complianceEvidenceArtifactSchema
>;
export type ComplianceException = z.infer<typeof complianceExceptionSchema>;
export type ComplianceCorrectiveAction = z.infer<
  typeof complianceCorrectiveActionSchema
>;
export type ComplianceFilingRecord = z.infer<
  typeof complianceFilingRecordSchema
>;
export type ComplianceAlertState = z.infer<typeof complianceAlertStateSchema>;
export type ComplianceReportExport = z.infer<
  typeof complianceReportExportSchema
>;
export type ComplianceAuditEvent = z.infer<typeof complianceAuditEventSchema>;
export type ComplianceRequirement = z.infer<typeof complianceRequirementSchema>;
export type ComplianceAlert = z.infer<typeof complianceAlertSchema>;
export type ComplianceCalendarItem = z.infer<
  typeof complianceCalendarItemSchema
>;
export type ComplianceOverview = z.infer<typeof complianceOverviewSchema>;
export type ComplianceReadContext = z.infer<typeof complianceReadContextSchema>;
export type ComplianceWriteContext = z.infer<
  typeof complianceWriteContextSchema
>;
