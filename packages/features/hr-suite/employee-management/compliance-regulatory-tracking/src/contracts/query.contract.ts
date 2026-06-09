import {
  complianceAlertQuerySchema,
  complianceAuditQuerySchema,
  complianceCalendarQuerySchema,
  complianceCorrectiveActionQuerySchema,
  complianceEvidenceQuerySchema,
  complianceExceptionQuerySchema,
  complianceFilingQuerySchema,
  complianceObligationQuerySchema,
  complianceRequirementQuerySchema,
  complianceWorkerProfileQuerySchema,
} from "../schema.ts";
import type {
  ComplianceAlertSeverity,
  ComplianceCalendarKind,
  ComplianceCorrectiveActionStatus,
  ComplianceEvidenceSensitivity,
  ComplianceEvidenceStatus,
  ComplianceExceptionStatus,
  ComplianceFilingStatus,
  ComplianceRepositoryEntityType,
  ComplianceRequirementKind,
  ComplianceRiskLevel,
  ComplianceStatus,
} from "./domain.contract.ts";

export type ComplianceListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  companyId?: string;
  countryCode?: string;
  legalEntityCode?: string;
  workLocationCode?: string;
  departmentId?: string;
  employeeId?: string;
};

export type ListComplianceObligationsQuery = ComplianceListQuery & {
  active?: boolean;
  requirementKind?: ComplianceRequirementKind;
  severity?: ComplianceRiskLevel;
};

export type ListComplianceRequirementsQuery = ComplianceListQuery & {
  status?: ComplianceStatus;
  riskLevel?: ComplianceRiskLevel;
};

export type ListComplianceEvidenceQuery = ComplianceListQuery & {
  status?: ComplianceEvidenceStatus;
  sensitivity?: ComplianceEvidenceSensitivity;
};

export type ListComplianceExceptionsQuery = ComplianceListQuery & {
  status?: ComplianceExceptionStatus;
};

export type ListComplianceCorrectiveActionsQuery = ComplianceListQuery & {
  status?: ComplianceCorrectiveActionStatus;
};

export type ListComplianceAlertsQuery = ComplianceListQuery & {
  status?: "open" | "acknowledged" | "closed";
  severity?: ComplianceAlertSeverity;
};

export type ListComplianceCalendarQuery = ComplianceListQuery & {
  kind?: ComplianceCalendarKind;
  status?: "open" | "done" | "closed";
};

export type ListComplianceAuditQuery = ComplianceListQuery & {
  action?: string;
  entityType?: ComplianceRepositoryEntityType;
};

export type ListComplianceWorkerProfilesQuery = ComplianceListQuery & {
  active?: boolean;
};

export type ListComplianceFilingsQuery = ComplianceListQuery & {
  status?: ComplianceFilingStatus;
};

export const listComplianceObligationsQuerySchema: typeof complianceObligationQuerySchema =
  complianceObligationQuerySchema;

export const listComplianceRequirementsQuerySchema: typeof complianceRequirementQuerySchema =
  complianceRequirementQuerySchema;

export const listComplianceEvidenceQuerySchema: typeof complianceEvidenceQuerySchema =
  complianceEvidenceQuerySchema;

export const listComplianceExceptionsQuerySchema: typeof complianceExceptionQuerySchema =
  complianceExceptionQuerySchema;

export const listComplianceCorrectiveActionsQuerySchema: typeof complianceCorrectiveActionQuerySchema =
  complianceCorrectiveActionQuerySchema;

export const listComplianceAlertsQuerySchema: typeof complianceAlertQuerySchema =
  complianceAlertQuerySchema;

export const listComplianceCalendarQuerySchema: typeof complianceCalendarQuerySchema =
  complianceCalendarQuerySchema;

export const listComplianceAuditQuerySchema: typeof complianceAuditQuerySchema =
  complianceAuditQuerySchema;

export const listComplianceWorkerProfilesQuerySchema: typeof complianceWorkerProfileQuerySchema =
  complianceWorkerProfileQuerySchema;

export const listComplianceFilingsQuerySchema: typeof complianceFilingQuerySchema =
  complianceFilingQuerySchema;
