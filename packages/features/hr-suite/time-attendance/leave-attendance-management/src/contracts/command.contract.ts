import { z } from "zod";
import type {
  lamEntitlementCalculationResultSchema,
  lamLeaveBalanceCarryForwardResultSchema,
} from "../schema.ts";
import {
  lamAccrualRuleSchema,
  lamAttendanceExceptionTypeSchema,
  lamAttendanceStatusSchema,
  lamEmployeeGenderSchema,
  lamLeaveApplicationStatusSchema,
  lamLeaveApprovalStepKindSchema,
  lamLeaveDocumentKindSchema,
  lamLeaveTypeKindSchema,
  lamPayrollDeductionCategorySchema,
  optionalTrimmedStringSchema,
  trimmedStringSchema,
} from "../schema.ts";

export type LamMutationResult =
  | { ok: true; targetId: string; message?: string }
  | { ok: false; error: string };

export type LamLeaveDocumentUploadSessionResult =
  | { ok: true; targetId: string; storageKey: string }
  | { ok: false; error: string };

export const upsertLamLeaveTypeInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  code: trimmedStringSchema,
  name: trimmedStringSchema,
  kind: lamLeaveTypeKindSchema,
  policyGroupId: optionalTrimmedStringSchema,
  active: z.boolean().optional(),
  requiresDocument: z.boolean().optional(),
  paid: z.boolean().optional(),
  minNoticeDays: z.number().int().nonnegative().nullable().optional(),
  maxConsecutiveDays: z.number().int().positive().nullable().optional(),
  eligibilityTenureMonthsMin: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .optional(),
  eligibilityGender: lamEmployeeGenderSchema.nullable().optional(),
});

export const upsertLamAttendanceRecordInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  attendanceDate: z.coerce.date(),
  status: lamAttendanceStatusSchema,
  workCalendarId: optionalTrimmedStringSchema,
  clockInAt: z.coerce.date().nullish(),
  clockOutAt: z.coerce.date().nullish(),
  notes: z.string().trim().nullable().optional(),
});

export const submitLamAttendanceCorrectionInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  attendanceRecordId: trimmedStringSchema,
  exceptionType: lamAttendanceExceptionTypeSchema,
  requestedStatus: lamAttendanceStatusSchema,
  requestedClockInAt: z.coerce.date().nullish(),
  requestedClockOutAt: z.coerce.date().nullish(),
  reason: trimmedStringSchema,
  scheduledClockInAt: z.coerce.date().optional(),
  scheduledClockOutAt: z.coerce.date().optional(),
  gracePeriodMinutes: z.coerce.number().int().nonnegative().optional(),
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  grade: optionalTrimmedStringSchema,
  policyGroupId: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
});

const lamAttendanceCorrectionDecisionBaseInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  correctionId: trimmedStringSchema,
  approvedBy: optionalTrimmedStringSchema,
  notes: z.string().trim().optional(),
});

export const approveLamAttendanceCorrectionInputSchema =
  lamAttendanceCorrectionDecisionBaseInputSchema;

export const rejectLamAttendanceCorrectionInputSchema =
  lamAttendanceCorrectionDecisionBaseInputSchema.extend({
    rejectionReason: trimmedStringSchema,
  });

export const submitLamLeaveApplicationInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  leaveTypeId: trimmedStringSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  totalDays: z.number().positive(),
  reason: z.string().trim().nullable().optional(),
  supportingDocumentId: optionalTrimmedStringSchema,
  hireDate: z.coerce.date().optional(),
  gender: lamEmployeeGenderSchema.nullish(),
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  grade: optionalTrimmedStringSchema,
  policyGroupId: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
});

export const createLamLeaveDocumentUploadSessionInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  fileName: trimmedStringSchema,
  contentType: trimmedStringSchema,
  documentKind: lamLeaveDocumentKindSchema.optional(),
  referenceNumber: optionalTrimmedStringSchema,
  panelClinicId: optionalTrimmedStringSchema,
  panelClinicName: optionalTrimmedStringSchema,
  issuedAt: z.coerce.date().nullish(),
  expiresAt: z.coerce.date().nullish(),
  hospitalizationAdmissionDate: z.coerce.date().nullish(),
  hospitalizationDischargeDate: z.coerce.date().nullish(),
  sourceDocumentId: optionalTrimmedStringSchema,
});

export const confirmLamLeaveDocumentUploadInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  documentId: trimmedStringSchema,
  employeeId: optionalTrimmedStringSchema,
});

export const upsertLamLeaveBlackoutPeriodInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  leaveTypeId: optionalTrimmedStringSchema,
  code: trimmedStringSchema,
  title: trimmedStringSchema,
  scope: z
    .object({
      countryCode: optionalTrimmedStringSchema,
      legalEntityCode: optionalTrimmedStringSchema,
      workLocationCode: optionalTrimmedStringSchema,
      employmentType: optionalTrimmedStringSchema,
      grade: optionalTrimmedStringSchema,
      policyGroupId: optionalTrimmedStringSchema,
      departmentId: optionalTrimmedStringSchema,
    })
    .partial()
    .optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: trimmedStringSchema,
  active: z.boolean().optional(),
});

export const upsertLamCompanyAttendanceSettingsInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  attendanceCorrectionsEnabled: z.boolean(),
});

const lamApprovalRouteScopeInputSchema = z
  .object({
    countryCode: optionalTrimmedStringSchema,
    legalEntityCode: optionalTrimmedStringSchema,
    workLocationCode: optionalTrimmedStringSchema,
    employmentType: optionalTrimmedStringSchema,
    grade: optionalTrimmedStringSchema,
    policyGroupId: optionalTrimmedStringSchema,
    departmentId: optionalTrimmedStringSchema,
  })
  .partial()
  .optional();

export const upsertLamLeaveApprovalRouteInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  code: trimmedStringSchema,
  title: trimmedStringSchema,
  leaveTypeId: optionalTrimmedStringSchema,
  scope: lamApprovalRouteScopeInputSchema,
  minDurationDays: z.number().int().nonnegative().nullable().optional(),
  maxDurationDays: z.number().int().positive().nullable().optional(),
  steps: z
    .array(
      z.object({
        order: z.number().int().positive(),
        kind: lamLeaveApprovalStepKindSchema,
        approverRef: optionalTrimmedStringSchema,
        label: optionalTrimmedStringSchema,
        fallbackToHr: z.boolean().optional(),
      })
    )
    .min(1),
  active: z.boolean().optional(),
});

export const routeLamLeaveApplicationInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  applicationId: trimmedStringSchema,
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  grade: optionalTrimmedStringSchema,
  policyGroupId: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
});

const lamLeaveApplicationDecisionBaseInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  applicationId: trimmedStringSchema,
  approvedBy: optionalTrimmedStringSchema,
  notes: z.string().trim().optional(),
});

export const approveLamLeaveApplicationInputSchema =
  lamLeaveApplicationDecisionBaseInputSchema;

export const rejectLamLeaveApplicationInputSchema =
  lamLeaveApplicationDecisionBaseInputSchema.extend({
    rejectionReason: z
      .string()
      .trim()
      .min(1, { message: "rejection reason is required" }),
  });

export const returnLamLeaveApplicationInputSchema =
  lamLeaveApplicationDecisionBaseInputSchema.extend({
    returnedReason: trimmedStringSchema,
  });

export const requestLamLeaveApplicationClarificationInputSchema =
  lamLeaveApplicationDecisionBaseInputSchema.extend({
    clarificationReason: trimmedStringSchema,
  });

export const cancelLamLeaveApplicationInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  applicationId: trimmedStringSchema,
  cancelledBy: optionalTrimmedStringSchema,
  cancellationReason: trimmedStringSchema,
});

export const amendLamLeaveApplicationInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  applicationId: trimmedStringSchema,
  amendedBy: optionalTrimmedStringSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  totalDays: z.number().positive(),
  reason: z.string().trim().nullable().optional(),
  amendmentReason: trimmedStringSchema,
  hireDate: z.coerce.date().optional(),
  gender: lamEmployeeGenderSchema.nullish(),
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  grade: optionalTrimmedStringSchema,
  policyGroupId: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
});

export const upsertLamLeaveEntitlementRuleInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  leaveTypeId: trimmedStringSchema,
  code: trimmedStringSchema,
  title: trimmedStringSchema,
  scope: z
    .object({
      countryCode: optionalTrimmedStringSchema,
      legalEntityCode: optionalTrimmedStringSchema,
      workLocationCode: optionalTrimmedStringSchema,
      employmentType: optionalTrimmedStringSchema,
      grade: optionalTrimmedStringSchema,
      policyGroupId: optionalTrimmedStringSchema,
      departmentId: optionalTrimmedStringSchema,
    })
    .partial()
    .optional(),
  entitlementDays: z.number().nonnegative(),
  accrualRule: lamAccrualRuleSchema.nullish(),
  tenureMonthsMin: z.number().int().nonnegative().nullable().optional(),
  tenureMonthsMax: z.number().int().nonnegative().nullable().optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().nullish(),
  active: z.boolean().optional(),
});

export type UpsertLamLeaveTypeInput = z.infer<
  typeof upsertLamLeaveTypeInputSchema
>;
export type UpsertLamAttendanceRecordInput = z.infer<
  typeof upsertLamAttendanceRecordInputSchema
>;
export type SubmitLamAttendanceCorrectionInput = z.infer<
  typeof submitLamAttendanceCorrectionInputSchema
>;
export type ApproveLamAttendanceCorrectionInput = z.infer<
  typeof approveLamAttendanceCorrectionInputSchema
>;
export type RejectLamAttendanceCorrectionInput = z.infer<
  typeof rejectLamAttendanceCorrectionInputSchema
>;
export type SubmitLamLeaveApplicationInput = z.infer<
  typeof submitLamLeaveApplicationInputSchema
>;
export type CreateLamLeaveDocumentUploadSessionInput = z.infer<
  typeof createLamLeaveDocumentUploadSessionInputSchema
>;
export type ConfirmLamLeaveDocumentUploadInput = z.infer<
  typeof confirmLamLeaveDocumentUploadInputSchema
>;
export type UpsertLamLeaveBlackoutPeriodInput = z.infer<
  typeof upsertLamLeaveBlackoutPeriodInputSchema
>;
export type UpsertLamCompanyAttendanceSettingsInput = z.infer<
  typeof upsertLamCompanyAttendanceSettingsInputSchema
>;
export type UpsertLamLeaveApprovalRouteInput = z.infer<
  typeof upsertLamLeaveApprovalRouteInputSchema
>;
export type RouteLamLeaveApplicationInput = z.infer<
  typeof routeLamLeaveApplicationInputSchema
>;
export type ApproveLamLeaveApplicationInput = z.infer<
  typeof approveLamLeaveApplicationInputSchema
>;
export type RejectLamLeaveApplicationInput = z.infer<
  typeof rejectLamLeaveApplicationInputSchema
>;
export type ReturnLamLeaveApplicationInput = z.infer<
  typeof returnLamLeaveApplicationInputSchema
>;
export type RequestLamLeaveApplicationClarificationInput = z.infer<
  typeof requestLamLeaveApplicationClarificationInputSchema
>;
export type CancelLamLeaveApplicationInput = z.infer<
  typeof cancelLamLeaveApplicationInputSchema
>;
export type AmendLamLeaveApplicationInput = z.infer<
  typeof amendLamLeaveApplicationInputSchema
>;
export type UpsertLamLeaveEntitlementRuleInput = z.infer<
  typeof upsertLamLeaveEntitlementRuleInputSchema
>;

export const exportLamPayrollReferencesInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  payPeriodStart: z.coerce.date(),
  payPeriodEnd: z.coerce.date(),
  employeeId: optionalTrimmedStringSchema,
  includeAlreadyExported: z.boolean().optional(),
  exportedBy: optionalTrimmedStringSchema,
  deductionCategories: z
    .array(lamPayrollDeductionCategorySchema)
    .min(1)
    .optional(),
});

export type ExportLamPayrollReferencesInput = z.infer<
  typeof exportLamPayrollReferencesInputSchema
>;

export const exportLamAttendanceSummaryInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  employeeId: optionalTrimmedStringSchema,
  employeeIds: z.array(trimmedStringSchema).optional(),
  attendanceStatus: lamAttendanceStatusSchema.optional(),
  leaveTypeId: optionalTrimmedStringSchema,
  exportedBy: optionalTrimmedStringSchema,
});

export type ExportLamAttendanceSummaryInput = z.infer<
  typeof exportLamAttendanceSummaryInputSchema
>;

export const exportLamLeaveReportInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  employeeId: optionalTrimmedStringSchema,
  employeeIds: z.array(trimmedStringSchema).optional(),
  leaveTypeId: optionalTrimmedStringSchema,
  status: lamLeaveApplicationStatusSchema.optional(),
  exportedBy: optionalTrimmedStringSchema,
});

export type ExportLamLeaveReportInput = z.infer<
  typeof exportLamLeaveReportInputSchema
>;

export const calculateLamLeaveEntitlementInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  hireDate: z.coerce.date(),
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  grade: optionalTrimmedStringSchema,
  policyGroupId: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
  periodYear: z.number().int().optional(),
  asOfDate: z.coerce.date().optional(),
  leaveTypeId: optionalTrimmedStringSchema,
  persist: z.boolean().optional(),
});

export type CalculateLamLeaveEntitlementInput = z.infer<
  typeof calculateLamLeaveEntitlementInputSchema
>;

export type LamEntitlementCalculationMutationResult =
  | {
      ok: true;
      targetId: string | null;
      calculations: z.infer<typeof lamEntitlementCalculationResultSchema>[];
    }
  | { ok: false; error: string };

export const adjustLamLeaveBalanceInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  balanceId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  leaveTypeId: trimmedStringSchema,
  periodYear: z.number().int(),
  adjustmentDays: z
    .number()
    .finite()
    .refine((value) => value !== 0, {
      message: "adjustmentDays must be non-zero",
    }),
  reason: z
    .string()
    .trim()
    .min(1, { message: "adjustment reason is required" }),
  authorizedBy: z
    .string()
    .trim()
    .min(1, { message: "adjustment authorization is required" }),
});

export const processLamLeaveBalanceCarryForwardInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  hireDate: z.coerce.date(),
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  grade: optionalTrimmedStringSchema,
  policyGroupId: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
  leaveTypeId: trimmedStringSchema,
  sourcePeriodYear: z.number().int(),
  targetPeriodYear: z.number().int(),
  asOfDate: z.coerce.date().optional(),
});

export const upsertLamLeaveCarryForwardRuleInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  leaveTypeId: trimmedStringSchema,
  code: trimmedStringSchema,
  title: trimmedStringSchema,
  scope: z
    .object({
      countryCode: optionalTrimmedStringSchema,
      legalEntityCode: optionalTrimmedStringSchema,
      workLocationCode: optionalTrimmedStringSchema,
      employmentType: optionalTrimmedStringSchema,
      grade: optionalTrimmedStringSchema,
      policyGroupId: optionalTrimmedStringSchema,
      departmentId: optionalTrimmedStringSchema,
    })
    .partial()
    .optional(),
  maxCarryForwardDays: z.number().nonnegative(),
  forfeitUnused: z.boolean().optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().nullish(),
  active: z.boolean().optional(),
});

export type AdjustLamLeaveBalanceInput = z.infer<
  typeof adjustLamLeaveBalanceInputSchema
>;
export type ProcessLamLeaveBalanceCarryForwardInput = z.infer<
  typeof processLamLeaveBalanceCarryForwardInputSchema
>;
export type UpsertLamLeaveCarryForwardRuleInput = z.infer<
  typeof upsertLamLeaveCarryForwardRuleInputSchema
>;

export type LamLeaveBalanceCarryForwardMutationResult =
  | {
      ok: true;
      targetId: string | null;
      result: z.infer<typeof lamLeaveBalanceCarryForwardResultSchema>;
    }
  | { ok: false; error: string };
