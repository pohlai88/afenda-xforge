import type {
  ComplianceAuditEventProjection,
  ComplianceObligation,
  ComplianceOverview,
  ComplianceOverviewProjection,
  ComplianceRequirement,
  ComplianceRiskLevel,
  ComplianceStatus,
  ComplianceWorkerProfile,
} from "../contracts/index.ts";
import {
  complianceAuditEventProjectionSchema,
  complianceOverviewProjectionSchema,
} from "../contracts/index.ts";
import { now } from "./shared.ts";

export const buildComplianceOverview = (args: {
  obligations: readonly ComplianceObligation[];
  workerProfiles: readonly ComplianceWorkerProfile[];
  requirements: readonly ComplianceRequirement[];
  alerts: readonly { status: "open" | "acknowledged" | "closed" }[];
  exceptions: readonly {
    status: "open" | "waived" | "resolved" | "rejected";
  }[];
}): ComplianceOverview => {
  const countsByStatus: Record<ComplianceStatus, number> = {
    compliant: 0,
    pending: 0,
    overdue: 0,
    expired: 0,
    waived: 0,
    non_compliant: 0,
    at_risk: 0,
  };

  const countsByRiskLevel: Record<ComplianceRiskLevel, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  for (const requirement of args.requirements) {
    countsByStatus[requirement.status] += 1;
    countsByRiskLevel[requirement.riskLevel] += 1;
  }

  const overdueRequirements = args.requirements.filter(
    (requirement) => requirement.status === "overdue"
  ).length;
  const expiringRequirements = args.requirements.filter(
    (requirement) => requirement.status === "at_risk"
  ).length;

  return complianceOverviewProjectionSchema.parse({
    companyId:
      args.obligations[0]?.companyId ??
      args.workerProfiles[0]?.companyId ??
      undefined,
    generatedAt: now(),
    totalObligations: args.obligations.length,
    totalWorkers: args.workerProfiles.length,
    totalRequirements: args.requirements.length,
    countsByStatus,
    countsByRiskLevel,
    openAlerts: args.alerts.filter((alert) => alert.status === "open").length,
    openExceptions: args.exceptions.filter((entry) => entry.status === "open")
      .length,
    overdueRequirements,
    expiringRequirements,
  });
};

export const projectComplianceOverview = (
  input: ComplianceOverviewProjection
): ComplianceOverviewProjection =>
  complianceOverviewProjectionSchema.parse(input);

export const projectComplianceAuditEvents = (
  inputs: readonly ComplianceAuditEventProjection[]
): ComplianceAuditEventProjection[] =>
  inputs.map((input) => complianceAuditEventProjectionSchema.parse(input));
