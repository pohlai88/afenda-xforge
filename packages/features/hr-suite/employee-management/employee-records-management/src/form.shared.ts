import { z } from "zod";
import { hrRecordsEmploymentStatusSchema } from "./employment-status.schema.ts";

const optionalTrimmedString = z.string().trim().optional().or(z.literal(""));
const hrRecordsIdentityDocumentTypeSchema = z
  .enum(["national_id", "passport", "work_permit", "other"])
  .optional();

export const hrRecordsCreateEmployeeSchema = z.object({
  employeeNumber: z.string().trim().min(1, "Employee number is required"),
  legalName: z.string().trim().min(1, "Legal name is required"),
  preferredName: optionalTrimmedString,
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  employmentStartDate: z.coerce.date().optional(),
  employmentType: optionalTrimmedString,
  workerCategory: optionalTrimmedString,
  grade: optionalTrimmedString,
  level: optionalTrimmedString,
  legalEntityCode: optionalTrimmedString,
  workLocationCode: optionalTrimmedString,
  countryCode: optionalTrimmedString,
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
  currentDepartmentId: optionalTrimmedString,
  currentPositionId: optionalTrimmedString,
  managerEmployeeId: optionalTrimmedString,
  matrixManagerEmployeeId: optionalTrimmedString,
  hrOwnerEmployeeId: optionalTrimmedString,
  identityDocumentType: hrRecordsIdentityDocumentTypeSchema,
  identityNumber: optionalTrimmedString,
  nationality: optionalTrimmedString,
  dateOfBirth: z.coerce.date().optional(),
  gender: optionalTrimmedString,
  maritalStatus: optionalTrimmedString,
  languagePreference: optionalTrimmedString,
  phoneNumber: optionalTrimmedString,
  personalEmail: z
    .string()
    .trim()
    .email("Enter a valid personal email")
    .optional()
    .or(z.literal("")),
  residentialAddress: optionalTrimmedString,
  mailingAddress: optionalTrimmedString,
  emergencyContactName: optionalTrimmedString,
  emergencyContactRelationship: optionalTrimmedString,
  emergencyContactPhoneNumber: optionalTrimmedString,
});

export const hrRecordsUpdateEmployeeSchema = z.object({
  employeeId: z.string().min(1),
  employeeNumber: z.string().trim().min(1).optional(),
  legalName: z.string().trim().min(1).optional(),
  preferredName: optionalTrimmedString,
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  employmentStatus: hrRecordsEmploymentStatusSchema.optional(),
  employmentStartDate: z.coerce.date().optional(),
  employmentType: optionalTrimmedString,
  workerCategory: optionalTrimmedString,
  grade: optionalTrimmedString,
  level: optionalTrimmedString,
  legalEntityCode: optionalTrimmedString,
  workLocationCode: optionalTrimmedString,
  countryCode: optionalTrimmedString,
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
  matrixManagerEmployeeId: optionalTrimmedString,
  hrOwnerEmployeeId: optionalTrimmedString,
  identityDocumentType: hrRecordsIdentityDocumentTypeSchema,
  identityNumber: optionalTrimmedString,
  nationality: optionalTrimmedString,
  dateOfBirth: z.coerce.date().optional(),
  gender: optionalTrimmedString,
  maritalStatus: optionalTrimmedString,
  languagePreference: optionalTrimmedString,
  phoneNumber: optionalTrimmedString,
  personalEmail: z
    .string()
    .trim()
    .email("Enter a valid personal email")
    .optional()
    .or(z.literal("")),
  residentialAddress: optionalTrimmedString,
  mailingAddress: optionalTrimmedString,
  emergencyContactName: optionalTrimmedString,
  emergencyContactRelationship: optionalTrimmedString,
  emergencyContactPhoneNumber: optionalTrimmedString,
  reason: z.string().trim().max(2000).optional(),
  approvalReference: z.string().trim().max(500).optional(),
});

export const hrRecordsAssignmentSchema = z.object({
  employeeId: z.string().min(1),
  currentDepartmentId: optionalTrimmedString,
  currentPositionId: optionalTrimmedString,
  managerEmployeeId: optionalTrimmedString,
  workLocationCode: optionalTrimmedString,
  assignmentEffectiveFrom: z.coerce.date().optional(),
  assignmentReason: z.string().trim().max(2000).optional(),
  reason: z.string().trim().max(2000).optional(),
});

export const hrRecordsRehireEmployeeSchema = z.object({
  priorEmployeeId: z.string().min(1),
  employeeNumber: z.string().trim().min(1, "Employee number is required"),
  legalName: z.string().trim().min(1, "Legal name is required"),
  preferredName: optionalTrimmedString,
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  employmentStartDate: z.coerce.date().optional(),
  reason: z.string().trim().max(2000).optional(),
});

export const hrRecordsArchiveEmployeeSchema = z.object({
  employeeId: z.string().min(1),
  reason: z.string().trim().min(1, "Reason is required").max(2000),
  approvalReference: z.string().trim().max(500).optional(),
});

export type HrRecordsCreateEmployeeInput = z.infer<
  typeof hrRecordsCreateEmployeeSchema
>;
export type HrRecordsUpdateEmployeeInput = z.infer<
  typeof hrRecordsUpdateEmployeeSchema
>;
export type HrRecordsAssignmentInput = z.infer<
  typeof hrRecordsAssignmentSchema
>;
export type HrRecordsRehireEmployeeInput = z.infer<
  typeof hrRecordsRehireEmployeeSchema
>;
export type HrRecordsArchiveEmployeeInput = z.infer<
  typeof hrRecordsArchiveEmployeeSchema
>;
