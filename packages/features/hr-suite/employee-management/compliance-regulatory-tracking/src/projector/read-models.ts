import type {
  ComplianceAlert,
  ComplianceCalendarItem,
  ComplianceCorrectiveAction,
  ComplianceEvidenceArtifact,
  ComplianceException,
  ComplianceObligation,
  ComplianceRequirement,
  ComplianceWorkerProfile,
} from "../contracts/index.ts";
import { projectComplianceAlert, projectComplianceAlerts } from "./alert.ts";
import {
  projectComplianceCalendarItems,
  projectComplianceCalendarItemsForRequirement,
} from "./calendar.ts";
import {
  projectComplianceRequirement,
  projectComplianceRequirements,
} from "./requirement.ts";
import {
  deriveRequirementId,
  matchesScope,
  pickCorrectiveActions,
  pickEvidence,
  pickException,
} from "./shared.ts";

export const buildComplianceReadModels = (snapshot: {
  obligations: readonly ComplianceObligation[];
  workerProfiles: readonly ComplianceWorkerProfile[];
  evidence: readonly ComplianceEvidenceArtifact[];
  exceptions: readonly ComplianceException[];
  correctiveActions: readonly ComplianceCorrectiveAction[];
}): {
  requirements: ComplianceRequirement[];
  alerts: ComplianceAlert[];
  calendarItems: ComplianceCalendarItem[];
} => {
  const requirements: ComplianceRequirement[] = [];
  const alerts: ComplianceAlert[] = [];
  const calendarItems: ComplianceCalendarItem[] = [];

  for (const worker of snapshot.workerProfiles) {
    for (const obligation of snapshot.obligations) {
      if (!(obligation.active && matchesScope(worker, obligation))) {
        continue;
      }

      const requirementId = deriveRequirementId(
        worker.employeeId,
        obligation.id
      );
      const evidence = pickEvidence(
        snapshot.evidence,
        worker.employeeId,
        obligation.id,
        requirementId
      );
      const exception = pickException(snapshot.exceptions, requirementId);
      const correctiveActions = pickCorrectiveActions(
        snapshot.correctiveActions,
        requirementId
      );
      const requirement = projectComplianceRequirement({
        evidence,
        exception,
        obligation,
        worker,
        correctiveActions,
      });

      requirements.push(requirement);

      const alert = projectComplianceAlert({ requirement, exception });
      if (alert) {
        alerts.push(alert);
      }

      calendarItems.push(
        ...projectComplianceCalendarItemsForRequirement(requirement)
      );
    }
  }

  return {
    requirements: projectComplianceRequirements(requirements),
    alerts: projectComplianceAlerts(alerts),
    calendarItems: projectComplianceCalendarItems(calendarItems),
  };
};
