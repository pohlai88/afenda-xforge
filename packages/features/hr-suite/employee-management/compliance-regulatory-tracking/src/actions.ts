import "server-only";

import type {
  ApproveComplianceWaiverInput,
  ComplianceMutationResult,
  ComplianceReportExport,
  ExportComplianceReportInput,
  OpenComplianceExceptionInput,
  RecordComplianceFilingInput,
  SubmitComplianceFilingInput,
  UpdateComplianceAlertStateInput,
  UpsertComplianceCorrectiveActionInput,
  UpsertComplianceEvidenceArtifactInput,
  UpsertComplianceObligationInput,
  UpsertComplianceWorkerProfileInput,
  VerifyComplianceEvidenceArtifactInput,
} from "./contracts/index.ts";
import {
  approveComplianceWaiverInputSchema,
  exportComplianceReportInputSchema,
  openComplianceExceptionInputSchema,
  recordComplianceFilingInputSchema,
  resolveComplianceExceptionInputSchema,
  submitComplianceFilingInputSchema,
  updateComplianceAlertStateInputSchema,
  upsertComplianceCorrectiveActionInputSchema,
  upsertComplianceEvidenceArtifactInputSchema,
  upsertComplianceObligationInputSchema,
  upsertComplianceWorkerProfileInputSchema,
  verifyComplianceEvidenceArtifactInputSchema,
} from "./contracts/index.ts";
import type { ComplianceMutationContext } from "./execution.ts";
import {
  buildComplianceAuditMetadata,
  createComplianceMutationAuditEvent,
  normalizeComplianceMutationActorId,
  requireComplianceMutationAccess,
} from "./execution.ts";
import {
  getComplianceOverviewSnapshot,
  listComplianceAlertsRecords,
  listComplianceCalendarItemsRecords,
  listComplianceExceptionsRecords,
  listComplianceFilingsRecords,
  listComplianceRequirementsRecords,
} from "./queries.ts";
import { complianceRegulatoryTrackingAuditEvents } from "./registry/index.ts";
import {
  createComplianceRecordId,
  mutateComplianceRepository,
} from "./repository.ts";
import {
  complianceAlertStateSchema,
  complianceCorrectiveActionSchema,
  complianceEvidenceArtifactSchema,
  complianceExceptionSchema,
  complianceFilingRecordSchema,
  complianceObligationSchema,
  complianceReportExportSchema,
  complianceWorkerProfileSchema,
  complianceWriteContextSchema,
} from "./schema.ts";

const toFailure = (error: unknown): ComplianceMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected compliance mutation failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error("Company context is required for compliance mutations");
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error("Input companyId does not match compliance context");
  }

  return args.contextCompanyId;
};

const resolveEvidenceAuditAction = (args: {
  hasExistingRecord: boolean;
  status: "expired" | "pending" | "rejected" | "verified";
}): string => {
  if (args.status === "verified") {
    return complianceRegulatoryTrackingAuditEvents.evidenceVerified;
  }

  if (args.status === "expired") {
    return complianceRegulatoryTrackingAuditEvents.evidenceExpired;
  }

  return args.hasExistingRecord
    ? complianceRegulatoryTrackingAuditEvents.evidenceUpdated
    : complianceRegulatoryTrackingAuditEvents.evidenceRecorded;
};

const resolveCorrectiveActionAuditAction = (args: {
  hasExistingRecord: boolean;
  status: "cancelled" | "done" | "in_progress" | "open";
}): string => {
  if (args.status === "done") {
    return complianceRegulatoryTrackingAuditEvents.correctiveActionCompleted;
  }

  return args.hasExistingRecord
    ? complianceRegulatoryTrackingAuditEvents.correctiveActionUpdated
    : complianceRegulatoryTrackingAuditEvents.correctiveActionCreated;
};

const upsertEntity = <
  T extends { id: string; updatedAt: Date; createdAt: Date },
>(
  items: T[],
  entity: T
): T[] => {
  const index = items.findIndex((entry) => entry.id === entity.id);
  if (index === -1) {
    return [...items, entity];
  }

  const next = [...items];
  next[index] = entity;
  return next;
};

export async function upsertComplianceObligation(
  input: UpsertComplianceObligationInput,
  context?: ComplianceMutationContext
): Promise<ComplianceMutationResult> {
  const denied = requireComplianceMutationAccess(context);
  if (denied) {
    return denied;
  }

  try {
    const validInput = upsertComplianceObligationInputSchema.parse(input);
    const parsedContext = complianceWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    resolveScopedCompanyId({
      contextCompanyId: companyId,
      inputCompanyId: validInput.scope?.companyId,
    });
    const parsed = complianceObligationSchema.parse({
      id: validInput.id ?? createComplianceRecordId(),
      companyId,
      code: validInput.code,
      title: validInput.title,
      description: validInput.description ?? null,
      requirementKind: validInput.requirementKind,
      severity: validInput.severity,
      scope: {
        companyId: validInput.scope?.companyId ?? companyId,
        countryCode: validInput.scope?.countryCode ?? null,
        legalEntityCode: validInput.scope?.legalEntityCode ?? null,
        workLocationCode: validInput.scope?.workLocationCode ?? null,
        employmentType: validInput.scope?.employmentType ?? null,
        workerCategory: validInput.scope?.workerCategory ?? null,
        departmentId: validInput.scope?.departmentId ?? null,
      },
      expectedEvidenceType: validInput.expectedEvidenceType,
      initialDueInDays: validInput.initialDueInDays ?? null,
      renewalEveryDays: validInput.renewalEveryDays ?? null,
      effectiveFrom: validInput.effectiveFrom,
      effectiveTo: validInput.effectiveTo ?? null,
      active: validInput.active ?? true,
      jurisdictionSource: validInput.jurisdictionSource,
      version: validInput.version,
      ownerTeam: validInput.ownerTeam ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mutateComplianceRepository((draft) => {
      const before = draft.obligations.find((entry) => entry.id === parsed.id);
      const next = complianceObligationSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.obligations = upsertEntity(draft.obligations, next);
      draft.auditEvents.push(
        createComplianceMutationAuditEvent({
          companyId: next.companyId ?? undefined,
          actorId: normalizeComplianceMutationActorId(context),
          action: validInput.id
            ? complianceRegulatoryTrackingAuditEvents.obligationUpdated
            : complianceRegulatoryTrackingAuditEvents.obligationCreated,
          entityType: "obligation",
          entityId: next.id,
          summary: next.title,
          metadata: buildComplianceAuditMetadata({
            code: next.code,
            requirementKind: next.requirementKind,
            severity: next.severity,
          }),
          before,
          after: next,
        })
      );
    }, parsedContext);

    return { ok: true, targetId: parsed.id };
  } catch (error) {
    return toFailure(error);
  }
}

export async function upsertComplianceWorkerProfile(
  input: UpsertComplianceWorkerProfileInput,
  context?: ComplianceMutationContext
): Promise<ComplianceMutationResult> {
  const denied = requireComplianceMutationAccess(context);
  if (denied) {
    return denied;
  }

  try {
    const validInput = upsertComplianceWorkerProfileInputSchema.parse(input);
    const parsedContext = complianceWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const parsed = complianceWorkerProfileSchema.parse({
      id: validInput.id ?? createComplianceRecordId(),
      companyId,
      employeeId: validInput.employeeId,
      employeeNumber: validInput.employeeNumber,
      displayName: validInput.displayName,
      legalEntityCode: validInput.legalEntityCode ?? null,
      countryCode: validInput.countryCode ?? null,
      workLocationCode: validInput.workLocationCode ?? null,
      employmentType: validInput.employmentType ?? null,
      workerCategory: validInput.workerCategory ?? null,
      departmentId: validInput.departmentId ?? null,
      hireDate: validInput.hireDate ?? null,
      terminationDate: validInput.terminationDate ?? null,
      active: validInput.active ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mutateComplianceRepository((draft) => {
      const before = draft.workerProfiles.find(
        (entry) => entry.id === parsed.id
      );
      const next = complianceWorkerProfileSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.workerProfiles = upsertEntity(draft.workerProfiles, next);
      draft.auditEvents.push(
        createComplianceMutationAuditEvent({
          companyId: next.companyId ?? undefined,
          actorId: normalizeComplianceMutationActorId(context),
          action: validInput.id
            ? complianceRegulatoryTrackingAuditEvents.workerProfileUpdated
            : complianceRegulatoryTrackingAuditEvents.workerProfileCreated,
          entityType: "worker_profile",
          entityId: next.id,
          summary: next.displayName,
          metadata: buildComplianceAuditMetadata({
            employeeId: next.employeeId,
            employeeNumber: next.employeeNumber,
            countryCode: next.countryCode,
          }),
          before,
          after: next,
        })
      );
    }, parsedContext);

    return { ok: true, targetId: parsed.id };
  } catch (error) {
    return toFailure(error);
  }
}

export async function upsertComplianceEvidenceArtifact(
  input: UpsertComplianceEvidenceArtifactInput,
  context?: ComplianceMutationContext
): Promise<ComplianceMutationResult> {
  const denied = requireComplianceMutationAccess(context);
  if (denied) {
    return denied;
  }

  try {
    const validInput = upsertComplianceEvidenceArtifactInputSchema.parse(input);
    if (validInput.status === "verified") {
      throw new Error(
        "Use verifyComplianceEvidenceArtifact to verify compliance evidence"
      );
    }
    const parsedContext = complianceWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const parsed = complianceEvidenceArtifactSchema.parse({
      id: validInput.id ?? createComplianceRecordId(),
      companyId,
      employeeId: validInput.employeeId,
      obligationId: validInput.obligationId,
      requirementId: validInput.requirementId ?? null,
      evidenceType: validInput.evidenceType,
      title: validInput.title,
      sourceDocumentId: validInput.sourceDocumentId ?? null,
      sourceDocumentNumber: validInput.sourceDocumentNumber ?? null,
      sourceNotes: validInput.sourceNotes ?? null,
      sensitivity: validInput.sensitivity ?? "public",
      status: validInput.status ?? "pending",
      issuedAt: validInput.issuedAt ?? null,
      expiresAt: validInput.expiresAt ?? null,
      verifiedAt: validInput.verifiedAt ?? null,
      verifiedBy: validInput.verifiedBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mutateComplianceRepository((draft) => {
      const before = draft.evidence.find((entry) => entry.id === parsed.id);
      const next = complianceEvidenceArtifactSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.evidence = upsertEntity(draft.evidence, next);
      draft.auditEvents.push(
        createComplianceMutationAuditEvent({
          companyId: next.companyId ?? undefined,
          actorId: normalizeComplianceMutationActorId(context),
          action: resolveEvidenceAuditAction({
            hasExistingRecord: Boolean(before),
            status: next.status,
          }),
          entityType: "evidence",
          entityId: next.id,
          summary: next.title,
          metadata: buildComplianceAuditMetadata({
            employeeId: next.employeeId,
            obligationId: next.obligationId,
            requirementId: next.requirementId,
            status: next.status,
            sensitivity: next.sensitivity,
          }),
          before,
          after: next,
        })
      );
    }, parsedContext);

    return { ok: true, targetId: parsed.id };
  } catch (error) {
    return toFailure(error);
  }
}

export async function openComplianceException(
  input: OpenComplianceExceptionInput,
  context?: ComplianceMutationContext
): Promise<ComplianceMutationResult> {
  const denied = requireComplianceMutationAccess(context);
  if (denied) {
    return denied;
  }

  try {
    const validInput = openComplianceExceptionInputSchema.parse(input);
    const parsedContext = complianceWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const parsed = complianceExceptionSchema.parse({
      id: validInput.id ?? createComplianceRecordId(),
      companyId,
      employeeId: validInput.employeeId,
      obligationId: validInput.obligationId,
      requirementId: validInput.requirementId,
      reason: validInput.reason,
      status: "open",
      ownerId: validInput.ownerId ?? null,
      dueAt: validInput.dueAt ?? null,
      waiverExpiresAt: validInput.waiverExpiresAt ?? null,
      approvedBy: null,
      approvedAt: null,
      resolvedAt: null,
      resolutionNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mutateComplianceRepository((draft) => {
      const before = draft.exceptions.find((entry) => entry.id === parsed.id);
      const next = complianceExceptionSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.exceptions = upsertEntity(draft.exceptions, next);
      draft.auditEvents.push(
        createComplianceMutationAuditEvent({
          companyId: next.companyId ?? undefined,
          actorId: normalizeComplianceMutationActorId(context),
          action: complianceRegulatoryTrackingAuditEvents.exceptionOpened,
          entityType: "exception",
          entityId: next.id,
          summary: next.reason,
          metadata: buildComplianceAuditMetadata({
            employeeId: next.employeeId,
            obligationId: next.obligationId,
            requirementId: next.requirementId,
          }),
          before,
          after: next,
        })
      );
    }, parsedContext);

    return { ok: true, targetId: parsed.id };
  } catch (error) {
    return toFailure(error);
  }
}

export async function approveComplianceWaiver(
  input: ApproveComplianceWaiverInput,
  context?: ComplianceMutationContext
): Promise<ComplianceMutationResult> {
  const denied = requireComplianceMutationAccess(context);
  if (denied) {
    return denied;
  }

  try {
    const validInput = approveComplianceWaiverInputSchema.parse(input);
    const parsedContext = complianceWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
    });
    let targetId = "";

    await mutateComplianceRepository((draft) => {
      const current = draft.exceptions.find(
        (entry) =>
          entry.id === validInput.exceptionId && entry.companyId === companyId
      );
      if (!current) {
        throw new Error("Exception not found");
      }

      const parsed = complianceExceptionSchema.parse({
        ...current,
        status: "waived",
        approvedBy: validInput.approvedBy,
        approvedAt: new Date(),
        waiverExpiresAt:
          validInput.waiverExpiresAt ?? current.waiverExpiresAt ?? null,
        reason: current.reason,
        resolutionNotes: validInput.reason ?? current.resolutionNotes ?? null,
        updatedAt: new Date(),
      });

      draft.exceptions = upsertEntity(draft.exceptions, parsed);
      draft.auditEvents.push(
        createComplianceMutationAuditEvent({
          companyId: parsed.companyId ?? undefined,
          actorId: normalizeComplianceMutationActorId(context),
          action:
            complianceRegulatoryTrackingAuditEvents.exceptionWaiverApproved,
          entityType: "exception",
          entityId: parsed.id,
          summary: parsed.reason,
          reason: validInput.reason ?? undefined,
          metadata: buildComplianceAuditMetadata({
            approvedBy: validInput.approvedBy,
            waiverExpiresAt: parsed.waiverExpiresAt,
          }),
          before: current,
          after: parsed,
        })
      );
      targetId = parsed.id;
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}

export async function resolveComplianceException(
  input: { exceptionId: string; resolutionNotes?: string | null },
  context?: ComplianceMutationContext
): Promise<ComplianceMutationResult> {
  const denied = requireComplianceMutationAccess(context);
  if (denied) {
    return denied;
  }

  try {
    const validInput = resolveComplianceExceptionInputSchema.parse(input);
    const parsedContext = complianceWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
    });
    let targetId = "";

    await mutateComplianceRepository((draft) => {
      const current = draft.exceptions.find(
        (entry) =>
          entry.id === validInput.exceptionId && entry.companyId === companyId
      );
      if (!current) {
        throw new Error("Exception not found");
      }

      const parsed = complianceExceptionSchema.parse({
        ...current,
        status: "resolved",
        resolvedAt: new Date(),
        resolutionNotes:
          validInput.resolutionNotes ?? current.resolutionNotes ?? null,
        updatedAt: new Date(),
      });

      draft.exceptions = upsertEntity(draft.exceptions, parsed);
      draft.auditEvents.push(
        createComplianceMutationAuditEvent({
          companyId: parsed.companyId ?? undefined,
          actorId: normalizeComplianceMutationActorId(context),
          action: complianceRegulatoryTrackingAuditEvents.exceptionResolved,
          entityType: "exception",
          entityId: parsed.id,
          summary: parsed.reason,
          metadata: buildComplianceAuditMetadata({
            resolutionNotes: parsed.resolutionNotes,
          }),
          before: current,
          after: parsed,
        })
      );
      targetId = parsed.id;
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}

export async function upsertComplianceCorrectiveAction(
  input: UpsertComplianceCorrectiveActionInput,
  context?: ComplianceMutationContext
): Promise<ComplianceMutationResult> {
  const denied = requireComplianceMutationAccess(context);
  if (denied) {
    return denied;
  }

  try {
    const validInput = upsertComplianceCorrectiveActionInputSchema.parse(input);
    const parsedContext = complianceWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const parsed = complianceCorrectiveActionSchema.parse({
      id: validInput.id ?? createComplianceRecordId(),
      companyId,
      employeeId: validInput.employeeId,
      obligationId: validInput.obligationId,
      requirementId: validInput.requirementId,
      exceptionId: validInput.exceptionId ?? null,
      title: validInput.title,
      description: validInput.description ?? null,
      ownerId: validInput.ownerId ?? null,
      status: validInput.status ?? "open",
      dueAt: validInput.dueAt ?? null,
      completedAt: validInput.completedAt ?? null,
      evidenceIds: validInput.evidenceIds ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mutateComplianceRepository((draft) => {
      const before = draft.correctiveActions.find(
        (entry) => entry.id === parsed.id
      );
      const next = complianceCorrectiveActionSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.correctiveActions = upsertEntity(draft.correctiveActions, next);
      draft.auditEvents.push(
        createComplianceMutationAuditEvent({
          companyId: next.companyId ?? undefined,
          actorId: normalizeComplianceMutationActorId(context),
          action: resolveCorrectiveActionAuditAction({
            hasExistingRecord: Boolean(before),
            status: next.status,
          }),
          entityType: "corrective_action",
          entityId: next.id,
          summary: next.title,
          metadata: buildComplianceAuditMetadata({
            requirementId: next.requirementId,
            exceptionId: next.exceptionId,
            status: next.status,
          }),
          before,
          after: next,
        })
      );
    }, parsedContext);

    return { ok: true, targetId: parsed.id };
  } catch (error) {
    return toFailure(error);
  }
}

export async function verifyComplianceEvidenceArtifact(
  input: VerifyComplianceEvidenceArtifactInput,
  context?: ComplianceMutationContext
): Promise<ComplianceMutationResult> {
  const denied = requireComplianceMutationAccess(context);
  if (denied) {
    return denied;
  }

  try {
    if (!context?.canViewSensitive) {
      throw new Error(
        "Sensitive evidence access is required to verify evidence"
      );
    }

    const validInput = verifyComplianceEvidenceArtifactInputSchema.parse(input);
    const parsedContext = complianceWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
    });
    let targetId = "";

    await mutateComplianceRepository((draft) => {
      const current = draft.evidence.find(
        (entry) =>
          entry.id === validInput.evidenceId && entry.companyId === companyId
      );
      if (!current) {
        throw new Error("Evidence artifact not found");
      }

      const parsed = complianceEvidenceArtifactSchema.parse({
        ...current,
        status: "verified",
        verifiedAt: validInput.verifiedAt ?? new Date(),
        verifiedBy: validInput.verifiedBy,
        updatedAt: new Date(),
      });

      draft.evidence = upsertEntity(draft.evidence, parsed);
      draft.auditEvents.push(
        createComplianceMutationAuditEvent({
          companyId: parsed.companyId ?? undefined,
          actorId: normalizeComplianceMutationActorId(context),
          action: complianceRegulatoryTrackingAuditEvents.evidenceVerified,
          entityType: "evidence",
          entityId: parsed.id,
          summary: parsed.title,
          reason: validInput.reason ?? undefined,
          metadata: buildComplianceAuditMetadata({
            employeeId: parsed.employeeId,
            obligationId: parsed.obligationId,
            requirementId: parsed.requirementId,
            verifiedBy: parsed.verifiedBy,
          }),
          before: current,
          after: parsed,
        })
      );
      targetId = parsed.id;
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}

export async function recordComplianceFiling(
  input: RecordComplianceFilingInput,
  context?: ComplianceMutationContext
): Promise<ComplianceMutationResult> {
  const denied = requireComplianceMutationAccess(context);
  if (denied) {
    return denied;
  }

  try {
    const validInput = recordComplianceFilingInputSchema.parse(input);
    const parsedContext = complianceWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const parsed = complianceFilingRecordSchema.parse({
      id: validInput.id ?? createComplianceRecordId(),
      companyId,
      obligationId: validInput.obligationId,
      filingCode: validInput.filingCode,
      title: validInput.title,
      jurisdictionSource: validInput.jurisdictionSource,
      dueAt: validInput.dueAt,
      submittedAt: null,
      submittedBy: null,
      status: validInput.status ?? "recorded",
      evidenceIds: validInput.evidenceIds ?? [],
      confirmationReference: null,
      notes: validInput.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mutateComplianceRepository((draft) => {
      const before = draft.filings.find((entry) => entry.id === parsed.id);
      const next = complianceFilingRecordSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.filings = upsertEntity(draft.filings, next);
      draft.auditEvents.push(
        createComplianceMutationAuditEvent({
          companyId: next.companyId ?? undefined,
          actorId: normalizeComplianceMutationActorId(context),
          action: complianceRegulatoryTrackingAuditEvents.filingRecorded,
          entityType: "filing",
          entityId: next.id,
          summary: next.title,
          metadata: buildComplianceAuditMetadata({
            filingCode: next.filingCode,
            status: next.status,
            dueAt: next.dueAt,
          }),
          before,
          after: next,
        })
      );
    }, parsedContext);

    return { ok: true, targetId: parsed.id };
  } catch (error) {
    return toFailure(error);
  }
}

export async function submitComplianceFiling(
  input: SubmitComplianceFilingInput,
  context?: ComplianceMutationContext
): Promise<ComplianceMutationResult> {
  const denied = requireComplianceMutationAccess(context);
  if (denied) {
    return denied;
  }

  try {
    const validInput = submitComplianceFilingInputSchema.parse(input);
    const parsedContext = complianceWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
    });
    let targetId = "";

    await mutateComplianceRepository((draft) => {
      const current = draft.filings.find(
        (entry) =>
          entry.id === validInput.filingId && entry.companyId === companyId
      );
      if (!current) {
        throw new Error("Compliance filing not found");
      }

      const parsed = complianceFilingRecordSchema.parse({
        ...current,
        status: "submitted",
        submittedAt: validInput.submittedAt ?? new Date(),
        submittedBy: validInput.submittedBy,
        confirmationReference: validInput.confirmationReference ?? null,
        evidenceIds: validInput.evidenceIds ?? current.evidenceIds,
        notes: validInput.notes ?? current.notes ?? null,
        updatedAt: new Date(),
      });

      draft.filings = upsertEntity(draft.filings, parsed);
      draft.auditEvents.push(
        createComplianceMutationAuditEvent({
          companyId: parsed.companyId ?? undefined,
          actorId: normalizeComplianceMutationActorId(context),
          action: complianceRegulatoryTrackingAuditEvents.filingSubmitted,
          entityType: "filing",
          entityId: parsed.id,
          summary: parsed.title,
          metadata: buildComplianceAuditMetadata({
            filingCode: parsed.filingCode,
            confirmationReference: parsed.confirmationReference,
            submittedBy: parsed.submittedBy,
          }),
          before: current,
          after: parsed,
        })
      );
      targetId = parsed.id;
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}

const updateComplianceAlertState = async (
  input: UpdateComplianceAlertStateInput,
  status: "acknowledged" | "closed",
  context?: ComplianceMutationContext
): Promise<ComplianceMutationResult> => {
  const denied = requireComplianceMutationAccess(context);
  if (denied) {
    return denied;
  }

  try {
    const validInput = updateComplianceAlertStateInputSchema.parse(input);
    const parsedContext = complianceWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
    });
    const parsed = complianceAlertStateSchema.parse({
      id: validInput.alertId,
      companyId,
      alertId: validInput.alertId,
      status,
      actorId: normalizeComplianceMutationActorId(context),
      reason: validInput.reason ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mutateComplianceRepository((draft) => {
      const before = draft.alertStates.find(
        (entry) =>
          entry.alertId === parsed.alertId && entry.companyId === companyId
      );
      const next = complianceAlertStateSchema.parse({
        ...parsed,
        createdAt: before?.createdAt ?? parsed.createdAt,
      });
      draft.alertStates = upsertEntity(draft.alertStates, next);
      draft.auditEvents.push(
        createComplianceMutationAuditEvent({
          companyId: next.companyId ?? undefined,
          actorId: normalizeComplianceMutationActorId(context),
          action:
            status === "closed"
              ? complianceRegulatoryTrackingAuditEvents.alertClosed
              : complianceRegulatoryTrackingAuditEvents.alertAcknowledged,
          entityType: "alert_state",
          entityId: next.id,
          summary: `${status} compliance alert`,
          reason: validInput.reason ?? undefined,
          metadata: buildComplianceAuditMetadata({
            alertId: next.alertId,
            status: next.status,
          }),
          before,
          after: next,
        })
      );
    }, parsedContext);

    return { ok: true, targetId: parsed.id };
  } catch (error) {
    return toFailure(error);
  }
};

export const acknowledgeComplianceAlert = (
  input: UpdateComplianceAlertStateInput,
  context?: ComplianceMutationContext
): Promise<ComplianceMutationResult> =>
  updateComplianceAlertState(input, "acknowledged", context);

export const closeComplianceAlert = (
  input: UpdateComplianceAlertStateInput,
  context?: ComplianceMutationContext
): Promise<ComplianceMutationResult> =>
  updateComplianceAlertState(input, "closed", context);

const csvEscape = (value: unknown): string => {
  let text: string;
  if (value instanceof Date) {
    text = value.toISOString();
  } else if (typeof value === "object" && value !== null) {
    text = JSON.stringify(value);
  } else {
    text = String(value ?? "");
  }

  return `"${text.replaceAll('"', '""')}"`;
};

const toCsv = (rows: readonly Record<string, unknown>[]): string => {
  const headers = Array.from(
    rows.reduce<Set<string>>((keys, row) => {
      for (const key of Object.keys(row)) {
        keys.add(key);
      }
      return keys;
    }, new Set<string>())
  );

  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) =>
      headers.map((header) => csvEscape(row[header])).join(",")
    ),
  ].join("\n");
};

export async function exportComplianceReport(
  input: ExportComplianceReportInput,
  context?: ComplianceMutationContext
): Promise<ComplianceReportExport | ComplianceMutationResult> {
  const denied = requireComplianceMutationAccess(context);
  if (denied) {
    return denied;
  }

  try {
    const validInput = exportComplianceReportInputSchema.parse(input);
    const parsedContext = complianceWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });
    const readContext = {
      canRead: true,
      canViewSensitive: Boolean(parsedContext.canViewSensitive),
      companyId,
      tenantId: parsedContext.tenantId,
    };
    let rows: readonly Record<string, unknown>[];
    if (validInput.reportKind === "overview") {
      rows = [await getComplianceOverviewSnapshot(readContext)];
    } else if (validInput.reportKind === "requirements") {
      rows = await listComplianceRequirementsRecords({}, readContext);
    } else if (validInput.reportKind === "alerts") {
      rows = await listComplianceAlertsRecords({}, readContext);
    } else if (validInput.reportKind === "calendar") {
      rows = await listComplianceCalendarItemsRecords({}, readContext);
    } else if (validInput.reportKind === "exceptions") {
      rows = await listComplianceExceptionsRecords({}, readContext);
    } else {
      rows = await listComplianceFilingsRecords({}, readContext);
    }
    const exportRecord = complianceReportExportSchema.parse({
      id: createComplianceRecordId(),
      companyId,
      reportKind: validInput.reportKind,
      format: validInput.format ?? "csv",
      fileName: `compliance-${validInput.reportKind}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
      contentType: "text/csv",
      content: toCsv(rows),
      generatedBy: normalizeComplianceMutationActorId(context),
      generatedAt: new Date(),
    });

    await mutateComplianceRepository((draft) => {
      draft.auditEvents.push(
        createComplianceMutationAuditEvent({
          companyId,
          actorId: exportRecord.generatedBy,
          action: complianceRegulatoryTrackingAuditEvents.reportExported,
          entityType: "report_export",
          entityId: exportRecord.id,
          summary: exportRecord.fileName,
          metadata: buildComplianceAuditMetadata({
            reportKind: exportRecord.reportKind,
            format: exportRecord.format,
          }),
        })
      );
    }, parsedContext);

    return exportRecord;
  } catch (error) {
    return toFailure(error);
  }
}

export const complianceMutationActions = {
  acknowledgeComplianceAlert,
  approveComplianceWaiver,
  closeComplianceAlert,
  exportComplianceReport,
  openComplianceException,
  recordComplianceFiling,
  resolveComplianceException,
  submitComplianceFiling,
  upsertComplianceCorrectiveAction,
  upsertComplianceEvidenceArtifact,
  upsertComplianceObligation,
  upsertComplianceWorkerProfile,
  verifyComplianceEvidenceArtifact,
} as const;
