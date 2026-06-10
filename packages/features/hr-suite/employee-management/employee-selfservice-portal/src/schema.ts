import { hrRecordsUpdateEmployeeSchema } from "@repo/features-employee-management-employee-records-management";
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

const employeeSelfservicePortalProfileUpdateFieldsSchema =
  hrRecordsUpdateEmployeeSchema
    .pick({
      emergencyContactName: true,
      emergencyContactPhoneNumber: true,
      emergencyContactRelationship: true,
      mailingAddress: true,
      maritalStatus: true,
      personalEmail: true,
      phoneNumber: true,
      preferredName: true,
      residentialAddress: true,
    })
    .partial()
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
export type EmployeeSelfservicePortalProfileView = z.infer<
  typeof employeeSelfservicePortalProfileViewSchema
>;
export type EmployeeSelfservicePortalProfileUpdateStatus = z.infer<
  typeof employeeSelfservicePortalProfileUpdateStatusSchema
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
