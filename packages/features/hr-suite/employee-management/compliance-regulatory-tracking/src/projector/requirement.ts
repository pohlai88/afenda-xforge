import type {
  ComplianceEvidenceArtifact,
  ComplianceRequirement,
  ComplianceRequirementProjection,
} from "../contracts/index.ts";
import { complianceRequirementProjectionSchema } from "../contracts/index.ts";
import type {
  RequirementOutcome,
  RequirementProjectionArgs,
} from "./shared.ts";
import {
  addDays,
  deriveRequirementId,
  isWithinWindow,
  latestByDate,
  now,
} from "./shared.ts";

const resolveRequirementDueAt = (args: {
  latestEvidence: ComplianceEvidenceArtifact | null;
  obligation: RequirementProjectionArgs["obligation"];
  worker: RequirementProjectionArgs["worker"];
}): Date | null => {
  const { latestEvidence, obligation, worker } = args;

  if (obligation.initialDueInDays && worker.hireDate) {
    return addDays(worker.hireDate, obligation.initialDueInDays);
  }

  if (latestEvidence?.verifiedAt && obligation.renewalEveryDays) {
    return addDays(latestEvidence.verifiedAt, obligation.renewalEveryDays);
  }

  return latestEvidence?.expiresAt ?? null;
};

const deriveVerifiedOutcome = (args: {
  dueAt: Date | null;
  evidenceIds: string[];
  latestEvidence: ComplianceEvidenceArtifact;
  obligation: RequirementProjectionArgs["obligation"];
}): RequirementOutcome => {
  const { dueAt, evidenceIds, latestEvidence, obligation } = args;
  const expiresAt = latestEvidence.expiresAt ?? null;

  if (expiresAt && expiresAt <= now()) {
    return {
      status: "expired",
      riskLevel: obligation.severity,
      statusReason: "Latest evidence is expired",
      dueAt,
      expiresAt,
      evidenceIds,
      evidenceStatus: latestEvidence.status,
    };
  }

  if (expiresAt && isWithinWindow(expiresAt)) {
    return {
      status: "at_risk",
      riskLevel: obligation.severity,
      statusReason: "Latest evidence is nearing expiry",
      dueAt,
      expiresAt,
      evidenceIds,
      evidenceStatus: latestEvidence.status,
    };
  }

  if (dueAt && dueAt <= now()) {
    return {
      status: "overdue",
      riskLevel: obligation.severity,
      statusReason: "Renewal or review is overdue",
      dueAt,
      expiresAt,
      evidenceIds,
      evidenceStatus: latestEvidence.status,
    };
  }

  if (dueAt && isWithinWindow(dueAt)) {
    return {
      status: "at_risk",
      riskLevel: obligation.severity,
      statusReason: "Renewal or review is approaching",
      dueAt,
      expiresAt,
      evidenceIds,
      evidenceStatus: latestEvidence.status,
    };
  }

  return {
    status: "compliant",
    riskLevel: obligation.severity,
    statusReason: "Active verified evidence satisfies the obligation",
    dueAt,
    expiresAt,
    evidenceIds,
    evidenceStatus: latestEvidence.status,
  };
};

export const deriveRequirementOutcome = (
  args: Omit<RequirementProjectionArgs, "correctiveActions">
): RequirementOutcome => {
  const { evidence, exception, obligation, worker } = args;
  const latestEvidence = latestByDate(evidence);
  const verifiedEvidence = latestByDate(
    evidence.filter((entry) => entry.status === "verified")
  );
  const evidenceIds = evidence.map((entry) => entry.id);
  const dueAt = resolveRequirementDueAt({
    latestEvidence: verifiedEvidence,
    obligation,
    worker,
  });
  const expiresAt = verifiedEvidence?.expiresAt ?? null;

  if (
    exception?.status === "waived" &&
    (!exception.waiverExpiresAt || exception.waiverExpiresAt > now())
  ) {
    return {
      status: "waived",
      riskLevel: obligation.severity,
      statusReason: "Requirement is waived",
      dueAt,
      expiresAt,
      evidenceIds,
      evidenceStatus: verifiedEvidence?.status ?? null,
    };
  }

  if (exception?.status === "rejected") {
    return {
      status: "non_compliant",
      riskLevel: obligation.severity,
      statusReason: "Exception was rejected",
      dueAt,
      expiresAt,
      evidenceIds,
      evidenceStatus: verifiedEvidence?.status ?? null,
    };
  }

  if (latestEvidence?.status === "rejected") {
    return {
      status: "non_compliant",
      riskLevel: obligation.severity,
      statusReason: "Evidence was rejected",
      dueAt,
      expiresAt,
      evidenceIds,
      evidenceStatus: latestEvidence.status,
    };
  }

  if (verifiedEvidence?.status === "verified") {
    return deriveVerifiedOutcome({
      dueAt,
      evidenceIds,
      latestEvidence: verifiedEvidence,
      obligation,
    });
  }

  if (exception?.status === "open") {
    return {
      status: "non_compliant",
      riskLevel: obligation.severity,
      statusReason: "Open exception awaiting resolution",
      dueAt,
      expiresAt,
      evidenceIds,
      evidenceStatus: null,
    };
  }

  if (dueAt && dueAt <= now()) {
    return {
      status: "overdue",
      riskLevel: obligation.severity,
      statusReason: "Required evidence or action is overdue",
      dueAt,
      expiresAt,
      evidenceIds,
      evidenceStatus: null,
    };
  }

  if (dueAt && isWithinWindow(dueAt)) {
    return {
      status: "at_risk",
      riskLevel: obligation.severity,
      statusReason: "Required evidence or action is approaching due date",
      dueAt,
      expiresAt,
      evidenceIds,
      evidenceStatus: null,
    };
  }

  return {
    status: "pending",
    riskLevel: obligation.severity,
    statusReason: "Requirement is active but still awaiting evidence",
    dueAt,
    expiresAt,
    evidenceIds,
    evidenceStatus: null,
  };
};

export const projectComplianceRequirement = (
  args: RequirementProjectionArgs
): ComplianceRequirement => {
  const requirementId = deriveRequirementId(
    args.worker.employeeId,
    args.obligation.id
  );
  const outcome = deriveRequirementOutcome(args);

  return complianceRequirementProjectionSchema.parse({
    id: requirementId,
    companyId: args.worker.companyId ?? args.obligation.companyId ?? undefined,
    employeeId: args.worker.employeeId,
    obligationId: args.obligation.id,
    obligationCode: args.obligation.code,
    obligationTitle: args.obligation.title,
    requirementKind: args.obligation.requirementKind,
    severity: args.obligation.severity,
    countryCode: args.worker.countryCode,
    legalEntityCode: args.worker.legalEntityCode,
    workLocationCode: args.worker.workLocationCode,
    employmentType: args.worker.employmentType,
    workerCategory: args.worker.workerCategory,
    departmentId: args.worker.departmentId,
    status: outcome.status,
    riskLevel: outcome.riskLevel,
    dueAt: outcome.dueAt,
    expiresAt: outcome.expiresAt,
    evidenceIds: outcome.evidenceIds,
    evidenceStatus: outcome.evidenceStatus,
    exceptionId: args.exception?.id ?? null,
    correctiveActionIds: args.correctiveActions.map((entry) => entry.id),
    statusReason: outcome.statusReason,
    lastEvaluatedAt: now(),
  });
};

export const projectComplianceRequirements = (
  inputs: readonly ComplianceRequirementProjection[]
): ComplianceRequirementProjection[] =>
  inputs.map((input) => complianceRequirementProjectionSchema.parse(input));
