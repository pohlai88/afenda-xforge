import type {
  ComplianceCalendarItem,
  ComplianceRegulatoryCalendarProjection,
  ComplianceRequirement,
} from "../contracts/index.ts";
import { complianceRegulatoryCalendarProjectionSchema } from "../contracts/index.ts";

export const projectComplianceCalendarItemsForRequirement = (
  requirement: ComplianceRequirement
): readonly ComplianceCalendarItem[] => {
  const calendarItems: ComplianceCalendarItem[] = [];

  if (requirement.dueAt) {
    calendarItems.push(
      complianceRegulatoryCalendarProjectionSchema.parse({
        id: `${requirement.id}:calendar:due`,
        companyId: requirement.companyId,
        employeeId: requirement.employeeId,
        obligationId: requirement.obligationId,
        requirementId: requirement.id,
        kind: "initial_due",
        status:
          requirement.status === "compliant" || requirement.status === "waived"
            ? "done"
            : "open",
        severity: requirement.severity,
        title: `${requirement.obligationCode} due`,
        dueAt: requirement.dueAt,
      })
    );
  }

  if (requirement.expiresAt) {
    calendarItems.push(
      complianceRegulatoryCalendarProjectionSchema.parse({
        id: `${requirement.id}:calendar:expiry`,
        companyId: requirement.companyId,
        employeeId: requirement.employeeId,
        obligationId: requirement.obligationId,
        requirementId: requirement.id,
        kind: "expiry",
        status:
          requirement.status === "expired" ||
          requirement.status === "non_compliant" ||
          requirement.status === "overdue"
            ? "open"
            : "done",
        severity: requirement.severity,
        title: `${requirement.obligationCode} expiry`,
        dueAt: requirement.expiresAt,
      })
    );
  }

  return calendarItems;
};

export const projectComplianceCalendarItems = (
  inputs: readonly ComplianceRegulatoryCalendarProjection[]
): ComplianceRegulatoryCalendarProjection[] =>
  inputs.map((input) =>
    complianceRegulatoryCalendarProjectionSchema.parse(input)
  );
