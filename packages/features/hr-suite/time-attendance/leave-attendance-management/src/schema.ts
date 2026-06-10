import { z } from "zod";
import { normalizeAttendanceStatusInput } from "./shared/attendance-status.ts";

const normalizeSnakeCaseEnumValue = (value: unknown): unknown =>
  typeof value === "string" ? value.replaceAll("-", "_") : value;

export const lamAttendanceStatusValues = [
  "present",
  "absent",
  "late",
  "early_out",
  "half_day",
  "rest_day",
  "off_day",
  "public_holiday",
  "missing_punch",
] as const;

export const lamLeaveTypeKindValues = [
  "annual",
  "medical",
  "unpaid",
  "maternity",
  "paternity",
  "compassionate",
  "emergency",
  "study",
  "replacement",
  "hospitalization",
] as const;

export const lamLeaveApplicationStatusValues = [
  "draft",
  "submitted",
  "pending_approval",
  "approved",
  "rejected",
  "returned",
  "cancelled",
] as const;

export const lamLeaveDocumentStatusValues = [
  "pending_upload",
  "available",
  "rejected",
] as const;

export const lamEmployeeGenderValues = ["male", "female"] as const;

export const lamRepositoryEntityTypeValues = [
  "attendance_record",
  "leave_type",
  "leave_entitlement_rule",
  "leave_carry_forward_rule",
  "leave_blackout_period",
  "approval_route",
  "leave_balance",
  "leave_application",
  "leave_document",
  "attendance_correction",
  "company_attendance_settings",
  "leave_adjustment",
  "report_export",
] as const;

export const lamAccrualRuleValues = [
  "annual_grant",
  "monthly_accrual",
  "hire_date_prorata",
] as const;

export const lamAttendanceStatusSchema = z.preprocess(
  normalizeAttendanceStatusInput,
  z.enum(lamAttendanceStatusValues)
);

export const lamLeaveTypeKindSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(lamLeaveTypeKindValues)
);

export const lamLeaveApplicationStatusSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(lamLeaveApplicationStatusValues)
);

export const lamLeaveDocumentStatusSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(lamLeaveDocumentStatusValues)
);

export const lamLeaveDocumentKindValues = [
  "supporting_document",
  "medical_certificate",
  "panel_clinic_referral",
  "hospitalization_document",
] as const;

export const lamLeaveDocumentKindSchema = z.preprocess(
  (value) => (value == null || value === "" ? "supporting_document" : value),
  z.preprocess(normalizeSnakeCaseEnumValue, z.enum(lamLeaveDocumentKindValues))
);

export const lamEmployeeGenderSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(lamEmployeeGenderValues)
);

export const lamRepositoryEntityTypeSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(lamRepositoryEntityTypeValues)
);

export const lamAccrualRuleSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(lamAccrualRuleValues)
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

export const lamEntitlementRuleScopeSchema = z.object({
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  grade: optionalTrimmedStringSchema,
  policyGroupId: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
});

/** @deprecated Use lamEntitlementRuleScopeSchema — company scope is on the rule record. */
export const lamPolicyScopeSchema = lamEntitlementRuleScopeSchema;

export const lamAttendanceRecordSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  attendanceDate: isoDateSchema,
  status: lamAttendanceStatusSchema,
  workCalendarId: optionalTrimmedStringSchema,
  clockInAt: optionalIsoDateSchema,
  clockOutAt: optionalIsoDateSchema,
  notes: z.string().trim().nullable().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const lamAttendanceExceptionTypeValues = [
  "late_arrival",
  "early_departure",
  "absence",
  "missing_punch",
] as const;

export const lamAttendanceExceptionTypeSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(lamAttendanceExceptionTypeValues)
);

export const lamAttendanceExceptionSourceValues = [
  "status",
  "clock_policy",
  "clock_missing",
] as const;

export const lamAttendanceExceptionSourceSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(lamAttendanceExceptionSourceValues)
);

export const lamAttendanceExceptionDetectionPolicySchema = z.object({
  scheduledClockInAt: optionalIsoDateSchema,
  scheduledClockOutAt: optionalIsoDateSchema,
  gracePeriodMinutes: z.number().int().nonnegative().optional(),
});

export const lamAttendanceExceptionSchema = z.object({
  id: trimmedStringSchema,
  attendanceRecordId: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  attendanceDate: isoDateSchema,
  status: lamAttendanceStatusSchema,
  exceptionType: lamAttendanceExceptionTypeSchema,
  detectedAt: isoDateSchema,
  clockInAt: optionalIsoDateSchema,
  clockOutAt: optionalIsoDateSchema,
  workCalendarId: optionalTrimmedStringSchema,
  source: lamAttendanceExceptionSourceSchema,
});

export const lamAttendanceCorrectionStatusValues = [
  "submitted",
  "pending_approval",
  "approved",
  "rejected",
] as const;

export const lamAttendanceCorrectionStatusSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(lamAttendanceCorrectionStatusValues)
);

export const lamCompanyAttendanceSettingsSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  attendanceCorrectionsEnabled: z.boolean().default(true),
  updatedAt: isoDateSchema,
  updatedBy: optionalTrimmedStringSchema,
});

export const lamAttendanceCorrectionSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  attendanceRecordId: trimmedStringSchema,
  exceptionType: lamAttendanceExceptionTypeSchema,
  requestedStatus: lamAttendanceStatusSchema,
  requestedClockInAt: optionalIsoDateSchema,
  requestedClockOutAt: optionalIsoDateSchema,
  reason: trimmedStringSchema,
  status: lamAttendanceCorrectionStatusSchema,
  approvalRouteId: optionalTrimmedStringSchema,
  currentStepOrder: z.number().int().positive().nullable().optional(),
  approvedBy: optionalTrimmedStringSchema,
  approvedAt: optionalIsoDateSchema,
  rejectionReason: z.string().trim().nullable().optional(),
  submittedAt: isoDateSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const lamLeaveTypeSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  code: trimmedStringSchema,
  name: trimmedStringSchema,
  kind: lamLeaveTypeKindSchema,
  policyGroupId: optionalTrimmedStringSchema,
  active: z.boolean(),
  requiresDocument: z.boolean(),
  paid: z.boolean(),
  minNoticeDays: z.number().int().nonnegative().nullable().optional(),
  maxConsecutiveDays: z.number().int().positive().nullable().optional(),
  eligibilityTenureMonthsMin: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .optional(),
  eligibilityGender: lamEmployeeGenderSchema.nullable().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const lamLeaveBlackoutPeriodSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  leaveTypeId: optionalTrimmedStringSchema,
  code: trimmedStringSchema,
  title: trimmedStringSchema,
  scope: lamEntitlementRuleScopeSchema.partial().optional(),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  reason: trimmedStringSchema,
  active: z.boolean(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const lamLeaveEntitlementRuleSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  leaveTypeId: trimmedStringSchema,
  code: trimmedStringSchema,
  title: trimmedStringSchema,
  scope: lamEntitlementRuleScopeSchema.partial().optional(),
  entitlementDays: z.number().nonnegative(),
  accrualRule: lamAccrualRuleSchema.nullish(),
  tenureMonthsMin: z.number().int().nonnegative().nullable().optional(),
  tenureMonthsMax: z.number().int().nonnegative().nullable().optional(),
  effectiveFrom: isoDateSchema,
  effectiveTo: optionalIsoDateSchema,
  active: z.boolean(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const lamLeaveBalanceSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  leaveTypeId: trimmedStringSchema,
  periodYear: z.number().int(),
  openingBalance: z.number(),
  earned: z.number(),
  used: z.number(),
  pending: z.number(),
  adjusted: z.number(),
  forfeited: z.number(),
  carriedForward: z.number(),
  remaining: z.number(),
  updatedAt: isoDateSchema,
});

export const lamLeaveCarryForwardRuleSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  leaveTypeId: trimmedStringSchema,
  code: trimmedStringSchema,
  title: trimmedStringSchema,
  scope: lamEntitlementRuleScopeSchema.partial().optional(),
  maxCarryForwardDays: z.number().nonnegative(),
  forfeitUnused: z.boolean(),
  effectiveFrom: isoDateSchema,
  effectiveTo: optionalIsoDateSchema,
  active: z.boolean(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const lamLeaveBalanceCarryForwardResultSchema = z.object({
  employeeId: trimmedStringSchema,
  companyId: trimmedStringSchema,
  leaveTypeId: trimmedStringSchema,
  sourcePeriodYear: z.number().int(),
  targetPeriodYear: z.number().int(),
  matched: z.boolean(),
  carryForwardRuleId: trimmedStringSchema.nullable(),
  carryForwardRuleCode: trimmedStringSchema.nullable(),
  unusedDays: z.number().nonnegative(),
  carryForwardDays: z.number().nonnegative(),
  forfeitDays: z.number().nonnegative(),
  processedAt: isoDateSchema,
});

export const lamLeaveApprovalStepKindValues = [
  "direct_manager",
  "department_head",
  "hr_officer",
  "named_approver",
] as const;

export const lamLeaveApprovalStepKindSchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(lamLeaveApprovalStepKindValues)
);

export const lamLeaveApprovalRouteStepSchema = z.object({
  order: z.number().int().positive(),
  kind: lamLeaveApprovalStepKindSchema,
  approverRef: optionalTrimmedStringSchema,
  label: optionalTrimmedStringSchema,
  fallbackToHr: z.boolean().optional(),
});

export const lamLeaveApprovalRouteSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  code: trimmedStringSchema,
  title: trimmedStringSchema,
  leaveTypeId: optionalTrimmedStringSchema,
  scope: lamEntitlementRuleScopeSchema.partial().optional(),
  minDurationDays: z.number().int().nonnegative().nullable().optional(),
  maxDurationDays: z.number().int().positive().nullable().optional(),
  steps: z.array(lamLeaveApprovalRouteStepSchema).min(1),
  active: z.boolean(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const lamLeaveApplicationSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  leaveTypeId: trimmedStringSchema,
  status: lamLeaveApplicationStatusSchema,
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  totalDays: z.number().positive(),
  reason: z.string().trim().nullable().optional(),
  supportingDocumentId: optionalTrimmedStringSchema,
  approvalRouteId: optionalTrimmedStringSchema,
  currentStepOrder: z.number().int().positive().nullable().optional(),
  approvedBy: optionalTrimmedStringSchema,
  rejectionReason: z.union([trimmedStringSchema, z.null()]).optional(),
  returnedAt: optionalIsoDateSchema,
  returnedReason: z.string().trim().nullable().optional(),
  cancellationReason: z.string().trim().nullable().optional(),
  submittedAt: optionalIsoDateSchema,
  approvedAt: optionalIsoDateSchema,
  cancelledAt: optionalIsoDateSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const lamLeaveDocumentSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  storageKey: trimmedStringSchema,
  fileName: trimmedStringSchema,
  contentType: trimmedStringSchema,
  status: lamLeaveDocumentStatusSchema,
  documentKind: lamLeaveDocumentKindSchema,
  referenceNumber: optionalTrimmedStringSchema,
  panelClinicId: optionalTrimmedStringSchema,
  panelClinicName: optionalTrimmedStringSchema,
  issuedAt: optionalIsoDateSchema,
  expiresAt: optionalIsoDateSchema,
  hospitalizationAdmissionDate: optionalIsoDateSchema,
  hospitalizationDischargeDate: optionalIsoDateSchema,
  sourceDocumentId: optionalTrimmedStringSchema,
  leaveApplicationId: optionalTrimmedStringSchema,
  uploadedAt: optionalIsoDateSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const lamPayrollDeductionCategoryValues = [
  "unpaid_leave",
  "approved_leave",
  "absence",
  "lateness",
  "attendance_deduction",
] as const;

export const lamPayrollDeductionCategorySchema = z.preprocess(
  normalizeSnakeCaseEnumValue,
  z.enum(lamPayrollDeductionCategoryValues)
);

export const lamUnpaidLeavePayrollReferenceSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  leaveApplicationId: trimmedStringSchema,
  leaveTypeId: trimmedStringSchema,
  leaveTypeCode: trimmedStringSchema,
  leaveTypeKind: lamLeaveTypeKindSchema,
  paid: z.literal(false),
  applicationStatus: lamLeaveApplicationStatusSchema,
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  totalDays: z.number().positive(),
  approvedAt: optionalIsoDateSchema,
  approvedBy: optionalTrimmedStringSchema,
  deductionCategory: z.literal("unpaid_leave"),
  sourceReference: trimmedStringSchema,
  exportBatchId: optionalTrimmedStringSchema,
  exportedAt: optionalIsoDateSchema,
});

export const lamApprovedLeavePayrollReferenceSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  leaveApplicationId: trimmedStringSchema,
  leaveTypeId: trimmedStringSchema,
  leaveTypeCode: trimmedStringSchema,
  leaveTypeKind: lamLeaveTypeKindSchema,
  paid: z.boolean(),
  applicationStatus: lamLeaveApplicationStatusSchema,
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  totalDays: z.number().positive(),
  approvedAt: optionalIsoDateSchema,
  approvedBy: optionalTrimmedStringSchema,
  deductionCategory: z.literal("approved_leave"),
  sourceReference: trimmedStringSchema,
  exportBatchId: optionalTrimmedStringSchema,
  exportedAt: optionalIsoDateSchema,
});

export const lamAttendancePayrollReferenceSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  attendanceRecordId: trimmedStringSchema,
  attendanceDate: isoDateSchema,
  attendanceStatus: lamAttendanceStatusSchema,
  deductionCategory: z.enum(["absence", "lateness", "attendance_deduction"]),
  sourceReference: trimmedStringSchema,
  exportBatchId: optionalTrimmedStringSchema,
  exportedAt: optionalIsoDateSchema,
});

export const lamPayrollReferenceSchema = z.union([
  lamUnpaidLeavePayrollReferenceSchema,
  lamApprovedLeavePayrollReferenceSchema,
  lamAttendancePayrollReferenceSchema,
]);

export const lamPayrollReferenceExportBatchSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  payPeriodStart: isoDateSchema,
  payPeriodEnd: isoDateSchema,
  exportedAt: isoDateSchema,
  exportedBy: optionalTrimmedStringSchema,
  referenceCount: z.number().int().nonnegative(),
  referenceIds: z.array(trimmedStringSchema),
  leaveApplicationIds: z.array(trimmedStringSchema),
  attendanceRecordIds: z.array(trimmedStringSchema).default([]),
  deductionCategories: z.array(lamPayrollDeductionCategorySchema).min(1),
});

export const lamAttendanceSummarySchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  periodStart: isoDateSchema,
  periodEnd: isoDateSchema,
  daysWorked: z.number().int().nonnegative(),
  absentDays: z.number().int().nonnegative(),
  lateDays: z.number().int().nonnegative(),
  earlyOutDays: z.number().int().nonnegative(),
  halfDays: z.number().int().nonnegative(),
  missingPunchDays: z.number().int().nonnegative(),
  restDays: z.number().int().nonnegative(),
  offDays: z.number().int().nonnegative(),
  publicHolidayDays: z.number().int().nonnegative(),
  totalRecords: z.number().int().nonnegative(),
  leaveTakenDays: z.number().nonnegative(),
  leaveTakenByType: z.record(trimmedStringSchema, z.number().nonnegative()),
});

export const lamAttendanceSummaryExportBatchSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  periodStart: isoDateSchema,
  periodEnd: isoDateSchema,
  exportedAt: isoDateSchema,
  exportedBy: optionalTrimmedStringSchema,
  summaryCount: z.number().int().nonnegative(),
  employeeIds: z.array(trimmedStringSchema),
  attendanceStatus: lamAttendanceStatusSchema.optional(),
  leaveTypeId: optionalTrimmedStringSchema,
});

export const lamLeaveReportEntrySchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  periodStart: isoDateSchema,
  periodEnd: isoDateSchema,
  totalApplications: z.number().int().nonnegative(),
  totalDays: z.number().nonnegative(),
  daysByType: z.record(trimmedStringSchema, z.number().nonnegative()),
  applicationsByStatus: z.record(
    trimmedStringSchema,
    z.number().int().nonnegative()
  ),
});

export const lamLeaveReportExportBatchSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  periodStart: isoDateSchema,
  periodEnd: isoDateSchema,
  exportedAt: isoDateSchema,
  exportedBy: optionalTrimmedStringSchema,
  entryCount: z.number().int().nonnegative(),
  employeeIds: z.array(trimmedStringSchema),
  leaveTypeId: optionalTrimmedStringSchema,
  status: lamLeaveApplicationStatusSchema.optional(),
});

export const lamAuditEventSchema = z.object({
  id: trimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  actorId: z.string().trim().min(1).nullable().optional(),
  action: trimmedStringSchema,
  entityType: lamRepositoryEntityTypeSchema,
  entityId: trimmedStringSchema,
  summary: z.string().trim().nullable().optional(),
  reason: z.string().trim().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()),
  before: z.unknown().optional(),
  after: z.unknown().optional(),
  createdAt: isoDateSchema,
});

export const lamReadContextSchema = z.object({
  canRead: z.boolean().optional(),
  companyId: z.string().trim().min(1).optional(),
  tenantId: z.string().trim().min(1).optional(),
  canViewSensitive: z.boolean().optional(),
  grantedCapabilities: z.array(trimmedStringSchema).optional(),
  scopedEmployeeId: z.string().trim().min(1).optional(),
  teamEmployeeIds: z.array(trimmedStringSchema).optional(),
  attendanceCorrectionsEnabled: z.boolean().optional(),
});

export const lamWriteContextSchema = z.object({
  actorId: z.string().trim().min(1).optional(),
  canRead: z.boolean().optional(),
  companyId: z.string().trim().min(1).optional(),
  organizationId: z.string().trim().min(1).optional(),
  requestId: z.string().trim().min(1).optional(),
  tenantId: z.string().trim().min(1).optional(),
  canWrite: z.boolean().optional(),
  canViewSensitive: z.boolean().optional(),
  grantedCapabilities: z.array(trimmedStringSchema).optional(),
  scopedEmployeeId: z.string().trim().min(1).optional(),
  teamEmployeeIds: z.array(trimmedStringSchema).optional(),
  actorEmployeeId: z.string().trim().min(1).optional(),
  resolvedStepApproverEmployeeIds: z.array(trimmedStringSchema).optional(),
  hrFallbackDelegated: z.boolean().optional(),
  resolvedHrFallbackApproverEmployeeIds: z
    .array(trimmedStringSchema)
    .optional(),
  attendanceCorrectionsEnabled: z.boolean().optional(),
});

export const lamPolicyDecisionSchema = z.object({
  actorId: z.string().trim().min(1).optional(),
  approvedBy: z.string().trim().min(1).optional(),
  reason: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const lamEmployeeEntitlementProfileSchema = z.object({
  companyId: trimmedStringSchema,
  employeeId: trimmedStringSchema,
  hireDate: isoDateSchema,
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  grade: optionalTrimmedStringSchema,
  policyGroupId: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
});

export const lamEntitlementCalculationResultSchema = z.object({
  employeeId: trimmedStringSchema,
  companyId: trimmedStringSchema,
  leaveTypeId: trimmedStringSchema,
  periodYear: z.number().int(),
  asOfDate: isoDateSchema,
  matched: z.boolean(),
  entitlementRuleId: trimmedStringSchema.nullable(),
  entitlementRuleCode: trimmedStringSchema.nullable(),
  entitlementDays: z.number().nonnegative(),
  earnedDays: z.number().nonnegative(),
  accrualRule: lamAccrualRuleSchema.nullable(),
  tenureMonths: z.number().int().nonnegative(),
  calculatedAt: isoDateSchema,
});

export type LamAttendanceStatus = z.infer<typeof lamAttendanceStatusSchema>;
export type LamLeaveDocumentStatus = z.infer<
  typeof lamLeaveDocumentStatusSchema
>;
export type LamLeaveDocumentKind = z.infer<typeof lamLeaveDocumentKindSchema>;
export type LamLeaveTypeKind = z.infer<typeof lamLeaveTypeKindSchema>;
export type LamLeaveApplicationStatus = z.infer<
  typeof lamLeaveApplicationStatusSchema
>;
export type LamEmployeeGender = z.infer<typeof lamEmployeeGenderSchema>;
export type LamRepositoryEntityType = z.infer<
  typeof lamRepositoryEntityTypeSchema
>;
export type LamEntitlementRuleScope = z.infer<
  typeof lamEntitlementRuleScopeSchema
>;
export type LamPolicyScope = LamEntitlementRuleScope;
export type LamAttendanceRecord = z.infer<typeof lamAttendanceRecordSchema>;
export type LamAttendanceExceptionType = z.infer<
  typeof lamAttendanceExceptionTypeSchema
>;
export type LamAttendanceException = z.infer<
  typeof lamAttendanceExceptionSchema
>;
export type LamCompanyAttendanceSettings = z.infer<
  typeof lamCompanyAttendanceSettingsSchema
>;
export type LamAttendanceCorrection = z.infer<
  typeof lamAttendanceCorrectionSchema
>;
export type LamAttendanceCorrectionStatus = z.infer<
  typeof lamAttendanceCorrectionStatusSchema
>;
export type LamAttendanceExceptionDetectionPolicy = z.infer<
  typeof lamAttendanceExceptionDetectionPolicySchema
>;
export type LamLeaveType = z.infer<typeof lamLeaveTypeSchema>;
export type LamLeaveBlackoutPeriod = z.infer<
  typeof lamLeaveBlackoutPeriodSchema
>;
export type LamLeaveApprovalRouteStep = z.infer<
  typeof lamLeaveApprovalRouteStepSchema
>;
export type LamLeaveApprovalRoute = z.infer<typeof lamLeaveApprovalRouteSchema>;
export type LamLeaveApprovalStepKind = z.infer<
  typeof lamLeaveApprovalStepKindSchema
>;
export type LamLeaveEntitlementRule = z.infer<
  typeof lamLeaveEntitlementRuleSchema
>;
export type LamLeaveBalance = z.infer<typeof lamLeaveBalanceSchema>;
export type LamLeaveCarryForwardRule = z.infer<
  typeof lamLeaveCarryForwardRuleSchema
>;
export type LamLeaveBalanceCarryForwardResult = z.infer<
  typeof lamLeaveBalanceCarryForwardResultSchema
>;
export type LamLeaveApplication = z.infer<typeof lamLeaveApplicationSchema>;
export type LamLeaveDocument = z.infer<typeof lamLeaveDocumentSchema>;
export type LamPayrollDeductionCategory = z.infer<
  typeof lamPayrollDeductionCategorySchema
>;
export type LamUnpaidLeavePayrollReference = z.infer<
  typeof lamUnpaidLeavePayrollReferenceSchema
>;
export type LamApprovedLeavePayrollReference = z.infer<
  typeof lamApprovedLeavePayrollReferenceSchema
>;
export type LamAttendancePayrollReference = z.infer<
  typeof lamAttendancePayrollReferenceSchema
>;
export type LamPayrollReference = z.infer<typeof lamPayrollReferenceSchema>;
export type LamPayrollReferenceExportBatch = z.infer<
  typeof lamPayrollReferenceExportBatchSchema
>;
export type LamAttendanceSummary = z.infer<typeof lamAttendanceSummarySchema>;
export type LamAttendanceSummaryExportBatch = z.infer<
  typeof lamAttendanceSummaryExportBatchSchema
>;
export type LamLeaveReportEntry = z.infer<typeof lamLeaveReportEntrySchema>;
export type LamLeaveReportExportBatch = z.infer<
  typeof lamLeaveReportExportBatchSchema
>;
export type LamAuditEvent = z.infer<typeof lamAuditEventSchema>;
export type LamReadContext = z.infer<typeof lamReadContextSchema>;
export type LamWriteContext = z.infer<typeof lamWriteContextSchema>;
export type LamPolicyDecision = z.infer<typeof lamPolicyDecisionSchema>;
export type LamAccrualRule = z.infer<typeof lamAccrualRuleSchema>;
export type LamEmployeeEntitlementProfile = z.infer<
  typeof lamEmployeeEntitlementProfileSchema
>;
export type LamEntitlementCalculationResult = z.infer<
  typeof lamEntitlementCalculationResultSchema
>;
