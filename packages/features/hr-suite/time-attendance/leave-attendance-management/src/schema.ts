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

export const leaveAttendanceManagementStatusSchema = z.enum([
  "draft",
  "active",
  "archived",
]);

export const leaveAttendanceManagementLeaveUnitSchema = z.enum([
  "days",
  "hours",
]);

export const leaveAttendanceManagementLeaveApplicationStatusSchema = z.enum([
  "submitted",
  "pending_approval",
  "approved",
  "rejected",
  "cancelled",
  "returned",
]);

export const leaveAttendanceManagementRecordSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  status: leaveAttendanceManagementStatusSchema,
});

export const leaveAttendanceManagementLeaveBalanceRecordSchema = z.object({
  id: z.string().trim().min(1),
  companyId: z.string().trim().min(1).optional(),
  employeeId: z.string().trim().min(1),
  leaveTypeCode: z.string().trim().min(1),
  leaveTypeName: z.string().trim().min(1),
  openingBalance: z.number(),
  earnedBalance: z.number(),
  usedBalance: z.number(),
  pendingBalance: z.number(),
  adjustedBalance: z.number(),
  carriedForwardBalance: z.number(),
  forfeitedBalance: z.number(),
  remainingBalance: z.number(),
  tenantId: z.string().trim().min(1).optional(),
  unit: leaveAttendanceManagementLeaveUnitSchema,
  updatedAt: isoDateSchema,
});

export const leaveAttendanceManagementLeaveApplicationRecordSchema = z.object({
  approvalReference: z.string().trim().min(1).nullable(),
  companyId: z.string().trim().min(1).optional(),
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
  status: leaveAttendanceManagementLeaveApplicationStatusSchema,
  submittedAt: isoDateSchema,
  tenantId: z.string().trim().min(1).optional(),
  totalUnits: z.number().positive(),
  unit: leaveAttendanceManagementLeaveUnitSchema,
  updatedAt: isoDateSchema,
});

export const listLeaveAttendanceManagementQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
});

export const listLeaveAttendanceManagementLeaveBalancesQuerySchema = z.object({
  employeeId: z.string().trim().min(1).optional(),
  leaveTypeCode: z.string().trim().min(1).optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
});

export const listLeaveAttendanceManagementLeaveApplicationsQuerySchema =
  z.object({
    employeeId: z.string().trim().min(1).optional(),
    leaveTypeCode: z.string().trim().min(1).optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(100).optional(),
    search: z.string().trim().optional(),
    status: leaveAttendanceManagementLeaveApplicationStatusSchema.optional(),
  });

export const createLeaveAttendanceManagementInputSchema = z.object({
  name: z.string().trim().min(1),
});

export const updateLeaveAttendanceManagementInputSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).optional(),
  status: leaveAttendanceManagementStatusSchema.optional(),
});

export type LeaveAttendanceManagementStatus = z.infer<
  typeof leaveAttendanceManagementStatusSchema
>;
export type LeaveAttendanceManagementLeaveUnit = z.infer<
  typeof leaveAttendanceManagementLeaveUnitSchema
>;
export type LeaveAttendanceManagementLeaveApplicationStatus = z.infer<
  typeof leaveAttendanceManagementLeaveApplicationStatusSchema
>;
export type LeaveAttendanceManagementRecord = z.infer<
  typeof leaveAttendanceManagementRecordSchema
>;
export type LeaveAttendanceManagementLeaveBalanceRecord = z.infer<
  typeof leaveAttendanceManagementLeaveBalanceRecordSchema
>;
export type LeaveAttendanceManagementLeaveApplicationRecord = z.infer<
  typeof leaveAttendanceManagementLeaveApplicationRecordSchema
>;
export type ListLeaveAttendanceManagementQuery = z.infer<
  typeof listLeaveAttendanceManagementQuerySchema
>;
export type ListLeaveAttendanceManagementLeaveBalancesQuery = z.infer<
  typeof listLeaveAttendanceManagementLeaveBalancesQuerySchema
>;
export type ListLeaveAttendanceManagementLeaveApplicationsQuery = z.infer<
  typeof listLeaveAttendanceManagementLeaveApplicationsQuerySchema
>;
export type CreateLeaveAttendanceManagementInput = z.infer<
  typeof createLeaveAttendanceManagementInputSchema
>;
export type UpdateLeaveAttendanceManagementInput = z.infer<
  typeof updateLeaveAttendanceManagementInputSchema
>;
