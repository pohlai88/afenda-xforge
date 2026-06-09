import type {
  ComplianceAlert,
  ComplianceAlertProjection,
  ComplianceAlertSeverity,
} from "../contracts/index.ts";
import { complianceAlertProjectionSchema } from "../contracts/index.ts";
import type { RequirementAlertArgs } from "./shared.ts";
import { now } from "./shared.ts";

const alertSeverityForStatus = (
  status: RequirementAlertArgs["requirement"]["status"],
  severity: RequirementAlertArgs["requirement"]["severity"]
): ComplianceAlertSeverity => {
  if (
    status === "overdue" ||
    status === "non_compliant" ||
    status === "expired"
  ) {
    return severity === "critical" ? "critical" : "high";
  }

  if (status === "at_risk") {
    return severity === "low" ? "warning" : "high";
  }

  return "warning";
};

export const projectComplianceAlert = (
  args: RequirementAlertArgs
): ComplianceAlert | null => {
  const { requirement, exception } = args;

  if (requirement.status === "compliant" || requirement.status === "waived") {
    return null;
  }

  let kind: ComplianceAlert["kind"] = "missing_evidence";
  if (requirement.status === "expired") {
    kind = "expiring_evidence";
  } else if (requirement.status === "overdue") {
    kind = "overdue_requirement";
  } else if (
    requirement.status === "non_compliant" &&
    exception?.status === "open"
  ) {
    kind = "exception_open";
  } else if (
    requirement.status === "non_compliant" &&
    requirement.evidenceStatus === "rejected"
  ) {
    kind = "rejected_evidence";
  }

  return complianceAlertProjectionSchema.parse({
    id: `${requirement.id}:alert:${requirement.status}`,
    companyId: requirement.companyId,
    employeeId: requirement.employeeId,
    obligationId: requirement.obligationId,
    requirementId: requirement.id,
    kind,
    severity: alertSeverityForStatus(requirement.status, requirement.severity),
    status: "open",
    message: requirement.statusReason ?? "Compliance attention required",
    dueAt: requirement.dueAt ?? requirement.expiresAt ?? null,
    generatedAt: now(),
  });
};

export const projectComplianceAlerts = (
  inputs: readonly ComplianceAlertProjection[]
): ComplianceAlertProjection[] =>
  inputs.map((input) => complianceAlertProjectionSchema.parse(input));
