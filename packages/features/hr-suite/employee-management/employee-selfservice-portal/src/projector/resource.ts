import type { DocumentsManagementDocumentSummaryProjection } from "../../../documents-management/src/contracts/index.ts";

import type {
  EmployeeSelfservicePortalResourceCategory,
  EmployeeSelfservicePortalResourceItem,
} from "../schema.ts";
import { employeeSelfservicePortalResourceItemSchema } from "../schema.ts";

const FORM_DOCUMENT_TYPES = new Set([
  "bank_form",
  "tax_form",
  "statutory_registration_form",
  "payroll_declaration_reference",
  "consent_form",
  "statutory_declaration",
  "regulatory_form",
]);

const getResourceCategory = (
  document: DocumentsManagementDocumentSummaryProjection
): EmployeeSelfservicePortalResourceCategory | null => {
  if (document.documentCategory === "policy") {
    return document.documentType === "employee_handbook_acknowledgment"
      ? "handbook"
      : "policy";
  }

  if (FORM_DOCUMENT_TYPES.has(document.documentType)) {
    return "form";
  }

  return null;
};

const getResourceSummary = (
  category: EmployeeSelfservicePortalResourceCategory
): string => {
  switch (category) {
    case "handbook":
      return "Employee handbook resource available for self-service review.";
    case "policy":
      return "HR policy resource available for self-service review.";
    case "form":
      return "HR form available for employee self-service access.";
    case "faq":
      return "Frequently asked HR guidance for self-service users.";
    default:
      return "HR resource available for employee self-service access.";
  }
};

export function projectEmployeeSelfservicePortalDocumentResource(
  document: DocumentsManagementDocumentSummaryProjection
): EmployeeSelfservicePortalResourceItem | null {
  const category = getResourceCategory(document);

  if (!category) {
    return null;
  }

  return employeeSelfservicePortalResourceItemSchema.parse({
    acknowledgmentStatus: document.acknowledgmentStatus ?? null,
    body: null,
    category,
    documentId: document.id,
    documentType: document.documentType,
    employeeId: document.employeeId,
    id: `document:${document.id}`,
    mandatory: document.mandatory,
    policyId: null,
    policyVersion: null,
    source: "documents_management",
    status: document.status,
    summary: getResourceSummary(category),
    title: document.title,
    updatedAt: document.updatedAt,
    visibility: document.visibility,
  });
}
