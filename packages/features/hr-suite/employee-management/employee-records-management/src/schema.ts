import { z } from "zod";
import { hrRecordsEmploymentStatusSchema } from "./hr.workforce.records-employment-status.schema.ts";

const isoDateSchema = z.preprocess((value: unknown) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }

  return value;
}, z.date());

const trimmedNullableStringSchema = z.string().trim().min(1).nullable();

export const hrEmployeeRecordSummarySchema = z.object({
  id: z.string().trim().min(1),
  employeeNumber: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  employmentStatus: hrRecordsEmploymentStatusSchema,
});

export const hrEmployeeRecordAuditEntrySchema = z.object({
  id: z.string().trim().min(1),
  organizationId: z.string().trim().min(1).nullable(),
  employeeId: z.string().trim().min(1),
  action: z.string().trim().min(1),
  actorId: z.string().trim().min(1).nullable(),
  reason: z.string().trim().nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const hrEmployeeStatusHistoryRecordSchema = z.object({
  id: z.string().trim().min(1),
  organizationId: z.string().trim().min(1).nullable(),
  employeeId: z.string().trim().min(1),
  status: hrRecordsEmploymentStatusSchema,
  previousStatus: hrRecordsEmploymentStatusSchema.nullable(),
  effectiveAt: isoDateSchema,
  source: z.string().trim().min(1),
  reason: z.string().trim().nullable(),
  actorId: z.string().trim().min(1).nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const hrEmployeeStatusHistoryViewSchema = z.object({
  id: z.string().trim().min(1),
  organizationId: z.string().trim().min(1).nullable(),
  employeeId: z.string().trim().min(1),
  status: hrRecordsEmploymentStatusSchema,
  previousStatus: hrRecordsEmploymentStatusSchema.nullable(),
  effectiveAt: z.string().trim().min(1),
  source: z.string().trim().min(1),
  reason: z.string().trim().nullable(),
  actorId: z.string().trim().min(1).nullable(),
  isCurrent: z.boolean(),
  createdAt: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
});

export const hrEmployeeStatusHistoryQuerySchema = z.object({
  employeeId: z.string().trim().min(1).optional(),
  status: hrRecordsEmploymentStatusSchema.optional(),
  source: z.string().trim().min(1).optional(),
  search: z.string().trim().optional(),
  current: z.boolean().optional(),
  asOf: isoDateSchema.optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
});

export const hrEmployeeStatusHistoryPageModelSchema = z.object({
  organizationId: z.string().trim().min(1).nullable().optional(),
  employeeId: z.string().trim().min(1).optional(),
  currentStatusHistory: hrEmployeeStatusHistoryViewSchema.nullable().optional(),
  statusHistory: hrEmployeeStatusHistoryViewSchema.array(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalCount: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
});

export const hrEmployeeAssignmentRecordSchema = z.object({
  id: z.string().trim().min(1),
  organizationId: z.string().trim().min(1).nullable(),
  employeeId: z.string().trim().min(1),
  departmentId: trimmedNullableStringSchema,
  positionId: trimmedNullableStringSchema,
  workLocationCode: trimmedNullableStringSchema,
  managerEmployeeId: trimmedNullableStringSchema,
  effectiveFrom: isoDateSchema,
  effectiveTo: isoDateSchema.nullable(),
  source: z.string().trim().min(1),
  reason: z.string().trim().nullable(),
  actorId: z.string().trim().min(1).nullable(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const hrEmployeeAssignmentViewSchema = z.object({
  id: z.string().trim().min(1),
  organizationId: z.string().trim().min(1).nullable(),
  employeeId: z.string().trim().min(1),
  departmentId: trimmedNullableStringSchema,
  positionId: trimmedNullableStringSchema,
  workLocationCode: trimmedNullableStringSchema,
  managerEmployeeId: trimmedNullableStringSchema,
  effectiveFrom: z.string().trim().min(1),
  effectiveTo: z.string().trim().min(1).nullable(),
  source: z.string().trim().min(1),
  reason: z.string().trim().nullable(),
  actorId: z.string().trim().min(1).nullable(),
  isCurrent: z.boolean(),
  createdAt: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
});

export const hrEmployeeAssignmentsQuerySchema = z.object({
  employeeId: z.string().trim().min(1).optional(),
  managerEmployeeId: z.string().trim().min(1).optional(),
  departmentId: z.string().trim().min(1).optional(),
  workLocationCode: z.string().trim().min(1).optional(),
  current: z.boolean().optional(),
  asOf: isoDateSchema.optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
});

export const hrEmployeeAssignmentsPageModelSchema = z.object({
  organizationId: z.string().trim().min(1).nullable().optional(),
  employeeId: z.string().trim().min(1).optional(),
  currentAssignment: hrEmployeeAssignmentViewSchema.nullable().optional(),
  assignments: hrEmployeeAssignmentViewSchema.array(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalCount: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
});

export type HrEmployeeAssignmentRecord = z.infer<
  typeof hrEmployeeAssignmentRecordSchema
>;
export type HrEmployeeRecordSummary = z.infer<
  typeof hrEmployeeRecordSummarySchema
>;
export type HrEmployeeRecordAuditEntry = z.infer<
  typeof hrEmployeeRecordAuditEntrySchema
>;
export type HrEmployeeAssignmentView = z.infer<
  typeof hrEmployeeAssignmentViewSchema
>;
export type HrEmployeeAssignmentsQuery = z.infer<
  typeof hrEmployeeAssignmentsQuerySchema
>;
export type HrEmployeeAssignmentsPageModel = z.infer<
  typeof hrEmployeeAssignmentsPageModelSchema
>;
export type HrEmployeeStatusHistoryRecord = z.infer<
  typeof hrEmployeeStatusHistoryRecordSchema
>;
export type HrEmployeeStatusHistoryView = z.infer<
  typeof hrEmployeeStatusHistoryViewSchema
>;
export type HrEmployeeStatusHistoryQuery = z.infer<
  typeof hrEmployeeStatusHistoryQuerySchema
>;
export type HrEmployeeStatusHistoryPageModel = z.infer<
  typeof hrEmployeeStatusHistoryPageModelSchema
>;
