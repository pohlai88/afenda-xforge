import { z } from "zod";
import type { HrRecordsEmploymentStatus } from "./hr.workforce.records-employment-status.schema.ts";
import { hrRecordsEmploymentStatusSchema } from "./hr.workforce.records-employment-status.schema.ts";
import type {
  hrRecordsCreateEmployeeSchema,
  hrRecordsUpdateEmployeeSchema,
} from "./hr.workforce.records-form.shared.ts";
import type { HrRecordsRoutePath } from "./hr.workforce.records-route.contract.ts";

export const hrRecordsReadPermission = {
  module: "hr",
  object: "employees",
  function: "read",
} as const;

export const hrRecordsWritePermission = {
  module: "hr",
  object: "employees",
  function: "update",
} as const;

export const hrRecordsSensitiveReadPermission = {
  module: "hr",
  object: "employees",
  function: "read",
} as const;

export type HrRecordsActionResult =
  | { ok: true; message?: string; targetId?: string }
  | { ok: false; error: string };

export type HrEmployeeRecordSummary = {
  id: string;
  employeeNumber: string;
  displayName: string;
  employmentStatus: HrRecordsEmploymentStatus;
};

export type HrEmployeeRecord = HrEmployeeRecordSummary & {
  departmentName: string | null;
  positionTitle: string | null;
  employmentStartDate: Date | null;
  employmentType: string;
  workerCategory: string;
  grade: string;
  level: string;
  legalEntityCode: string;
  workLocationCode: string;
  countryCode: string;
  contractStartDate: Date | null;
  contractEndDate: Date | null;
  currentDepartmentId: string | null;
  currentPositionId: string | null;
  managerEmployeeId: string | null;
  matrixManagerEmployeeId: string | null;
  hrOwnerEmployeeId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type HrEmployeeRecordDetail = HrEmployeeRecord & {
  legalName: string;
  preferredName: string | null;
  email: string;
  identityNumber: string;
  identityDocumentType: string;
  nationality: string;
  phoneNumber: string;
  personalEmail: string;
  dateOfBirth: Date | null;
  gender: string;
  maritalStatus: string;
  languagePreference: string;
  residentialAddress: string;
  mailingAddress: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhoneNumber: string;
};

export type { HrEmployeeRecordExportView } from "./projector/record-detail.ts";

export type HrRecordsSearchParams = {
  incompleteSearch?: string;
  directorySearch?: string;
  assignmentsSearch?: string;
  auditTrailSearch?: string;
  statusHistorySearch?: string;
  documentReferencesSearch?: string;
  separatedSearch?: string;
  employmentStatusFilter?: HrRecordsEmploymentStatus;
  page?: number;
  pageSize?: number;
};

export type HrRecordsCreateEmployeeInput = z.infer<
  typeof hrRecordsCreateEmployeeSchema
>;

export type HrRecordsUpdateEmployeeInput = z.infer<
  typeof hrRecordsUpdateEmployeeSchema
>;

export type HrRecordsAssignmentInput = {
  employeeId: string;
  currentDepartmentId?: string;
  currentPositionId?: string;
  managerEmployeeId?: string;
  workLocationCode?: string;
  assignmentEffectiveFrom?: Date;
  assignmentReason?: string;
  reason?: string;
};

export type HrRecordsRehireEmployeeInput = {
  priorEmployeeId: string;
  employeeNumber: string;
  legalName: string;
  preferredName?: string;
  email?: string;
  employmentStartDate?: Date;
  reason?: string;
};

export type HrRecordsArchiveEmployeeInput = {
  employeeId: string;
  reason: string;
};

export type HrRecordsPageModelInput = {
  organizationId: string;
  canWrite: boolean;
  canViewSensitive: boolean;
  page?: number;
  pageSize?: number;
  incompleteSearch?: string;
  directorySearch?: string;
  assignmentsSearch?: string;
  auditTrailSearch?: string;
  statusHistorySearch?: string;
  documentReferencesSearch?: string;
  separatedSearch?: string;
  employmentStatusFilter?: HrRecordsEmploymentStatus;
  searchParams?: Record<string, string | string[] | undefined>;
};

export type HrEmployeeRecordPageModel = {
  organizationId: string;
  canWrite: boolean;
  canViewSensitive: boolean;
  search: HrRecordsSearchParams;
  routePaths: Record<string, HrRecordsRoutePath>;
  records: readonly HrEmployeeRecordSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export const hrRecordsSearchParamsSchema = z.object({
  incompleteSearch: z.string().trim().optional(),
  directorySearch: z.string().trim().optional(),
  assignmentsSearch: z.string().trim().optional(),
  auditTrailSearch: z.string().trim().optional(),
  statusHistorySearch: z.string().trim().optional(),
  documentReferencesSearch: z.string().trim().optional(),
  separatedSearch: z.string().trim().optional(),
  employmentStatusFilter: hrRecordsEmploymentStatusSchema.optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
});
