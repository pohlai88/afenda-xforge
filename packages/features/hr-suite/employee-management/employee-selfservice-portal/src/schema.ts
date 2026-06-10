import { z } from "zod";

const isoDateSchema = z.preprocess((value: unknown) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? value : parsedDate;
  }

  return value;
}, z.date());

const trimmedNullableStringSchema = z.string().trim().min(1).nullable();

export const employeeSelfservicePortalStatusSchema = z.enum([
  "invited",
  "active",
  "suspended",
  "archived",
]);

export const employeeSelfservicePortalRecordSchema = z.object({
  id: z.string().trim().min(1),
  tenantId: z.string().trim().min(1),
  companyId: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  employeeNumber: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  workEmail: trimmedNullableStringSchema,
  locale: trimmedNullableStringSchema,
  timeZone: trimmedNullableStringSchema,
  status: employeeSelfservicePortalStatusSchema,
  mobileAccessEnabled: z.boolean(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const employeeSelfservicePortalSummarySchema =
  employeeSelfservicePortalRecordSchema.pick({
    id: true,
    employeeId: true,
    employeeNumber: true,
    displayName: true,
    status: true,
    locale: true,
    mobileAccessEnabled: true,
    tenantId: true,
    companyId: true,
  });

export const createEmployeeSelfservicePortalInputSchema = z.object({
  employeeId: z.string().trim().min(1),
  employeeNumber: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  workEmail: z.string().trim().email().nullable().optional(),
  locale: z.string().trim().min(2).nullable().optional(),
  timeZone: z.string().trim().min(1).nullable().optional(),
  mobileAccessEnabled: z.boolean().optional(),
});

export const updateEmployeeSelfservicePortalInputSchema = z.object({
  id: z.string().trim().min(1),
  displayName: z.string().trim().min(1).optional(),
  workEmail: z.string().trim().email().nullable().optional(),
  locale: z.string().trim().min(2).nullable().optional(),
  timeZone: z.string().trim().min(1).nullable().optional(),
  mobileAccessEnabled: z.boolean().optional(),
  status: employeeSelfservicePortalStatusSchema.optional(),
});

export const listEmployeeSelfservicePortalQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
  employeeId: z.string().trim().min(1).optional(),
  status: employeeSelfservicePortalStatusSchema.optional(),
});

export const employeeSelfservicePortalProfileQuerySchema = z.object({
  employeeId: z.string().trim().min(1).optional(),
});

export const employeeSelfservicePortalResourceCategorySchema = z.enum([
  "policy",
  "handbook",
  "form",
  "faq",
]);

export const employeeSelfservicePortalResourceSourceSchema = z.enum([
  "documents_management",
  "employee_selfservice_portal",
]);

export const listEmployeeSelfservicePortalResourcesQuerySchema = z.object({
  category: employeeSelfservicePortalResourceCategorySchema.optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
});

export const employeeSelfservicePortalResourceItemSchema = z.object({
  acknowledgmentStatus: z.enum(["pending", "acknowledged"]).nullable(),
  body: z.string().trim().min(1).nullable(),
  category: employeeSelfservicePortalResourceCategorySchema,
  documentId: z.string().trim().min(1).nullable(),
  documentType: z.string().trim().min(1).nullable(),
  employeeId: z.string().trim().min(1).nullable(),
  id: z.string().trim().min(1),
  mandatory: z.boolean(),
  policyId: z.string().trim().min(1).nullable(),
  policyVersion: z.string().trim().min(1).nullable(),
  source: employeeSelfservicePortalResourceSourceSchema,
  status: z.string().trim().min(1).nullable(),
  summary: z.string().trim().min(1),
  title: z.string().trim().min(1),
  updatedAt: isoDateSchema,
  visibility: z.string().trim().min(1).nullable(),
});

export const employeeSelfservicePortalTaskCategorySchema = z.enum([
  "onboarding",
  "offboarding",
  "compliance",
  "hr",
]);

export const employeeSelfservicePortalTaskStatusSchema = z.enum([
  "pending",
  "due",
  "overdue",
  "scheduled",
  "completed",
  "action_required",
]);

export const listEmployeeSelfservicePortalTasksQuerySchema = z.object({
  category: employeeSelfservicePortalTaskCategorySchema.optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
  status: employeeSelfservicePortalTaskStatusSchema.optional(),
});

export const employeeSelfservicePortalTaskItemSchema = z.object({
  actionable: z.boolean(),
  category: employeeSelfservicePortalTaskCategorySchema,
  createdAt: isoDateSchema,
  dueAt: isoDateSchema.nullable(),
  employeeId: z.string().trim().min(1),
  id: z.string().trim().min(1),
  source: z.string().trim().min(1),
  sourceRecordId: z.string().trim().min(1),
  sourceRecordType: z.string().trim().min(1),
  status: employeeSelfservicePortalTaskStatusSchema,
  summary: z.string().trim().min(1),
  title: z.string().trim().min(1),
  updatedAt: isoDateSchema,
});

export const employeeSelfservicePortalNotificationSeveritySchema = z.enum([
  "info",
  "warning",
  "high",
  "critical",
]);

export const employeeSelfservicePortalNotificationStatusSchema = z.enum([
  "open",
  "acknowledged",
  "closed",
]);

export const listEmployeeSelfservicePortalNotificationsQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
  severity: employeeSelfservicePortalNotificationSeveritySchema.optional(),
  status: employeeSelfservicePortalNotificationStatusSchema.optional(),
});

export const employeeSelfservicePortalNotificationItemSchema = z.object({
  actionable: z.boolean(),
  createdAt: isoDateSchema,
  dueAt: isoDateSchema.nullable(),
  employeeId: z.string().trim().min(1),
  id: z.string().trim().min(1),
  message: z.string().trim().min(1),
  relatedRecordId: z.string().trim().min(1).nullable(),
  relatedRecordType: z.string().trim().min(1).nullable(),
  severity: employeeSelfservicePortalNotificationSeveritySchema,
  source: z.string().trim().min(1),
  status: employeeSelfservicePortalNotificationStatusSchema,
  title: z.string().trim().min(1),
});

export const listEmployeeSelfservicePortalAuditQuerySchema = z.object({
  action: z.string().trim().min(1).optional(),
  employeeId: z.string().trim().min(1).optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  targetType: z.string().trim().min(1).optional(),
});

export const employeeSelfservicePortalProfileViewSchema = z.object({
  portalRecordId: z.string().trim().min(1).nullable(),
  portalStatus: employeeSelfservicePortalStatusSchema.nullable(),
  actorEmployeeId: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  employeeNumber: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  legalName: z.string().trim().min(1),
  preferredName: z.string().trim().nullable(),
  employmentStatus: z.string().trim().min(1),
  departmentName: z.string().trim().nullable(),
  positionTitle: z.string().trim().nullable(),
  managerEmployeeId: z.string().trim().nullable(),
  workLocationCode: z.string().trim(),
  employmentType: z.string().trim(),
  countryCode: z.string().trim(),
  languagePreference: z.string().trim(),
  email: z.string().trim(),
  personalEmail: z.string().trim(),
  phoneNumber: z.string().trim(),
  canViewSensitive: z.boolean(),
});

export const employeeSelfservicePortalProfileUpdateStatusSchema = z.enum([
  "pending_hr_review",
  "approved",
  "rejected",
  "cancelled",
]);

export const employeeSelfservicePortalLeaveUnitSchema = z.enum([
  "days",
  "hours",
]);

export const listEmployeeSelfservicePortalLeaveBalancesQuerySchema = z.object({
  leaveTypeCode: z.string().trim().min(1).optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
});

export const employeeSelfservicePortalLeaveBalanceItemSchema = z.object({
  adjustedBalance: z.number(),
  carriedForwardBalance: z.number(),
  employeeId: z.string().trim().min(1),
  earnedBalance: z.number(),
  forfeitedBalance: z.number(),
  id: z.string().trim().min(1),
  leaveTypeCode: z.string().trim().min(1),
  leaveTypeName: z.string().trim().min(1),
  openingBalance: z.number(),
  pendingBalance: z.number(),
  remainingBalance: z.number(),
  unit: employeeSelfservicePortalLeaveUnitSchema,
  updatedAt: isoDateSchema,
  usedBalance: z.number(),
});

export const employeeSelfservicePortalLeaveApplicationStatusSchema = z.enum([
  "submitted",
  "pending_approval",
  "approved",
  "rejected",
  "cancelled",
  "returned",
]);

export const listEmployeeSelfservicePortalLeaveApplicationsQuerySchema =
  z.object({
    leaveTypeCode: z.string().trim().min(1).optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(100).optional(),
    search: z.string().trim().optional(),
    status: employeeSelfservicePortalLeaveApplicationStatusSchema.optional(),
  });

export const employeeSelfservicePortalLeaveApplicationItemSchema = z.object({
  approvalReference: z.string().trim().min(1).nullable(),
  employeeId: z.string().trim().min(1),
  endDate: isoDateSchema,
  id: z.string().trim().min(1),
  leaveTypeCode: z.string().trim().min(1),
  leaveTypeName: z.string().trim().min(1),
  reason: z.string().trim().min(1).nullable(),
  rejectionReason: z.string().trim().min(1).nullable(),
  reviewedAt: isoDateSchema.nullable(),
  reviewedByUserId: z.string().trim().min(1).nullable(),
  startDate: isoDateSchema,
  status: employeeSelfservicePortalLeaveApplicationStatusSchema,
  submittedAt: isoDateSchema,
  totalUnits: z.number().positive(),
  unit: employeeSelfservicePortalLeaveUnitSchema,
  updatedAt: isoDateSchema,
});

export const listEmployeeSelfservicePortalRequestStatusesQuerySchema = z.object(
  {
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(100).optional(),
    requestType: z.literal("profile_update").optional(),
    search: z.string().trim().optional(),
    status: employeeSelfservicePortalProfileUpdateStatusSchema.optional(),
  }
);

export const employeeSelfservicePortalRequestStatusItemSchema = z.object({
  approvalReference: z.string().trim().min(1).nullable(),
  employeeId: z.string().trim().min(1),
  id: z.string().trim().min(1),
  rejectionReason: z.string().trim().min(1).nullable(),
  requestType: z.literal("profile_update"),
  requiresAction: z.boolean(),
  requiresSensitiveApproval: z.boolean(),
  reviewedAt: isoDateSchema.nullable(),
  status: employeeSelfservicePortalProfileUpdateStatusSchema,
  submittedAt: isoDateSchema,
  summary: z.string().trim().min(1),
  updatedAt: isoDateSchema,
});

export const listEmployeeSelfservicePortalManagerApprovalInboxQuerySchema =
  z.object({
    employeeId: z.string().trim().min(1).optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(100).optional(),
    requestType: z.literal("profile_update").optional(),
    search: z.string().trim().optional(),
    status: employeeSelfservicePortalProfileUpdateStatusSchema.optional(),
  });

export const employeeSelfservicePortalManagerApprovalInboxItemSchema = z.object(
  {
    approvalReference: z.string().trim().min(1).nullable(),
    canApprove: z.boolean(),
    canReject: z.boolean(),
    changedFields: z.array(z.string().trim().min(1)),
    employeeDisplayName: z.string().trim().min(1),
    employeeId: z.string().trim().min(1),
    employeeNumber: z.string().trim().min(1),
    id: z.string().trim().min(1),
    reason: z.string().trim().max(2000).nullable(),
    requestType: z.literal("profile_update"),
    requiresSensitiveApproval: z.boolean(),
    reviewedAt: isoDateSchema.nullable(),
    reviewedByUserId: z.string().trim().min(1).nullable(),
    status: employeeSelfservicePortalProfileUpdateStatusSchema,
    submittedAt: isoDateSchema,
    summary: z.string().trim().min(1),
    updatedAt: isoDateSchema,
  }
);

const employeeSelfservicePortalProfileUpdateFieldsSchema = z
  .object({
    emergencyContactName: z.string().trim().min(1).optional(),
    emergencyContactPhoneNumber: z.string().trim().min(1).optional(),
    emergencyContactRelationship: z.string().trim().min(1).optional(),
    mailingAddress: z.string().trim().min(1).optional(),
    maritalStatus: z.string().trim().min(1).optional(),
    personalEmail: z.string().trim().email().optional(),
    phoneNumber: z.string().trim().min(1).optional(),
    preferredName: z.string().trim().min(1).optional(),
    residentialAddress: z.string().trim().min(1).optional(),
  })
  .refine(
    (value) =>
      Object.values(value).some(
        (fieldValue) => fieldValue !== undefined && fieldValue !== ""
      ),
    {
      message: "At least one profile update field is required.",
    }
  );

export const employeeSelfservicePortalProfileUpdateRequestSchema = z.object({
  id: z.string().trim().min(1),
  tenantId: z.string().trim().min(1),
  companyId: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  requestType: z.literal("profile_update"),
  status: employeeSelfservicePortalProfileUpdateStatusSchema,
  requestedChanges: employeeSelfservicePortalProfileUpdateFieldsSchema,
  requiresSensitiveApproval: z.boolean(),
  reason: z.string().trim().max(2000).nullable(),
  approvalReference: z.string().trim().max(500).nullable(),
  rejectionReason: z.string().trim().max(2000).nullable(),
  requestedByActorId: z.string().trim().min(1).nullable(),
  requestedByUserId: z.string().trim().min(1).nullable(),
  reviewedByUserId: z.string().trim().min(1).nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  submittedAt: isoDateSchema,
  reviewedAt: isoDateSchema.nullable(),
});

export const createEmployeeSelfservicePortalProfileUpdateRequestInputSchema =
  z.object({
    employeeId: z.string().trim().min(1),
    requestedChanges: employeeSelfservicePortalProfileUpdateFieldsSchema,
    reason: z.string().trim().max(2000).optional(),
  });

export const reviewEmployeeSelfservicePortalProfileUpdateRequestInputSchema =
  z.object({
    approvalReference: z.string().trim().max(500).optional(),
    reason: z.string().trim().max(2000).optional(),
    requestId: z.string().trim().min(1),
  });

export const rejectEmployeeSelfservicePortalProfileUpdateRequestInputSchema =
  z.object({
    rejectionReason: z.string().trim().min(1).max(2000),
    requestId: z.string().trim().min(1),
  });

export const listEmployeeSelfservicePortalProfileUpdateRequestsQuerySchema =
  z.object({
    employeeId: z.string().trim().min(1).optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(100).optional(),
    status: employeeSelfservicePortalProfileUpdateStatusSchema.optional(),
  });

export const employeeSelfservicePortalProfileUpdateRequestViewSchema = z.object(
  {
    id: z.string().trim().min(1),
    employeeId: z.string().trim().min(1),
    requestType: z.literal("profile_update"),
    status: employeeSelfservicePortalProfileUpdateStatusSchema,
    requestedChanges: employeeSelfservicePortalProfileUpdateFieldsSchema,
    requiresSensitiveApproval: z.boolean(),
    reason: z.string().trim().max(2000).nullable(),
    approvalReference: z.string().trim().max(500).nullable(),
    rejectionReason: z.string().trim().max(2000).nullable(),
    requestedByActorId: z.string().trim().min(1).nullable(),
    requestedByUserId: z.string().trim().min(1).nullable(),
    reviewedByUserId: z.string().trim().min(1).nullable(),
    createdAt: z.string().trim().min(1),
    updatedAt: z.string().trim().min(1),
    submittedAt: z.string().trim().min(1),
    reviewedAt: z.string().trim().min(1).nullable(),
  }
);

export type EmployeeSelfservicePortalStatus = z.infer<
  typeof employeeSelfservicePortalStatusSchema
>;
export type EmployeeSelfservicePortalRecord = z.infer<
  typeof employeeSelfservicePortalRecordSchema
>;
export type EmployeeSelfservicePortalSummary = z.infer<
  typeof employeeSelfservicePortalSummarySchema
>;
export type CreateEmployeeSelfservicePortalInput = z.infer<
  typeof createEmployeeSelfservicePortalInputSchema
>;
export type UpdateEmployeeSelfservicePortalInput = z.infer<
  typeof updateEmployeeSelfservicePortalInputSchema
>;
export type ListEmployeeSelfservicePortalQuery = z.infer<
  typeof listEmployeeSelfservicePortalQuerySchema
>;
export type EmployeeSelfservicePortalProfileQuery = z.infer<
  typeof employeeSelfservicePortalProfileQuerySchema
>;
export type EmployeeSelfservicePortalResourceCategory = z.infer<
  typeof employeeSelfservicePortalResourceCategorySchema
>;
export type EmployeeSelfservicePortalResourceSource = z.infer<
  typeof employeeSelfservicePortalResourceSourceSchema
>;
export type ListEmployeeSelfservicePortalResourcesQuery = z.infer<
  typeof listEmployeeSelfservicePortalResourcesQuerySchema
>;
export type EmployeeSelfservicePortalResourceItem = z.infer<
  typeof employeeSelfservicePortalResourceItemSchema
>;
export type EmployeeSelfservicePortalTaskCategory = z.infer<
  typeof employeeSelfservicePortalTaskCategorySchema
>;
export type EmployeeSelfservicePortalTaskStatus = z.infer<
  typeof employeeSelfservicePortalTaskStatusSchema
>;
export type ListEmployeeSelfservicePortalTasksQuery = z.infer<
  typeof listEmployeeSelfservicePortalTasksQuerySchema
>;
export type EmployeeSelfservicePortalTaskItem = z.infer<
  typeof employeeSelfservicePortalTaskItemSchema
>;
export type ListEmployeeSelfservicePortalRequestStatusesQuery = z.infer<
  typeof listEmployeeSelfservicePortalRequestStatusesQuerySchema
>;
export type EmployeeSelfservicePortalRequestStatusItem = z.infer<
  typeof employeeSelfservicePortalRequestStatusItemSchema
>;
export type ListEmployeeSelfservicePortalManagerApprovalInboxQuery = z.infer<
  typeof listEmployeeSelfservicePortalManagerApprovalInboxQuerySchema
>;
export type EmployeeSelfservicePortalManagerApprovalInboxItem = z.infer<
  typeof employeeSelfservicePortalManagerApprovalInboxItemSchema
>;
export type EmployeeSelfservicePortalNotificationSeverity = z.infer<
  typeof employeeSelfservicePortalNotificationSeveritySchema
>;
export type EmployeeSelfservicePortalNotificationStatus = z.infer<
  typeof employeeSelfservicePortalNotificationStatusSchema
>;
export type ListEmployeeSelfservicePortalNotificationsQuery = z.infer<
  typeof listEmployeeSelfservicePortalNotificationsQuerySchema
>;
export type EmployeeSelfservicePortalNotificationItem = z.infer<
  typeof employeeSelfservicePortalNotificationItemSchema
>;
export type ListEmployeeSelfservicePortalAuditQuery = z.infer<
  typeof listEmployeeSelfservicePortalAuditQuerySchema
>;
export type EmployeeSelfservicePortalProfileView = z.infer<
  typeof employeeSelfservicePortalProfileViewSchema
>;
export type EmployeeSelfservicePortalProfileUpdateStatus = z.infer<
  typeof employeeSelfservicePortalProfileUpdateStatusSchema
>;
export type EmployeeSelfservicePortalLeaveUnit = z.infer<
  typeof employeeSelfservicePortalLeaveUnitSchema
>;
export type ListEmployeeSelfservicePortalLeaveBalancesQuery = z.infer<
  typeof listEmployeeSelfservicePortalLeaveBalancesQuerySchema
>;
export type EmployeeSelfservicePortalLeaveBalanceItem = z.infer<
  typeof employeeSelfservicePortalLeaveBalanceItemSchema
>;
export type EmployeeSelfservicePortalLeaveApplicationStatus = z.infer<
  typeof employeeSelfservicePortalLeaveApplicationStatusSchema
>;
export type ListEmployeeSelfservicePortalLeaveApplicationsQuery = z.infer<
  typeof listEmployeeSelfservicePortalLeaveApplicationsQuerySchema
>;
export type EmployeeSelfservicePortalLeaveApplicationItem = z.infer<
  typeof employeeSelfservicePortalLeaveApplicationItemSchema
>;
export type EmployeeSelfservicePortalProfileUpdateRequest = z.infer<
  typeof employeeSelfservicePortalProfileUpdateRequestSchema
>;
export type CreateEmployeeSelfservicePortalProfileUpdateRequestInput = z.infer<
  typeof createEmployeeSelfservicePortalProfileUpdateRequestInputSchema
>;
export type ReviewEmployeeSelfservicePortalProfileUpdateRequestInput = z.infer<
  typeof reviewEmployeeSelfservicePortalProfileUpdateRequestInputSchema
>;
export type RejectEmployeeSelfservicePortalProfileUpdateRequestInput = z.infer<
  typeof rejectEmployeeSelfservicePortalProfileUpdateRequestInputSchema
>;
export type ListEmployeeSelfservicePortalProfileUpdateRequestsQuery = z.infer<
  typeof listEmployeeSelfservicePortalProfileUpdateRequestsQuerySchema
>;
export type EmployeeSelfservicePortalProfileUpdateRequestView = z.infer<
  typeof employeeSelfservicePortalProfileUpdateRequestViewSchema
>;
