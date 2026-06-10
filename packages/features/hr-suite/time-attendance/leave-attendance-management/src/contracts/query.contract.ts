import { z } from "zod";
import {
  lamAttendanceExceptionTypeSchema,
  lamAttendanceStatusSchema,
  lamLeaveApplicationStatusSchema,
  lamLeaveDocumentKindSchema,
  lamLeaveTypeKindSchema,
  lamPayrollDeductionCategorySchema,
  lamRepositoryEntityTypeSchema,
  optionalTrimmedStringSchema,
  trimmedStringSchema,
} from "../schema.ts";
import { leaveAttendanceManagementAuditEventSchema } from "./audit.contract.ts";

export const listLamAttendanceRecordsQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  companyId: optionalTrimmedStringSchema,
  employeeId: optionalTrimmedStringSchema,
  status: lamAttendanceStatusSchema.optional(),
  attendanceDateFrom: z.coerce.date().optional(),
  attendanceDateTo: z.coerce.date().optional(),
  workCalendarId: optionalTrimmedStringSchema,
});

export type ListLamAttendanceRecordsQuery = z.infer<
  typeof listLamAttendanceRecordsQuerySchema
>;

export const lamAttendanceRecordRouteContractSchema = z.object({
  method: z.enum(["GET", "POST"]),
  path: trimmedStringSchema,
  capability: trimmedStringSchema,
});

export type LamAttendanceRecordRouteContract = z.infer<
  typeof lamAttendanceRecordRouteContractSchema
>;

export const lamAttendanceRecordsRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/attendance/attendance-records",
    capability: "hr.lam.attendance.read",
  },
  {
    method: "POST",
    path: "/api/hr/attendance/attendance-records",
    capability: "hr.lam.attendance.write",
  },
  {
    method: "GET",
    path: "/api/hr/attendance/attendance-records/:recordId",
    capability: "hr.lam.attendance.read",
  },
] as const satisfies readonly LamAttendanceRecordRouteContract[];

export const listLamAttendanceExceptionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(500).optional(),
  companyId: optionalTrimmedStringSchema,
  employeeId: optionalTrimmedStringSchema,
  exceptionType: lamAttendanceExceptionTypeSchema.optional(),
  attendanceDateFrom: z.coerce.date().optional(),
  attendanceDateTo: z.coerce.date().optional(),
  workCalendarId: optionalTrimmedStringSchema,
  scheduledClockInAt: z.coerce.date().optional(),
  scheduledClockOutAt: z.coerce.date().optional(),
  gracePeriodMinutes: z.coerce.number().int().nonnegative().optional(),
});

export type ListLamAttendanceExceptionsQuery = z.infer<
  typeof listLamAttendanceExceptionsQuerySchema
>;

export const lamAttendanceExceptionsRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/attendance/attendance-exceptions",
    capability: "hr.lam.attendance-corrections.read",
  },
  {
    method: "GET",
    path: "/api/hr/attendance/attendance-exceptions/:recordId",
    capability: "hr.lam.attendance-corrections.read",
  },
] as const satisfies readonly LamAttendanceRecordRouteContract[];

export const listLamAttendanceCorrectionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(500).optional(),
  companyId: optionalTrimmedStringSchema,
  employeeId: optionalTrimmedStringSchema,
  attendanceRecordId: optionalTrimmedStringSchema,
  exceptionType: lamAttendanceExceptionTypeSchema.optional(),
  status: z
    .enum(["submitted", "pending_approval", "approved", "rejected"])
    .optional(),
});

export type ListLamAttendanceCorrectionsQuery = z.infer<
  typeof listLamAttendanceCorrectionsQuerySchema
>;

export const lamAttendanceCorrectionsRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/attendance/attendance-corrections",
    capability: "hr.lam.attendance-corrections.read",
  },
  {
    method: "POST",
    path: "/api/hr/attendance/attendance-corrections",
    capability: "hr.lam.attendance-corrections.write",
  },
  {
    method: "GET",
    path: "/api/hr/attendance/attendance-corrections/:correctionId",
    capability: "hr.lam.attendance-corrections.read",
  },
  {
    method: "POST",
    path: "/api/hr/attendance/attendance-corrections/:correctionId/approve",
    capability: "hr.lam.attendance-corrections.write",
  },
  {
    method: "POST",
    path: "/api/hr/attendance/attendance-corrections/:correctionId/reject",
    capability: "hr.lam.attendance-corrections.write",
  },
] as const satisfies readonly LamAttendanceRecordRouteContract[];

export const lamAttendanceSettingsRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/attendance/attendance-settings",
    capability: "hr.lam.attendance.read",
  },
  {
    method: "POST",
    path: "/api/hr/attendance/attendance-settings",
    capability: "hr.lam.attendance.write",
  },
] as const satisfies readonly LamAttendanceRecordRouteContract[];

export const listLamLeaveTypesQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  search: z.string().trim().optional(),
  companyId: optionalTrimmedStringSchema,
  active: z.boolean().optional(),
  kind: lamLeaveTypeKindSchema.optional(),
  policyGroupId: optionalTrimmedStringSchema,
  unscopedPolicyGroupOnly: z.boolean().optional(),
});

export type ListLamLeaveTypesQuery = z.infer<
  typeof listLamLeaveTypesQuerySchema
>;

export const lamLeaveTypeRouteContractSchema = z.object({
  method: z.enum(["GET", "POST"]),
  path: trimmedStringSchema,
  capability: trimmedStringSchema,
});

export type LamLeaveTypeRouteContract = z.infer<
  typeof lamLeaveTypeRouteContractSchema
>;

export const lamLeaveTypesRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/leave/leave-types",
    capability: "hr.lam.leave-types.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-types",
    capability: "hr.lam.leave-types.write",
  },
  {
    method: "GET",
    path: "/api/hr/leave/leave-types/:leaveTypeId",
    capability: "hr.lam.leave-types.read",
  },
] as const satisfies readonly LamLeaveTypeRouteContract[];

export const listLamLeaveEntitlementRulesQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  search: z.string().trim().optional(),
  companyId: optionalTrimmedStringSchema,
  active: z.boolean().optional(),
  leaveTypeId: optionalTrimmedStringSchema,
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  grade: optionalTrimmedStringSchema,
  policyGroupId: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
  effectiveOn: z.coerce.date().optional(),
});

export type ListLamLeaveEntitlementRulesQuery = z.infer<
  typeof listLamLeaveEntitlementRulesQuerySchema
>;

export const lamLeaveEntitlementRuleRouteContractSchema = z.object({
  method: z.enum(["GET", "POST"]),
  path: trimmedStringSchema,
  capability: trimmedStringSchema,
});

export type LamLeaveEntitlementRuleRouteContract = z.infer<
  typeof lamLeaveEntitlementRuleRouteContractSchema
>;

export const lamLeaveEntitlementRulesRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/leave/leave-entitlement-rules",
    capability: "hr.lam.leave-entitlements.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-entitlement-rules",
    capability: "hr.lam.leave-entitlements.write",
  },
  {
    method: "GET",
    path: "/api/hr/leave/leave-entitlement-rules/:ruleId",
    capability: "hr.lam.leave-entitlements.read",
  },
] as const satisfies readonly LamLeaveEntitlementRuleRouteContract[];

export const listLamLeaveBalancesQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  companyId: optionalTrimmedStringSchema,
  employeeId: optionalTrimmedStringSchema,
  leaveTypeId: optionalTrimmedStringSchema,
  periodYear: z.number().int().optional(),
});

export type ListLamLeaveBalancesQuery = z.infer<
  typeof listLamLeaveBalancesQuerySchema
>;

export const listLamLeaveCarryForwardRulesQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  search: z.string().trim().optional(),
  companyId: optionalTrimmedStringSchema,
  active: z.boolean().optional(),
  leaveTypeId: optionalTrimmedStringSchema,
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  grade: optionalTrimmedStringSchema,
  policyGroupId: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
  effectiveOn: z.coerce.date().optional(),
});

export type ListLamLeaveCarryForwardRulesQuery = z.infer<
  typeof listLamLeaveCarryForwardRulesQuerySchema
>;

const lamScopedConfigListQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  search: z.string().trim().optional(),
  companyId: optionalTrimmedStringSchema,
  active: z.boolean().optional(),
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  grade: optionalTrimmedStringSchema,
  policyGroupId: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
  effectiveOn: z.coerce.date().optional(),
});

export const listLamWorkCalendarsQuerySchema =
  lamScopedConfigListQuerySchema.extend({});

export type ListLamWorkCalendarsQuery = z.infer<
  typeof listLamWorkCalendarsQuerySchema
>;

export const listLamHolidayCalendarsQuerySchema =
  lamScopedConfigListQuerySchema.extend({
    workCalendarId: optionalTrimmedStringSchema,
  });

export type ListLamHolidayCalendarsQuery = z.infer<
  typeof listLamHolidayCalendarsQuerySchema
>;

export const listLamAttendancePoliciesQuerySchema =
  lamScopedConfigListQuerySchema.extend({
    workCalendarId: optionalTrimmedStringSchema,
  });

export type ListLamAttendancePoliciesQuery = z.infer<
  typeof listLamAttendancePoliciesQuerySchema
>;

export const listLamLeaveEncashmentPoliciesQuerySchema =
  lamScopedConfigListQuerySchema.extend({
    leaveTypeId: optionalTrimmedStringSchema,
  });

export type ListLamLeaveEncashmentPoliciesQuery = z.infer<
  typeof listLamLeaveEncashmentPoliciesQuerySchema
>;

export const lamLeaveBalanceRouteContractSchema = z.object({
  method: z.enum(["GET", "POST"]),
  path: trimmedStringSchema,
  capability: trimmedStringSchema,
});

export type LamLeaveBalanceRouteContract = z.infer<
  typeof lamLeaveBalanceRouteContractSchema
>;

export type LamLeaveApplicationRouteContract = LamLeaveBalanceRouteContract;

export const lamLeaveBalancesRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/leave/leave-balances",
    capability: "hr.lam.leave-balances.read",
  },
  {
    method: "GET",
    path: "/api/hr/leave/leave-balances/:balanceId",
    capability: "hr.lam.leave-balances.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-balances/adjust",
    capability: "hr.lam.leave-balances.write",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-balances/carry-forward",
    capability: "hr.lam.leave-balances.write",
  },
] as const satisfies readonly LamLeaveBalanceRouteContract[];

export const lamLeaveCarryForwardRulesRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/leave/leave-carry-forward-rules",
    capability: "hr.lam.leave-entitlements.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-carry-forward-rules",
    capability: "hr.lam.leave-entitlements.write",
  },
  {
    method: "GET",
    path: "/api/hr/leave/leave-carry-forward-rules/:ruleId",
    capability: "hr.lam.leave-entitlements.read",
  },
] as const satisfies readonly LamLeaveEntitlementRuleRouteContract[];

export const lamWorkCalendarsRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/attendance/work-calendars",
    capability: "hr.lam.calendars.read",
  },
  {
    method: "POST",
    path: "/api/hr/attendance/work-calendars",
    capability: "hr.lam.calendars.write",
  },
  {
    method: "GET",
    path: "/api/hr/attendance/work-calendars/:calendarId",
    capability: "hr.lam.calendars.read",
  },
] as const satisfies readonly LamLeaveEntitlementRuleRouteContract[];

export const lamHolidayCalendarsRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/attendance/holiday-calendars",
    capability: "hr.lam.calendars.read",
  },
  {
    method: "POST",
    path: "/api/hr/attendance/holiday-calendars",
    capability: "hr.lam.calendars.write",
  },
  {
    method: "GET",
    path: "/api/hr/attendance/holiday-calendars/:calendarId",
    capability: "hr.lam.calendars.read",
  },
] as const satisfies readonly LamLeaveEntitlementRuleRouteContract[];

export const lamAttendancePoliciesRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/attendance/attendance-policies",
    capability: "hr.lam.attendance-policy.read",
  },
  {
    method: "POST",
    path: "/api/hr/attendance/attendance-policies",
    capability: "hr.lam.attendance-policy.write",
  },
  {
    method: "GET",
    path: "/api/hr/attendance/attendance-policies/:policyId",
    capability: "hr.lam.attendance-policy.read",
  },
] as const satisfies readonly LamLeaveEntitlementRuleRouteContract[];

export const lamLeaveEncashmentPoliciesRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/leave/leave-encashment-policies",
    capability: "hr.lam.encashment.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-encashment-policies",
    capability: "hr.lam.encashment.write",
  },
  {
    method: "GET",
    path: "/api/hr/leave/leave-encashment-policies/:policyId",
    capability: "hr.lam.encashment.read",
  },
] as const satisfies readonly LamLeaveEntitlementRuleRouteContract[];

export const listLamLeaveApplicationsQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  companyId: optionalTrimmedStringSchema,
  employeeId: optionalTrimmedStringSchema,
  leaveTypeId: optionalTrimmedStringSchema,
  status: lamLeaveApplicationStatusSchema.optional(),
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),
});

export type ListLamLeaveApplicationsQuery = z.infer<
  typeof listLamLeaveApplicationsQuerySchema
>;

export const lamLeaveApplicationsRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/leave/leave-applications",
    capability: "hr.lam.leave-applications.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-applications",
    capability: "hr.lam.leave-applications.write",
  },
  {
    method: "GET",
    path: "/api/hr/leave/leave-applications/:applicationId",
    capability: "hr.lam.leave-applications.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-applications/:applicationId/approve",
    capability: "hr.lam.leave-applications.approve",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-applications/:applicationId/reject",
    capability: "hr.lam.leave-applications.approve",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-applications/:applicationId/return",
    capability: "hr.lam.leave-applications.approve",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-applications/:applicationId/clarify",
    capability: "hr.lam.leave-applications.approve",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-applications/:applicationId/cancel",
    capability: "hr.lam.leave-applications.write",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-applications/:applicationId/amend",
    capability: "hr.lam.leave-applications.approve",
  },
  {
    method: "GET",
    path: "/api/hr/leave/leave-applications/:applicationId/medical-references",
    capability: "hr.lam.leave-applications.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-applications/overdue-notifications",
    capability: "hr.lam.leave-applications.approve",
  },
] as const satisfies readonly LamLeaveApplicationRouteContract[];

export const listLamLeaveDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(500).optional(),
  companyId: optionalTrimmedStringSchema,
  employeeId: optionalTrimmedStringSchema,
  status: z.enum(["pending_upload", "available", "rejected"]).optional(),
  documentKind: lamLeaveDocumentKindSchema.optional(),
  leaveApplicationId: optionalTrimmedStringSchema,
});

export type ListLamLeaveDocumentsQuery = z.infer<
  typeof listLamLeaveDocumentsQuerySchema
>;

export const lamLeaveDocumentsRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/leave/leave-documents",
    capability: "hr.lam.leave-applications.read",
  },
  {
    method: "GET",
    path: "/api/hr/leave/leave-documents/:documentId",
    capability: "hr.lam.leave-applications.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-documents/upload-session",
    capability: "hr.lam.leave-applications.write",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-documents/:documentId/confirm",
    capability: "hr.lam.leave-applications.write",
  },
] as const satisfies readonly LamLeaveBalanceRouteContract[];

export const listLamLeaveBlackoutPeriodsQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  search: z.string().trim().optional(),
  companyId: optionalTrimmedStringSchema,
  active: z.boolean().optional(),
  leaveTypeId: optionalTrimmedStringSchema,
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  grade: optionalTrimmedStringSchema,
  policyGroupId: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
  effectiveOn: z.coerce.date().optional(),
});

export type ListLamLeaveBlackoutPeriodsQuery = z.infer<
  typeof listLamLeaveBlackoutPeriodsQuerySchema
>;

export const lamLeaveBlackoutPeriodsRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/leave/leave-blackout-periods",
    capability: "hr.lam.leave-entitlements.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-blackout-periods",
    capability: "hr.lam.leave-entitlements.write",
  },
  {
    method: "GET",
    path: "/api/hr/leave/leave-blackout-periods/:periodId",
    capability: "hr.lam.leave-entitlements.read",
  },
] as const satisfies readonly LamLeaveEntitlementRuleRouteContract[];

export const listLamLeaveApprovalRoutesQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  search: z.string().trim().optional(),
  companyId: optionalTrimmedStringSchema,
  active: z.boolean().optional(),
  leaveTypeId: optionalTrimmedStringSchema,
  countryCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  grade: optionalTrimmedStringSchema,
  policyGroupId: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
});

export type ListLamLeaveApprovalRoutesQuery = z.infer<
  typeof listLamLeaveApprovalRoutesQuerySchema
>;

export const lamLeaveApprovalRoutesRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/leave/leave-approval-routes",
    capability: "hr.lam.leave-entitlements.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-approval-routes",
    capability: "hr.lam.leave-entitlements.write",
  },
  {
    method: "GET",
    path: "/api/hr/leave/leave-approval-routes/:routeId",
    capability: "hr.lam.leave-entitlements.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-applications/:applicationId/route",
    capability: "hr.lam.leave-applications.write",
  },
] as const satisfies readonly LamLeaveEntitlementRuleRouteContract[];

export const lamLeaveEntitlementCalculationRouteContracts = [
  {
    method: "POST",
    path: "/api/hr/leave/leave-entitlements/calculate",
    capability: "hr.lam.leave-entitlements.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-entitlements/apply",
    capability: "hr.lam.leave-balances.write",
  },
] as const satisfies readonly LamLeaveEntitlementRuleRouteContract[];

export const listLamPayrollReferencesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(500).optional(),
  companyId: optionalTrimmedStringSchema,
  employeeId: optionalTrimmedStringSchema,
  payPeriodStart: z.coerce.date().optional(),
  payPeriodEnd: z.coerce.date().optional(),
  exportStatus: z.enum(["pending", "exported", "all"]).optional(),
  deductionCategory: z
    .union([lamPayrollDeductionCategorySchema, z.literal("all")])
    .optional(),
});

export type ListLamPayrollReferencesQuery = z.infer<
  typeof listLamPayrollReferencesQuerySchema
>;

export const lamPayrollReferencesRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/leave/payroll-references",
    capability: "hr.lam.payroll-references.read",
  },
  {
    method: "GET",
    path: "/api/hr/leave/payroll-references/:applicationId",
    capability: "hr.lam.payroll-references.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/payroll-references/export",
    capability: "hr.lam.payroll-references.read",
  },
] as const satisfies readonly LamLeaveBalanceRouteContract[];

const parseEmployeeIdsQuery = z.preprocess((value) => {
  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return value;
}, z.array(trimmedStringSchema).optional());

export const listLamAttendanceSummaryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(500).optional(),
  companyId: optionalTrimmedStringSchema,
  employeeId: optionalTrimmedStringSchema,
  employeeIds: parseEmployeeIdsQuery,
  attendanceStatus: lamAttendanceStatusSchema.optional(),
  leaveTypeId: optionalTrimmedStringSchema,
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
});

export type ListLamAttendanceSummaryQuery = z.infer<
  typeof listLamAttendanceSummaryQuerySchema
>;

export const lamAttendanceSummaryRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/attendance/attendance-summary",
    capability: "hr.lam.reports.read",
  },
  {
    method: "POST",
    path: "/api/hr/attendance/attendance-summary/export",
    capability: "hr.lam.reports.export",
  },
] as const satisfies readonly LamAttendanceRecordRouteContract[];

export const listLamLeaveReportQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(500).optional(),
  companyId: optionalTrimmedStringSchema,
  employeeId: optionalTrimmedStringSchema,
  employeeIds: parseEmployeeIdsQuery,
  leaveTypeId: optionalTrimmedStringSchema,
  status: lamLeaveApplicationStatusSchema.optional(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
});

export type ListLamLeaveReportQuery = z.infer<
  typeof listLamLeaveReportQuerySchema
>;

export const lamLeaveReportRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/leave/leave-report",
    capability: "hr.lam.reports.read",
  },
  {
    method: "POST",
    path: "/api/hr/leave/leave-report/export",
    capability: "hr.lam.reports.export",
  },
] as const satisfies readonly LamAttendanceRecordRouteContract[];

export const listLamAuditTrailQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(500).optional(),
  companyId: optionalTrimmedStringSchema,
  entityType: lamRepositoryEntityTypeSchema.optional(),
  action: leaveAttendanceManagementAuditEventSchema.optional(),
  actorId: optionalTrimmedStringSchema,
  entityId: optionalTrimmedStringSchema,
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: optionalTrimmedStringSchema,
});

export type ListLamAuditTrailQuery = z.infer<
  typeof listLamAuditTrailQuerySchema
>;

export const lamAuditTrailRouteContracts = [
  {
    method: "GET",
    path: "/api/hr/leave/audit-trail",
    capability: "hr.lam.audit.read",
  },
  {
    method: "GET",
    path: "/api/hr/leave/audit-trail/:auditEventId",
    capability: "hr.lam.audit.read",
  },
] as const satisfies readonly LamAttendanceRecordRouteContract[];

export const lamRouteContracts = [
  ...lamAttendanceRecordsRouteContracts,
  ...lamAttendanceExceptionsRouteContracts,
  ...lamAttendanceCorrectionsRouteContracts,
  ...lamAttendanceSettingsRouteContracts,
  ...lamAttendanceSummaryRouteContracts,
  ...lamLeaveReportRouteContracts,
  ...lamAuditTrailRouteContracts,
  ...lamLeaveTypesRouteContracts,
  ...lamLeaveEntitlementRulesRouteContracts,
  ...lamLeaveEntitlementCalculationRouteContracts,
  ...lamLeaveBalancesRouteContracts,
  ...lamLeaveCarryForwardRulesRouteContracts,
  ...lamWorkCalendarsRouteContracts,
  ...lamHolidayCalendarsRouteContracts,
  ...lamAttendancePoliciesRouteContracts,
  ...lamLeaveEncashmentPoliciesRouteContracts,
  ...lamLeaveApplicationsRouteContracts,
  ...lamLeaveDocumentsRouteContracts,
  ...lamPayrollReferencesRouteContracts,
  ...lamLeaveBlackoutPeriodsRouteContracts,
  ...lamLeaveApprovalRoutesRouteContracts,
] as const;
