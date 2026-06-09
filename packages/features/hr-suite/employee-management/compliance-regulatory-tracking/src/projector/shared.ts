import type {
  ComplianceCorrectiveAction,
  ComplianceEvidenceArtifact,
  ComplianceException,
  ComplianceObligation,
  ComplianceRequirement,
  ComplianceRiskLevel,
  ComplianceStatus,
  ComplianceWorkerProfile,
} from "../contracts/index.ts";

export const AT_RISK_WINDOW_DAYS = 30;
export const DAY_MS = 24 * 60 * 60 * 1000;

export const now = (): Date => new Date();

export const isWithinWindow = (
  date: Date,
  windowDays = AT_RISK_WINDOW_DAYS
): boolean => date.getTime() - now().getTime() <= windowDays * DAY_MS;

export const matchesScope = (
  worker: ComplianceWorkerProfile,
  obligation: ComplianceObligation
): boolean => {
  const scope = obligation.scope;
  const checks: [string | null | undefined, string | null | undefined][] = [
    [scope.companyId ?? obligation.companyId, worker.companyId],
    [scope.countryCode, worker.countryCode],
    [scope.legalEntityCode, worker.legalEntityCode],
    [scope.workLocationCode, worker.workLocationCode],
    [scope.employmentType, worker.employmentType],
    [scope.workerCategory, worker.workerCategory],
    [scope.departmentId, worker.departmentId],
  ];

  return checks.every(([ruleValue, workerValue]) => {
    if (!ruleValue) {
      return true;
    }

    return ruleValue === workerValue;
  });
};

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * DAY_MS);

export const latestByDate = <T extends { createdAt: Date; updatedAt: Date }>(
  items: readonly T[]
): T | null =>
  items.reduce<T | null>((latest, item) => {
    if (!latest) {
      return item;
    }

    return item.updatedAt.getTime() > latest.updatedAt.getTime()
      ? item
      : latest;
  }, null);

export const pickEvidence = (
  evidence: readonly ComplianceEvidenceArtifact[],
  employeeId: string,
  obligationId: string,
  requirementId: string
): ComplianceEvidenceArtifact[] =>
  evidence.filter(
    (entry) =>
      entry.employeeId === employeeId &&
      entry.obligationId === obligationId &&
      (entry.requirementId === requirementId || !entry.requirementId)
  );

export const pickException = (
  exceptions: readonly ComplianceException[],
  requirementId: string
): ComplianceException | null =>
  latestByDate(
    exceptions.filter((entry) => entry.requirementId === requirementId)
  );

export const pickCorrectiveActions = (
  correctiveActions: readonly ComplianceCorrectiveAction[],
  requirementId: string
): readonly ComplianceCorrectiveAction[] =>
  correctiveActions.filter((entry) => entry.requirementId === requirementId);

export const deriveRequirementId = (
  employeeId: string,
  obligationId: string
): string => `${employeeId}:${obligationId}`;

export type RequirementOutcome = {
  status: ComplianceStatus;
  riskLevel: ComplianceRiskLevel;
  statusReason: string;
  dueAt: Date | null;
  expiresAt: Date | null;
  evidenceIds: string[];
  evidenceStatus: ComplianceEvidenceArtifact["status"] | null;
};

export type RequirementProjectionArgs = {
  evidence: readonly ComplianceEvidenceArtifact[];
  exception: ComplianceException | null;
  obligation: ComplianceObligation;
  worker: ComplianceWorkerProfile;
  correctiveActions: readonly ComplianceCorrectiveAction[];
};

export type RequirementAlertArgs = {
  requirement: ComplianceRequirement;
  exception: ComplianceException | null;
};
