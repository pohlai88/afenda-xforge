import { z } from "zod";

const normalizeSnakeCaseEnumValue = (value: unknown): unknown =>
  typeof value === "string" ? value.replaceAll("-", "_") : value;

export const complianceStatusValues = [
  "compliant",
  "pending",
  "at_risk",
  "overdue",
  "expired",
  "waived",
  "non_compliant",
] as const;

export const complianceRiskLevelValues = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const complianceRequirementKindValues = [
  "policy_acknowledgment",
  "work_eligibility",
  "training",
  "filing",
  "document",
  "safety",
  "statutory",
] as const;

export const complianceEvidenceStatusValues = [
  "pending",
  "verified",
  "rejected",
  "expired",
] as const;

export const complianceEvidenceSensitivityValues = [
  "public",
  "restricted",
  "confidential",
] as const;

export const complianceExceptionStatusValues = [
  "open",
  "waived",
  "resolved",
  "rejected",
] as const;

export const complianceCorrectiveActionStatusValues = [
  "open",
  "in_progress",
  "done",
  "cancelled",
] as const;

export const complianceAlertKindValues = [
  "missing_evidence",
  "expiring_evidence",
  "overdue_requirement",
  "waiver_expiring",
  "exception_open",
  "rejected_evidence",
] as const;

export const complianceAlertSeverityValues = [
  "info",
  "warning",
  "high",
  "critical",
] as const;

export const complianceCalendarKindValues = [
  "initial_due",
  "renewal_due",
  "expiry",
  "filing",
] as const;

export const complianceRepositoryEntityTypeValues = [
  "obligation",
  "worker_profile",
  "evidence",
  "exception",
  "corrective_action",
  "filing",
  "alert_state",
  "report_export",
] as const;

export const complianceAlertStatusValues = [
  "open",
  "acknowledged",
  "closed",
] as const;

export const complianceCalendarStatusValues = [
  "open",
  "done",
  "closed",
] as const;

export const complianceFilingStatusValues = [
  "draft",
  "recorded",
  "submitted",
  "accepted",
  "rejected",
  "overdue",
] as const;

export const complianceReportExportFormatValues = ["csv"] as const;

export const complianceStatusSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(complianceStatusValues)
);
export const complianceRiskLevelSchema = z.enum(complianceRiskLevelValues);
export const complianceRequirementKindSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(complianceRequirementKindValues)
);
export const complianceEvidenceStatusSchema = z.enum(
  complianceEvidenceStatusValues
);
export const complianceEvidenceSensitivitySchema = z.enum(
  complianceEvidenceSensitivityValues
);
export const complianceExceptionStatusSchema = z.enum(
  complianceExceptionStatusValues
);
export const complianceCorrectiveActionStatusSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(complianceCorrectiveActionStatusValues)
);
export const complianceAlertKindSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(complianceAlertKindValues)
);
export const complianceAlertSeveritySchema = z.enum(
  complianceAlertSeverityValues
);
export const complianceCalendarKindSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(complianceCalendarKindValues)
);
export const complianceRepositoryEntityTypeSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(complianceRepositoryEntityTypeValues)
);
export const complianceAlertStatusSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(complianceAlertStatusValues)
);
export const complianceCalendarStatusSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(complianceCalendarStatusValues)
);
export const complianceFilingStatusSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(complianceFilingStatusValues)
);
export const complianceReportExportFormatSchema = z.enum(
  complianceReportExportFormatValues
);

export const isoDateSchema = z.preprocess((value: unknown) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }

  return value;
}, z.date());

export const optionalIsoDateSchema = isoDateSchema.nullish();

export const trimmedStringSchema = z.string().trim().min(1);
export const optionalTrimmedStringSchema = z.string().trim().min(1).nullish();

export const complianceScopeSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  workerCategory: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
});

export const complianceObligationSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  code: trimmedStringSchema,
  title: trimmedStringSchema,
  description: z.string().trim().nullable().optional(),
  requirementKind: complianceRequirementKindSchema,
  severity: complianceRiskLevelSchema,
  scope: complianceScopeSchema,
  expectedEvidenceType: trimmedStringSchema,
  initialDueInDays: z.number().int().positive().nullable().optional(),
  renewalEveryDays: z.number().int().positive().nullable().optional(),
  effectiveFrom: isoDateSchema,
  effectiveTo: optionalIsoDateSchema,
  active: z.boolean(),
  jurisdictionSource: trimmedStringSchema,
  version: trimmedStringSchema,
  ownerTeam: z.string().trim().nullable().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const complianceWorkerProfileSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  employeeNumber: trimmedStringSchema,
  displayName: trimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  countryCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  workerCategory: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
  hireDate: optionalIsoDateSchema,
  terminationDate: optionalIsoDateSchema,
  active: z.boolean(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const complianceEvidenceArtifactSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  obligationId: trimmedStringSchema,
  requirementId: z.string().trim().min(1).nullable().optional(),
  evidenceType: trimmedStringSchema,
  title: trimmedStringSchema,
  sourceDocumentId: z.string().trim().min(1).nullable().optional(),
  sourceDocumentNumber: z.string().trim().min(1).nullable().optional(),
  sourceNotes: z.string().trim().nullable().optional(),
  sensitivity: complianceEvidenceSensitivitySchema,
  status: complianceEvidenceStatusSchema,
  issuedAt: optionalIsoDateSchema,
  expiresAt: optionalIsoDateSchema,
  verifiedAt: optionalIsoDateSchema,
  verifiedBy: z.string().trim().min(1).nullable().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const complianceExceptionSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  obligationId: trimmedStringSchema,
  requirementId: trimmedStringSchema,
  reason: trimmedStringSchema,
  status: complianceExceptionStatusSchema,
  ownerId: z.string().trim().min(1).nullable().optional(),
  dueAt: optionalIsoDateSchema,
  waiverExpiresAt: optionalIsoDateSchema,
  approvedBy: z.string().trim().min(1).nullable().optional(),
  approvedAt: optionalIsoDateSchema,
  resolvedAt: optionalIsoDateSchema,
  resolutionNotes: z.string().trim().nullable().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const complianceCorrectiveActionSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  obligationId: trimmedStringSchema,
  requirementId: trimmedStringSchema,
  exceptionId: z.string().trim().min(1).nullable().optional(),
  title: trimmedStringSchema,
  description: z.string().trim().nullable().optional(),
  ownerId: z.string().trim().min(1).nullable().optional(),
  status: complianceCorrectiveActionStatusSchema,
  dueAt: optionalIsoDateSchema,
  completedAt: optionalIsoDateSchema,
  evidenceIds: z.array(trimmedStringSchema),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const complianceFilingRecordSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  obligationId: trimmedStringSchema,
  filingCode: trimmedStringSchema,
  title: trimmedStringSchema,
  jurisdictionSource: trimmedStringSchema,
  dueAt: isoDateSchema,
  submittedAt: optionalIsoDateSchema,
  submittedBy: optionalTrimmedStringSchema,
  status: complianceFilingStatusSchema,
  evidenceIds: z.array(trimmedStringSchema),
  confirmationReference: optionalTrimmedStringSchema,
  notes: z.string().trim().nullable().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const complianceAlertStateSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  alertId: trimmedStringSchema,
  status: complianceAlertStatusSchema,
  actorId: optionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const complianceReportExportSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  reportKind: trimmedStringSchema,
  format: complianceReportExportFormatSchema,
  fileName: trimmedStringSchema,
  contentType: trimmedStringSchema,
  content: z.string(),
  generatedBy: trimmedStringSchema,
  generatedAt: isoDateSchema,
});

export const complianceAuditEventSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  actorId: z.string().trim().min(1).nullable().optional(),
  action: trimmedStringSchema,
  entityType: complianceRepositoryEntityTypeSchema,
  entityId: trimmedStringSchema,
  summary: z.string().trim().nullable().optional(),
  reason: z.string().trim().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()),
  before: z.unknown().optional(),
  after: z.unknown().optional(),
  createdAt: isoDateSchema,
});

export const complianceRequirementSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  obligationId: trimmedStringSchema,
  obligationCode: trimmedStringSchema,
  obligationTitle: trimmedStringSchema,
  requirementKind: complianceRequirementKindSchema,
  severity: complianceRiskLevelSchema,
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  workerCategory: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
  status: complianceStatusSchema,
  riskLevel: complianceRiskLevelSchema,
  dueAt: optionalIsoDateSchema,
  expiresAt: optionalIsoDateSchema,
  evidenceIds: z.array(trimmedStringSchema),
  evidenceStatus: complianceEvidenceStatusSchema.nullable().optional(),
  exceptionId: z.string().trim().min(1).nullable().optional(),
  correctiveActionIds: z.array(trimmedStringSchema),
  statusReason: z.string().trim().nullable().optional(),
  lastEvaluatedAt: isoDateSchema,
});

export const complianceAlertSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  obligationId: trimmedStringSchema,
  requirementId: trimmedStringSchema,
  kind: complianceAlertKindSchema,
  severity: complianceAlertSeveritySchema,
  status: complianceAlertStatusSchema,
  message: trimmedStringSchema,
  dueAt: optionalIsoDateSchema,
  generatedAt: isoDateSchema,
});

export const complianceCalendarItemSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  obligationId: trimmedStringSchema,
  requirementId: trimmedStringSchema,
  kind: complianceCalendarKindSchema,
  status: complianceCalendarStatusSchema,
  severity: complianceRiskLevelSchema,
  title: trimmedStringSchema,
  dueAt: isoDateSchema,
});

export const complianceOverviewSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  generatedAt: isoDateSchema,
  totalObligations: z.number().int().nonnegative(),
  totalWorkers: z.number().int().nonnegative(),
  totalRequirements: z.number().int().nonnegative(),
  countsByStatus: z.record(
    complianceStatusSchema,
    z.number().int().nonnegative()
  ),
  countsByRiskLevel: z.record(
    complianceRiskLevelSchema,
    z.number().int().nonnegative()
  ),
  openAlerts: z.number().int().nonnegative(),
  openExceptions: z.number().int().nonnegative(),
  overdueRequirements: z.number().int().nonnegative(),
  expiringRequirements: z.number().int().nonnegative(),
});

const listQueryBaseSchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  search: z.string().trim().optional(),
  companyId: z.string().trim().min(1).optional(),
  countryCode: z.string().trim().min(1).optional(),
  legalEntityCode: z.string().trim().min(1).optional(),
  workLocationCode: z.string().trim().min(1).optional(),
  departmentId: z.string().trim().min(1).optional(),
  employeeId: z.string().trim().min(1).optional(),
});

export const complianceObligationQuerySchema = listQueryBaseSchema.extend({
  active: z.boolean().optional(),
  requirementKind: complianceRequirementKindSchema.optional(),
  severity: complianceRiskLevelSchema.optional(),
});

export const complianceRequirementQuerySchema = listQueryBaseSchema.extend({
  status: complianceStatusSchema.optional(),
  riskLevel: complianceRiskLevelSchema.optional(),
});

export const complianceEvidenceQuerySchema = listQueryBaseSchema.extend({
  status: complianceEvidenceStatusSchema.optional(),
  sensitivity: complianceEvidenceSensitivitySchema.optional(),
});

export const complianceExceptionQuerySchema = listQueryBaseSchema.extend({
  status: complianceExceptionStatusSchema.optional(),
});

export const complianceCorrectiveActionQuerySchema = listQueryBaseSchema.extend(
  {
    status: complianceCorrectiveActionStatusSchema.optional(),
  }
);

export const complianceAlertQuerySchema = listQueryBaseSchema.extend({
  status: complianceAlertStatusSchema.optional(),
  severity: complianceAlertSeveritySchema.optional(),
});

export const complianceCalendarQuerySchema = listQueryBaseSchema.extend({
  kind: complianceCalendarKindSchema.optional(),
  status: complianceCalendarStatusSchema.optional(),
});

export const complianceAuditQuerySchema = listQueryBaseSchema.extend({
  action: z.string().trim().optional(),
  entityType: complianceRepositoryEntityTypeSchema.optional(),
});

export const complianceWorkerProfileQuerySchema = listQueryBaseSchema.extend({
  active: z.boolean().optional(),
});

export const complianceFilingQuerySchema = listQueryBaseSchema.extend({
  status: complianceFilingStatusSchema.optional(),
});

export const complianceReadContextSchema = z.object({
  canRead: z.boolean().optional(),
  companyId: z.string().trim().min(1).optional(),
  canViewSensitive: z.boolean().optional(),
  grantedCapabilities: z.array(trimmedStringSchema).optional(),
});

export const complianceWriteContextSchema = z.object({
  actorId: z.string().trim().min(1).optional(),
  canRead: z.boolean().optional(),
  companyId: z.string().trim().min(1).optional(),
  organizationId: z.string().trim().min(1).optional(),
  requestId: z.string().trim().min(1).optional(),
  tenantId: z.string().trim().min(1).optional(),
  canWrite: z.boolean().optional(),
  canViewSensitive: z.boolean().optional(),
});

export const compliancePolicyDecisionSchema = z.object({
  actorId: z.string().trim().min(1).optional(),
  approvedBy: z.string().trim().min(1).optional(),
  reason: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

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
export type ComplianceObligationQuery = z.infer<
  typeof complianceObligationQuerySchema
>;
export type ComplianceRequirementQuery = z.infer<
  typeof complianceRequirementQuerySchema
>;
export type ComplianceEvidenceQuery = z.infer<
  typeof complianceEvidenceQuerySchema
>;
export type ComplianceExceptionQuery = z.infer<
  typeof complianceExceptionQuerySchema
>;
export type ComplianceCorrectiveActionQuery = z.infer<
  typeof complianceCorrectiveActionQuerySchema
>;
export type ComplianceAlertQuery = z.infer<typeof complianceAlertQuerySchema>;
export type ComplianceCalendarQuery = z.infer<
  typeof complianceCalendarQuerySchema
>;
export type ComplianceAuditQuery = z.infer<typeof complianceAuditQuerySchema>;
export type ComplianceWorkerProfileQuery = z.infer<
  typeof complianceWorkerProfileQuerySchema
>;
export type ComplianceFilingQuery = z.infer<typeof complianceFilingQuerySchema>;
export type ComplianceReadContext = z.infer<typeof complianceReadContextSchema>;
export type ComplianceWriteContext = z.infer<
  typeof complianceWriteContextSchema
>;
