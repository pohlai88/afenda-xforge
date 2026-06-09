import { z } from "zod";
import { hrRecordsEmploymentStatusSchema } from "../employment-status.schema.ts";

const optionalIsoDateSchema = z.string().trim().nullable();
const optionalStringSchema = z.string().trim().nullable();

export const hrEmployeeIntegrationReferenceSchema = z.object({
  employeeId: z.string().trim().min(1),
  employeeNumber: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  organizationId: z.string().trim().min(1).nullable(),
  employmentStatus: hrRecordsEmploymentStatusSchema,
});

export const hrEmployeeIntegrationAssignmentReferenceSchema = z.object({
  departmentId: optionalStringSchema,
  positionId: optionalStringSchema,
  managerEmployeeId: optionalStringSchema,
  matrixManagerEmployeeId: optionalStringSchema,
  hrOwnerEmployeeId: optionalStringSchema,
  workLocationCode: optionalStringSchema,
});

export const hrEmployeeIntegrationEmploymentReferenceSchema = z.object({
  employmentStartDate: optionalIsoDateSchema,
  employmentType: optionalStringSchema,
  workerCategory: optionalStringSchema,
  grade: optionalStringSchema,
  level: optionalStringSchema,
  legalEntityCode: optionalStringSchema,
  countryCode: optionalStringSchema,
  contractStartDate: optionalIsoDateSchema,
  contractEndDate: optionalIsoDateSchema,
});

export const hrEmployeeIntegrationSensitiveDataSchema = z.object({
  dateOfBirth: optionalIsoDateSchema,
  email: optionalStringSchema,
  identityNumber: optionalStringSchema,
  personalEmail: optionalStringSchema,
  phoneNumber: optionalStringSchema,
  residentialAddress: optionalStringSchema,
  mailingAddress: optionalStringSchema,
  emergencyContactPhoneNumber: optionalStringSchema,
});

export const hrEmployeeIntegrationDocumentCoverageSchema = z.object({
  status: z.enum(["unavailable", "not-owned", "available"]),
  reason: z.string().trim().nullable(),
});

export const hrEmployeeIntegrationSnapshotSchema = z.object({
  snapshotVersion: z.literal(1),
  reference: hrEmployeeIntegrationReferenceSchema,
  assignment: hrEmployeeIntegrationAssignmentReferenceSchema,
  employment: hrEmployeeIntegrationEmploymentReferenceSchema,
  status: z.object({
    currentStatus: hrRecordsEmploymentStatusSchema,
    effectiveAt: optionalIsoDateSchema,
    source: z.string().trim().min(1),
    reason: z.string().trim().nullable(),
  }),
  documentReferenceCoverage: hrEmployeeIntegrationDocumentCoverageSchema,
  sensitive: hrEmployeeIntegrationSensitiveDataSchema.optional(),
});

export const hrEmployeeIntegrationChangeEventSchema = z.object({
  eventName: z.literal("hr.employees.employee.integration.changed.v1"),
  eventVersion: z.literal(1),
  occurredAt: z.string().trim().min(1),
  organizationId: z.string().trim().min(1).nullable(),
  employeeId: z.string().trim().min(1),
  snapshot: hrEmployeeIntegrationSnapshotSchema,
});

export type HrEmployeeIntegrationReference = z.infer<
  typeof hrEmployeeIntegrationReferenceSchema
>;
export type HrEmployeeIntegrationAssignmentReference = z.infer<
  typeof hrEmployeeIntegrationAssignmentReferenceSchema
>;
export type HrEmployeeIntegrationEmploymentReference = z.infer<
  typeof hrEmployeeIntegrationEmploymentReferenceSchema
>;
export type HrEmployeeIntegrationSensitiveData = z.infer<
  typeof hrEmployeeIntegrationSensitiveDataSchema
>;
export type HrEmployeeIntegrationDocumentCoverage = z.infer<
  typeof hrEmployeeIntegrationDocumentCoverageSchema
>;
export type HrEmployeeIntegrationSnapshot = z.infer<
  typeof hrEmployeeIntegrationSnapshotSchema
>;
export type HrEmployeeIntegrationChangeEvent = z.infer<
  typeof hrEmployeeIntegrationChangeEventSchema
>;
