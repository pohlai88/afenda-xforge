import "server-only";

import type {
  ConfirmLamLeaveDocumentUploadInput,
  CreateLamLeaveDocumentUploadSessionInput,
  LamLeaveDocumentUploadSessionResult,
  LamMutationResult,
} from "../contracts/index.ts";
import {
  confirmLamLeaveDocumentUploadInputSchema,
  createLamLeaveDocumentUploadSessionInputSchema,
  leaveAttendanceManagementAuditEvents,
} from "../contracts/index.ts";
import type { LamMutationContext } from "../execution.ts";
import {
  buildLamAuditMetadata,
  createLamMutationAuditEvent,
  normalizeLamMutationActorId,
  requireLamEmployeeMutationScope,
  requireLamLeaveApplicationsWriteAccess,
} from "../execution.ts";
import { sanitizeLeaveDocumentFileName } from "../projector/application-policy.ts";
import { assertLeaveDocumentSourceReference } from "../projector/medical-leave-references.ts";
import {
  createLamRecordId,
  mutateLamRepository,
  upsertLamEntity,
} from "../repository.ts";
import { lamLeaveDocumentSchema, lamWriteContextSchema } from "../schema.ts";

const toFailure = (error: unknown): LamMutationResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave document mutation failure",
});

const toUploadSessionFailure = (
  error: unknown
): LamLeaveDocumentUploadSessionResult => ({
  ok: false,
  error:
    error instanceof Error
      ? error.message
      : "Unexpected leave document upload session failure",
});

const resolveScopedCompanyId = (args: {
  contextCompanyId?: string;
  inputCompanyId?: string | null;
}): string => {
  if (!args.contextCompanyId) {
    throw new Error("Company context is required for leave document mutations");
  }

  if (args.inputCompanyId && args.inputCompanyId !== args.contextCompanyId) {
    throw new Error(
      "Input companyId does not match leave and attendance context"
    );
  }

  return args.contextCompanyId;
};

const buildLeaveDocumentStorageKey = (args: {
  companyId: string;
  employeeId: string;
  documentId: string;
  fileName: string;
}): string =>
  `lam/${args.companyId}/${args.employeeId}/${args.documentId}/${args.fileName}`;

export async function createLamLeaveDocumentUploadSession(
  input: CreateLamLeaveDocumentUploadSessionInput,
  context?: LamMutationContext
): Promise<LamLeaveDocumentUploadSessionResult> {
  const denied = requireLamLeaveApplicationsWriteAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput =
      createLamLeaveDocumentUploadSessionInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });

    const scopeDenied = requireLamEmployeeMutationScope(
      context,
      validInput.employeeId
    );
    if (scopeDenied && !scopeDenied.ok) {
      return scopeDenied;
    }

    const documentId = createLamRecordId();
    const safeFileName = sanitizeLeaveDocumentFileName(validInput.fileName);
    const storageKey = buildLeaveDocumentStorageKey({
      companyId,
      employeeId: validInput.employeeId,
      documentId,
      fileName: safeFileName,
    });
    const now = new Date();

    await mutateLamRepository((draft) => {
      const document = lamLeaveDocumentSchema.parse({
        id: documentId,
        companyId,
        employeeId: validInput.employeeId,
        storageKey,
        fileName: safeFileName,
        contentType: validInput.contentType,
        status: "pending_upload",
        documentKind: validInput.documentKind ?? "supporting_document",
        referenceNumber: validInput.referenceNumber ?? null,
        panelClinicId: validInput.panelClinicId ?? null,
        panelClinicName: validInput.panelClinicName ?? null,
        issuedAt: validInput.issuedAt ?? null,
        expiresAt: validInput.expiresAt ?? null,
        hospitalizationAdmissionDate:
          validInput.hospitalizationAdmissionDate ?? null,
        hospitalizationDischargeDate:
          validInput.hospitalizationDischargeDate ?? null,
        sourceDocumentId: validInput.sourceDocumentId ?? null,
        leaveApplicationId: null,
        uploadedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      draft.leaveDocuments = upsertLamEntity(draft.leaveDocuments, document);

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action:
            leaveAttendanceManagementAuditEvents.leaveDocumentReferenceCreated,
          entityType: "leave_document",
          entityId: document.id,
          summary: `Leave document reference created for employee ${validInput.employeeId}`,
          metadata: buildLamAuditMetadata({
            employeeId: validInput.employeeId,
            fileName: validInput.fileName,
            contentType: validInput.contentType,
            storageKey,
            referenceNumber: validInput.referenceNumber,
            documentKind: document.documentKind,
            panelClinicId: validInput.panelClinicId,
            panelClinicName: validInput.panelClinicName,
            sourceDocumentId: validInput.sourceDocumentId,
          }),
          before: null,
          after: document,
        })
      );
    }, parsedContext);

    return { ok: true, targetId: documentId, storageKey };
  } catch (error) {
    return toUploadSessionFailure(error);
  }
}

export async function confirmLamLeaveDocumentUpload(
  input: ConfirmLamLeaveDocumentUploadInput,
  context?: LamMutationContext
): Promise<LamMutationResult> {
  const denied = requireLamLeaveApplicationsWriteAccess(context);
  if (denied && !denied.ok) {
    return denied;
  }

  try {
    const validInput = confirmLamLeaveDocumentUploadInputSchema.parse(input);
    const parsedContext = lamWriteContextSchema.parse(context ?? {});
    const companyId = resolveScopedCompanyId({
      contextCompanyId: parsedContext.companyId,
      inputCompanyId: validInput.companyId,
    });

    if (validInput.employeeId) {
      const scopeDenied = requireLamEmployeeMutationScope(
        context,
        validInput.employeeId
      );
      if (scopeDenied && !scopeDenied.ok) {
        return scopeDenied;
      }
    }

    let targetId = "";

    await mutateLamRepository((draft) => {
      const current = draft.leaveDocuments.find(
        (entry) =>
          entry.id === validInput.documentId && entry.companyId === companyId
      );

      if (!current) {
        throw new Error(
          `Leave document "${validInput.documentId}" was not found for this company`
        );
      }

      const scopeDenied = requireLamEmployeeMutationScope(
        context,
        validInput.employeeId ?? current.employeeId
      );
      if (scopeDenied && !scopeDenied.ok) {
        throw new Error(scopeDenied.error);
      }

      if (current.status !== "pending_upload") {
        throw new Error(
          `Leave document "${current.id}" cannot be confirmed from status "${current.status}"`
        );
      }

      if (
        validInput.employeeId &&
        current.employeeId !== validInput.employeeId
      ) {
        throw new Error(
          `Leave document "${current.id}" does not belong to employee ${validInput.employeeId}`
        );
      }

      const uploadedAt = new Date();
      const document = lamLeaveDocumentSchema.parse({
        ...current,
        status: "available",
        uploadedAt,
        updatedAt: uploadedAt,
      });

      assertLeaveDocumentSourceReference(draft.leaveDocuments, {
        companyId,
        employeeId: document.employeeId,
        document,
        requireSourceAvailable: true,
      });

      draft.leaveDocuments = upsertLamEntity(draft.leaveDocuments, document);
      targetId = document.id;

      draft.auditEvents.push(
        createLamMutationAuditEvent({
          companyId,
          actorId: normalizeLamMutationActorId(context),
          action:
            leaveAttendanceManagementAuditEvents.leaveDocumentUploadConfirmed,
          entityType: "leave_document",
          entityId: document.id,
          summary: `Leave document upload confirmed for employee ${document.employeeId}`,
          metadata: buildLamAuditMetadata({
            employeeId: document.employeeId,
            fileName: document.fileName,
            storageKey: document.storageKey,
            uploadedAt: uploadedAt.toISOString(),
          }),
          before: current,
          after: document,
        })
      );
    }, parsedContext);

    return { ok: true, targetId };
  } catch (error) {
    return toFailure(error);
  }
}
