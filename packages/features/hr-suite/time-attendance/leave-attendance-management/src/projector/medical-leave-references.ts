import type {
  LamLeaveDocument,
  LamLeaveDocumentKind,
  LamLeaveType,
} from "../schema.ts";

const MEDICAL_LEAVE_KINDS = new Set<LamLeaveType["kind"]>([
  "medical",
  "hospitalization",
]);

const MEDICAL_LEAVE_ACCEPTED_DOCUMENT_KINDS = [
  "medical_certificate",
  "panel_clinic_referral",
] as const satisfies readonly LamLeaveDocumentKind[];

export const resolveRequiredLeaveDocumentKind = (
  leaveType: LamLeaveType
): LamLeaveDocumentKind | null => {
  if (!leaveType.requiresDocument) {
    return null;
  }

  if (leaveType.kind === "medical") {
    return "medical_certificate";
  }

  if (leaveType.kind === "hospitalization") {
    return "hospitalization_document";
  }

  return "supporting_document";
};

export const resolveAcceptedLeaveDocumentKinds = (
  leaveType: LamLeaveType
): readonly LamLeaveDocumentKind[] => {
  if (!leaveType.requiresDocument) {
    return [];
  }

  if (leaveType.kind === "medical") {
    return MEDICAL_LEAVE_ACCEPTED_DOCUMENT_KINDS;
  }

  const requiredKind = resolveRequiredLeaveDocumentKind(leaveType);
  return requiredKind ? [requiredKind] : [];
};

export const tracksMedicalLeaveReference = (leaveType: LamLeaveType): boolean =>
  MEDICAL_LEAVE_KINDS.has(leaveType.kind) && leaveType.requiresDocument;

const hasPanelClinicReference = (document: LamLeaveDocument): boolean =>
  Boolean(document.panelClinicId?.trim() || document.panelClinicName?.trim());

const assertMedicalCertificateDocument = (
  leaveType: LamLeaveType,
  document: LamLeaveDocument
): void => {
  if (!document.referenceNumber?.trim()) {
    throw new Error(
      `Medical certificate reference number is required for leave type "${leaveType.code}"`
    );
  }

  if (!hasPanelClinicReference(document)) {
    throw new Error(
      `Panel clinic reference (panelClinicId or panelClinicName) is required for medical leave type "${leaveType.code}"`
    );
  }
};

const assertPanelClinicReferralDocument = (
  leaveType: LamLeaveType,
  document: LamLeaveDocument
): void => {
  if (!document.referenceNumber?.trim()) {
    throw new Error(
      `Panel clinic referral reference number is required for leave type "${leaveType.code}"`
    );
  }

  if (!hasPanelClinicReference(document)) {
    throw new Error(
      `Panel clinic reference (panelClinicId or panelClinicName) is required for panel clinic referral on leave type "${leaveType.code}"`
    );
  }
};

export const assertLeaveDocumentSourceReference = (
  documents: readonly LamLeaveDocument[],
  args: {
    companyId: string;
    employeeId: string;
    document: LamLeaveDocument;
    requireSourceAvailable?: boolean;
  }
): void => {
  const sourceDocumentId = args.document.sourceDocumentId?.trim();
  if (!sourceDocumentId) {
    return;
  }

  const source = documents.find(
    (entry) =>
      entry.id === sourceDocumentId &&
      (entry.companyId ?? args.companyId) === args.companyId
  );

  if (!source) {
    throw new Error(
      `sourceDocumentId "${sourceDocumentId}" was not found for this company`
    );
  }

  if (source.employeeId !== args.employeeId) {
    throw new Error(
      `sourceDocumentId "${sourceDocumentId}" does not belong to employee ${args.employeeId}`
    );
  }

  if (args.requireSourceAvailable && source.status !== "available") {
    throw new Error(
      `sourceDocumentId "${sourceDocumentId}" must reference an available document`
    );
  }

  if (
    source.leaveApplicationId &&
    source.leaveApplicationId !== args.document.leaveApplicationId
  ) {
    throw new Error(
      `sourceDocumentId "${sourceDocumentId}" is already linked to another leave application`
    );
  }

  if (
    args.document.documentKind === "panel_clinic_referral" &&
    source.documentKind !== "medical_certificate"
  ) {
    throw new Error(
      "panel_clinic_referral sourceDocumentId must reference a medical_certificate document"
    );
  }

  if (
    args.document.documentKind === "hospitalization_document" &&
    source.documentKind !== "medical_certificate"
  ) {
    throw new Error(
      "hospitalization_document sourceDocumentId must reference a medical_certificate document"
    );
  }
};

export const assertLeaveDocumentSatisfiesMedicalLeavePolicy = (
  leaveType: LamLeaveType,
  document: LamLeaveDocument
): void => {
  if (!leaveType.requiresDocument) {
    return;
  }

  const acceptedKinds = resolveAcceptedLeaveDocumentKinds(leaveType);
  if (acceptedKinds.length === 0) {
    return;
  }

  if (!acceptedKinds.includes(document.documentKind)) {
    throw new Error(
      `Leave type "${leaveType.code}" requires a ${acceptedKinds.join(" or ")} document; received "${document.documentKind}"`
    );
  }

  if (leaveType.kind === "medical") {
    if (document.documentKind === "panel_clinic_referral") {
      assertPanelClinicReferralDocument(leaveType, document);
      return;
    }

    assertMedicalCertificateDocument(leaveType, document);
    return;
  }

  if (leaveType.kind === "hospitalization") {
    const hasHospitalizationReference =
      Boolean(document.referenceNumber?.trim()) ||
      Boolean(document.hospitalizationAdmissionDate);

    if (!hasHospitalizationReference) {
      throw new Error(
        `Hospitalization reference number or admission date is required for leave type "${leaveType.code}"`
      );
    }

    if (
      document.hospitalizationAdmissionDate &&
      document.hospitalizationDischargeDate &&
      document.hospitalizationDischargeDate.getTime() <
        document.hospitalizationAdmissionDate.getTime()
    ) {
      throw new Error(
        "hospitalizationDischargeDate must be on or after hospitalizationAdmissionDate"
      );
    }
  }
};
