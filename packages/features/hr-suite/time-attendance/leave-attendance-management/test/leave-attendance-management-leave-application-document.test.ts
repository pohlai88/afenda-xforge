import assert from "node:assert/strict";
import { test } from "node:test";
import {
  lamLeaveDocumentFieldLabels,
  resolveSupportingDocument,
} from "../src/shared/leave-application-document.ts";
import { mapLamMutationErrorToHttpStatus } from "../src/shared/leave-application-submit.ts";

const leaveType = {
  id: "lt-001",
  code: "MC",
  kind: "medical",
  requiresDocument: true,
} as never;

const availableDocument = {
  id: "doc-001",
  companyId: "company-001",
  employeeId: "emp-001",
  status: "available",
  documentKind: "medical_certificate",
  referenceNumber: "MC-001",
  panelClinicName: "Panel Clinic",
  leaveApplicationId: null,
} as never;

test("HRM-LAM-008 resolveSupportingDocument rejects when policy requires document", () => {
  assert.throws(
    () =>
      resolveSupportingDocument(
        { leaveDocuments: [] },
        {
          companyId: "company-001",
          employeeId: "emp-001",
          requiresDocument: true,
          leaveType,
        }
      ),
    /Supporting document is required for leave type "MC"/
  );
});

test("HRM-LAM-008 resolveSupportingDocument rejects document not found", () => {
  assert.throws(
    () =>
      resolveSupportingDocument(
        { leaveDocuments: [] },
        {
          companyId: "company-001",
          employeeId: "emp-001",
          supportingDocumentId: "missing-doc",
          requiresDocument: true,
          leaveType,
        }
      ),
    /was not found for this company/
  );
});

test("HRM-LAM-008 resolveSupportingDocument rejects document owned by another employee", () => {
  assert.throws(
    () =>
      resolveSupportingDocument(
        {
          leaveDocuments: [
            {
              ...availableDocument,
              employeeId: "emp-002",
            },
          ],
        },
        {
          companyId: "company-001",
          employeeId: "emp-001",
          supportingDocumentId: "doc-001",
          requiresDocument: true,
          leaveType,
        }
      ),
    /does not belong to employee emp-001/
  );
});

test("HRM-LAM-008 resolveSupportingDocument rejects pending document status", () => {
  assert.throws(
    () =>
      resolveSupportingDocument(
        {
          leaveDocuments: [
            {
              ...availableDocument,
              status: "pending_upload",
            },
          ],
        },
        {
          companyId: "company-001",
          employeeId: "emp-001",
          supportingDocumentId: "doc-001",
          requiresDocument: true,
          leaveType,
        }
      ),
    /must be uploaded and confirmed before submission/
  );
});

test("HRM-LAM-008 resolveSupportingDocument rejects already linked document", () => {
  assert.throws(
    () =>
      resolveSupportingDocument(
        {
          leaveDocuments: [
            {
              ...availableDocument,
              leaveApplicationId: "app-existing",
            },
          ],
        },
        {
          companyId: "company-001",
          employeeId: "emp-001",
          supportingDocumentId: "doc-001",
          requiresDocument: true,
          leaveType,
        }
      ),
    /already linked to leave application "app-existing"/
  );
});

test("HRM-LAM-008 resolveSupportingDocument accepts available confirmed document", () => {
  const resolved = resolveSupportingDocument(
    { leaveDocuments: [availableDocument] },
    {
      companyId: "company-001",
      employeeId: "emp-001",
      supportingDocumentId: "doc-001",
      requiresDocument: true,
      leaveType,
    }
  );

  assert.equal(resolved?.id, "doc-001");
});

test("AC-009 mapLamMutationErrorToHttpStatus maps document validation failures to 422", () => {
  assert.equal(
    mapLamMutationErrorToHttpStatus(
      'Supporting document is required for leave type "MC"'
    ),
    422
  );
  assert.equal(
    mapLamMutationErrorToHttpStatus(
      'Supporting document "doc-001" must be uploaded and confirmed before submission'
    ),
    422
  );
  assert.equal(
    mapLamMutationErrorToHttpStatus(
      'Supporting document "doc-001" is already linked to leave application "app-1"'
    ),
    422
  );
});

test("HRM-LAM-008 lamLeaveDocumentFieldLabels exposes upload metadata fields", () => {
  assert.equal(lamLeaveDocumentFieldLabels.documentKind, "Document Kind");
  assert.equal(lamLeaveDocumentFieldLabels.referenceNumber, "Reference Number");
  assert.equal(lamLeaveDocumentFieldLabels.panelClinicName, "Panel Clinic");
});
