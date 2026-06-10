import {
  assertLeaveDocumentSatisfiesMedicalLeavePolicy,
  assertLeaveDocumentSourceReference,
} from "../projector/medical-leave-references.ts";
import type { LamLeaveDocument, LamLeaveType } from "../schema.ts";

export const lamLeaveDocumentFieldLabels = {
  documentKind: "Document Kind",
  fileName: "File Name",
  contentType: "Content Type",
  referenceNumber: "Reference Number",
  panelClinicName: "Panel Clinic",
  panelClinicId: "Panel Clinic ID",
  issuedAt: "Issued Date",
  expiresAt: "Expiry Date",
  hospitalizationAdmissionDate: "Admission Date",
  hospitalizationDischargeDate: "Discharge Date",
  sourceDocumentId: "Source Document",
  status: "Status",
} as const;

export const resolveSupportingDocument = (
  draft: { leaveDocuments: readonly LamLeaveDocument[] },
  args: {
    companyId: string;
    employeeId: string;
    supportingDocumentId?: string | null;
    requiresDocument: boolean;
    leaveType: LamLeaveType;
  }
): LamLeaveDocument | undefined => {
  if (args.requiresDocument && !args.supportingDocumentId) {
    throw new Error(
      `Supporting document is required for leave type "${args.leaveType.code}"`
    );
  }

  if (!args.supportingDocumentId) {
    return;
  }

  const document = draft.leaveDocuments.find(
    (entry) =>
      entry.id === args.supportingDocumentId &&
      entry.companyId === args.companyId
  );

  if (!document) {
    throw new Error(
      `Supporting document "${args.supportingDocumentId}" was not found for this company`
    );
  }

  if (document.employeeId !== args.employeeId) {
    throw new Error(
      `Supporting document "${document.id}" does not belong to employee ${args.employeeId}`
    );
  }

  if (document.status !== "available") {
    throw new Error(
      `Supporting document "${document.id}" must be uploaded and confirmed before submission`
    );
  }

  if (document.leaveApplicationId) {
    throw new Error(
      `Supporting document "${document.id}" is already linked to leave application "${document.leaveApplicationId}"`
    );
  }

  assertLeaveDocumentSatisfiesMedicalLeavePolicy(args.leaveType, document);
  assertLeaveDocumentSourceReference(draft.leaveDocuments, {
    companyId: args.companyId,
    employeeId: args.employeeId,
    document,
    requireSourceAvailable: true,
  });

  return document;
};
