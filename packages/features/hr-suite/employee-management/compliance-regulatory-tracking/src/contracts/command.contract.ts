import { z } from "zod";
import {
  complianceCorrectiveActionStatusSchema,
  complianceEvidenceSensitivitySchema,
  complianceEvidenceStatusSchema,
  complianceFilingStatusSchema,
  complianceReportExportFormatSchema,
  complianceRequirementKindSchema,
  complianceRiskLevelSchema,
  complianceScopeSchema,
  isoDateSchema,
  optionalIsoDateSchema,
  optionalTrimmedStringSchema,
  trimmedStringSchema,
} from "../schema.ts";
import type {
  ComplianceCorrectiveActionStatus,
  ComplianceEvidenceSensitivity,
  ComplianceEvidenceStatus,
  ComplianceFilingStatus,
  ComplianceReportExportFormat,
  ComplianceRequirementKind,
  ComplianceRiskLevel,
  ComplianceScope,
} from "./domain.contract.ts";

export type UpsertComplianceObligationInput = {
  id?: string;
  companyId?: string;
  code: string;
  title: string;
  description?: string | null;
  requirementKind: ComplianceRequirementKind;
  severity: ComplianceRiskLevel;
  scope?: Partial<ComplianceScope>;
  expectedEvidenceType: string;
  initialDueInDays?: number | null;
  renewalEveryDays?: number | null;
  effectiveFrom: Date | string;
  effectiveTo?: Date | string | null;
  active?: boolean;
  jurisdictionSource: string;
  version: string;
  ownerTeam?: string | null;
};

export type UpsertComplianceWorkerProfileInput = {
  id?: string;
  companyId?: string;
  employeeId: string;
  employeeNumber: string;
  displayName: string;
  legalEntityCode?: string | null;
  countryCode?: string | null;
  workLocationCode?: string | null;
  employmentType?: string | null;
  workerCategory?: string | null;
  departmentId?: string | null;
  hireDate?: Date | string | null;
  terminationDate?: Date | string | null;
  active?: boolean;
};

export type UpsertComplianceEvidenceArtifactInput = {
  id?: string;
  companyId?: string;
  employeeId: string;
  obligationId: string;
  requirementId?: string | null;
  evidenceType: string;
  title: string;
  sourceDocumentId?: string | null;
  sourceDocumentNumber?: string | null;
  sourceNotes?: string | null;
  sensitivity?: ComplianceEvidenceSensitivity;
  status?: ComplianceEvidenceStatus;
  issuedAt?: Date | string | null;
  expiresAt?: Date | string | null;
  verifiedAt?: Date | string | null;
  verifiedBy?: string | null;
};

export type VerifyComplianceEvidenceArtifactInput = {
  evidenceId: string;
  verifiedBy: string;
  verifiedAt?: Date | string | null;
  reason?: string | null;
};

export type OpenComplianceExceptionInput = {
  id?: string;
  companyId?: string;
  employeeId: string;
  obligationId: string;
  requirementId: string;
  reason: string;
  ownerId?: string | null;
  dueAt?: Date | string | null;
  waiverExpiresAt?: Date | string | null;
};

export type ApproveComplianceWaiverInput = {
  exceptionId: string;
  approvedBy: string;
  waiverExpiresAt?: Date | string | null;
  reason?: string | null;
};

export type UpsertComplianceCorrectiveActionInput = {
  id?: string;
  companyId?: string;
  employeeId: string;
  obligationId: string;
  requirementId: string;
  exceptionId?: string | null;
  title: string;
  description?: string | null;
  ownerId?: string | null;
  status?: ComplianceCorrectiveActionStatus;
  dueAt?: Date | string | null;
  completedAt?: Date | string | null;
  evidenceIds?: string[];
};

export type ResolveComplianceExceptionInput = {
  exceptionId: string;
  resolutionNotes?: string | null;
};

export type RecordComplianceFilingInput = {
  id?: string;
  companyId?: string;
  obligationId: string;
  filingCode: string;
  title: string;
  jurisdictionSource: string;
  dueAt: Date | string;
  status?: ComplianceFilingStatus;
  evidenceIds?: string[];
  notes?: string | null;
};

export type SubmitComplianceFilingInput = {
  filingId: string;
  submittedBy: string;
  submittedAt?: Date | string | null;
  confirmationReference?: string | null;
  evidenceIds?: string[];
  notes?: string | null;
};

export type UpdateComplianceAlertStateInput = {
  alertId: string;
  reason?: string | null;
};

export type ExportComplianceReportInput = {
  companyId?: string;
  reportKind:
    | "overview"
    | "requirements"
    | "alerts"
    | "calendar"
    | "exceptions"
    | "filings";
  format?: ComplianceReportExportFormat;
};

export type ComplianceMutationResult =
  | { ok: true; targetId: string; message?: string }
  | { ok: false; error: string };

export const upsertComplianceObligationInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  code: trimmedStringSchema,
  title: trimmedStringSchema,
  description: z.string().trim().nullable().optional(),
  requirementKind: complianceRequirementKindSchema,
  severity: complianceRiskLevelSchema,
  scope: complianceScopeSchema.partial().optional(),
  expectedEvidenceType: trimmedStringSchema,
  initialDueInDays: z.number().int().positive().nullable().optional(),
  renewalEveryDays: z.number().int().positive().nullable().optional(),
  effectiveFrom: isoDateSchema,
  effectiveTo: optionalIsoDateSchema,
  active: z.boolean().optional(),
  jurisdictionSource: trimmedStringSchema,
  version: trimmedStringSchema,
  ownerTeam: z.string().trim().nullable().optional(),
});

export const upsertComplianceWorkerProfileInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  employeeNumber: trimmedStringSchema,
  displayName: trimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  countryCode: optionalTrimmedStringSchema,
  workLocationCode: optionalTrimmedStringSchema,
  employmentType: optionalTrimmedStringSchema,
  workerCategory: optionalTrimmedStringSchema,
  departmentId: optionalTrimmedStringSchema,
  hireDate: optionalIsoDateSchema,
  terminationDate: optionalIsoDateSchema,
  active: z.boolean().optional(),
});

export const upsertComplianceEvidenceArtifactInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  obligationId: trimmedStringSchema,
  requirementId: optionalTrimmedStringSchema,
  evidenceType: trimmedStringSchema,
  title: trimmedStringSchema,
  sourceDocumentId: optionalTrimmedStringSchema,
  sourceDocumentNumber: optionalTrimmedStringSchema,
  sourceNotes: z.string().trim().nullable().optional(),
  sensitivity: complianceEvidenceSensitivitySchema.optional(),
  status: complianceEvidenceStatusSchema.optional(),
  issuedAt: optionalIsoDateSchema,
  expiresAt: optionalIsoDateSchema,
  verifiedAt: optionalIsoDateSchema,
  verifiedBy: optionalTrimmedStringSchema,
});

export const verifyComplianceEvidenceArtifactInputSchema = z.object({
  evidenceId: trimmedStringSchema,
  verifiedBy: trimmedStringSchema,
  verifiedAt: optionalIsoDateSchema,
  reason: z.string().trim().nullable().optional(),
});

export const openComplianceExceptionInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  obligationId: trimmedStringSchema,
  requirementId: trimmedStringSchema,
  reason: trimmedStringSchema,
  ownerId: optionalTrimmedStringSchema,
  dueAt: optionalIsoDateSchema,
  waiverExpiresAt: optionalIsoDateSchema,
});

export const approveComplianceWaiverInputSchema = z.object({
  exceptionId: trimmedStringSchema,
  approvedBy: trimmedStringSchema,
  waiverExpiresAt: optionalIsoDateSchema,
  reason: z.string().trim().nullable().optional(),
});

export const upsertComplianceCorrectiveActionInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  obligationId: trimmedStringSchema,
  requirementId: trimmedStringSchema,
  exceptionId: optionalTrimmedStringSchema,
  title: trimmedStringSchema,
  description: z.string().trim().nullable().optional(),
  ownerId: optionalTrimmedStringSchema,
  status: complianceCorrectiveActionStatusSchema.optional(),
  dueAt: optionalIsoDateSchema,
  completedAt: optionalIsoDateSchema,
  evidenceIds: z.array(trimmedStringSchema).optional(),
});

export const resolveComplianceExceptionInputSchema = z.object({
  exceptionId: trimmedStringSchema,
  resolutionNotes: z.string().trim().nullable().optional(),
});

export const recordComplianceFilingInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  obligationId: trimmedStringSchema,
  filingCode: trimmedStringSchema,
  title: trimmedStringSchema,
  jurisdictionSource: trimmedStringSchema,
  dueAt: isoDateSchema,
  status: complianceFilingStatusSchema.optional(),
  evidenceIds: z.array(trimmedStringSchema).optional(),
  notes: z.string().trim().nullable().optional(),
});

export const submitComplianceFilingInputSchema = z.object({
  filingId: trimmedStringSchema,
  submittedBy: trimmedStringSchema,
  submittedAt: optionalIsoDateSchema,
  confirmationReference: optionalTrimmedStringSchema,
  evidenceIds: z.array(trimmedStringSchema).optional(),
  notes: z.string().trim().nullable().optional(),
});

export const updateComplianceAlertStateInputSchema = z.object({
  alertId: trimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
});

export const exportComplianceReportInputSchema = z.object({
  companyId: optionalTrimmedStringSchema,
  reportKind: z.enum([
    "overview",
    "requirements",
    "alerts",
    "calendar",
    "exceptions",
    "filings",
  ]),
  format: complianceReportExportFormatSchema.optional(),
});
