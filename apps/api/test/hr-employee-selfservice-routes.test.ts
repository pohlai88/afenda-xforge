import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { createEmployeeSelfservicePortal } from "@repo/features-employee-management-employee-selfservice-portal/server";
import {
  resetDocumentsManagementAuditWriterForTesting,
  restoreDocumentsManagementDatabaseAuditWriter,
} from "../../../packages/features/hr-suite/employee-management/documents-management/src/audit.ts";
import {
  resetDocumentsManagementRepositoryForTesting,
  setDocumentsManagementRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/documents-management/src/repository.testing.ts";
import {
  upsertDocumentsManagementRepositoryDocument,
  upsertDocumentsManagementRepositoryDocumentObligation,
} from "../../../packages/features/hr-suite/employee-management/documents-management/src/repository.ts";
import {
  documentsManagementDocumentObligationSchema,
  documentsManagementDocumentSchema,
} from "../../../packages/features/hr-suite/employee-management/documents-management/src/schema.ts";
import {
  resetEmployeeSelfservicePortalRepositoryForTesting,
  setEmployeeSelfservicePortalRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/employee-selfservice-portal/src/repository.ts";
import { GET as getAuditTrailRoute } from "../app/api/hr/employee-selfservice-portal/audit-trail/route.ts";
import {
  GET as getAcknowledgmentsRoute,
  POST as postAcknowledgmentRoute,
} from "../app/api/hr/employee-selfservice-portal/documents/acknowledgments/route.ts";
import { GET as getDocumentsRoute } from "../app/api/hr/employee-selfservice-portal/documents/route.ts";
import { GET as getResourcesRoute } from "../app/api/hr/employee-selfservice-portal/resources/route.ts";

let sandboxDirectory: string;
let acknowledgmentObligationId = "";

const documentsContext = {
  companyId: "company-a",
  tenantId: "tenant-a",
};

const defaultRetention = {
  action: "retain" as const,
  anonymizeBeforeDeletion: false,
  archiveAfterEmployeeSeparation: false,
  retentionPeriodDays: null,
};

const seedDocument = (input: {
  documentCategory: "other" | "policy";
  documentType: "employee_handbook_acknowledgment" | "tax_form";
  employeeId: string;
  id: string;
  mandatory: boolean;
  title: string;
}) =>
  upsertDocumentsManagementRepositoryDocument(
    documentsManagementDocumentSchema.parse({
      acknowledgment: null,
      companyId: documentsContext.companyId,
      createdAt: new Date(),
      description: null,
      documentCategory: input.documentCategory,
      documentType: input.documentType,
      employeeId: input.employeeId,
      id: input.id,
      mandatory: input.mandatory,
      reference: {},
      retention: defaultRetention,
      status: "verified",
      title: input.title,
      updatedAt: new Date(),
      uploadedAt: new Date(),
      verifiedAt: new Date(),
      versionCount: 1,
      visibility: "internal",
    }),
    documentsContext
  );

const baseHeaders = {
  "x-actor-employee-id": "employee-1",
  "x-can-read-employee-selfservice-portal": "true",
  "x-can-write-employee-selfservice-portal": "true",
  "x-company-id": "company-a",
  "x-organization-id": "org-a",
  "x-request-id": "request-a",
  "x-tenant-id": "tenant-a",
  "x-user-id": "employee-user",
};

const buildRequest = (path: string, init: RequestInit = {}): Request =>
  new Request(`http://localhost${path}`, {
    ...init,
    headers: {
      ...baseHeaders,
      ...(init.headers ?? {}),
    },
  });

beforeEach(() => {
  sandboxDirectory = mkdtempSync(join(tmpdir(), "api-ess-routes-"));
  setEmployeeSelfservicePortalRepositoryPathForTesting(
    join(sandboxDirectory, "ess-repository.json")
  );
  resetEmployeeSelfservicePortalRepositoryForTesting();
  setDocumentsManagementRepositoryPathForTesting(
    join(sandboxDirectory, "documents-repository.json")
  );
  resetDocumentsManagementRepositoryForTesting();
  resetDocumentsManagementAuditWriterForTesting();

  createEmployeeSelfservicePortal(
    {
      displayName: "Employee One",
      employeeId: "employee-1",
      employeeNumber: "E001",
      locale: "en-US",
      workEmail: "employee.one@example.com",
    },
    {
      canWrite: true,
      companyId: "company-a",
      tenantId: "tenant-a",
      userId: "hr-admin",
    }
  );

  seedDocument({
    documentCategory: "policy",
    documentType: "employee_handbook_acknowledgment",
    employeeId: "employee-1",
    id: "document-handbook-2026",
    mandatory: true,
    title: "Employee Handbook 2026",
  });

  seedDocument({
    documentCategory: "other",
    documentType: "tax_form",
    employeeId: "employee-1",
    id: "document-tax-form",
    mandatory: false,
    title: "Tax Declaration Form",
  });

  const obligation = upsertDocumentsManagementRepositoryDocumentObligation(
    documentsManagementDocumentObligationSchema.parse({
      acknowledgmentId: null,
      companyId: documentsContext.companyId,
      createdAt: new Date(),
      description: null,
      documentCategory: "policy",
      documentType: "employee_handbook_acknowledgment",
      employeeId: "employee-1",
      id: "obligation-handbook-2026",
      mandatory: true,
      obligationType: "policy_acknowledgment",
      policyId: "policy-handbook-2026",
      policyVersion: "v2026.1",
      retention: defaultRetention,
      source: "policy-assignment",
      status: "pending",
      title: "Employee Handbook Acknowledgment",
      updatedAt: new Date(),
    }),
    documentsContext
  );

  acknowledgmentObligationId = obligation.id;
});

afterEach(() => {
  restoreDocumentsManagementDatabaseAuditWriter();
  rmSync(sandboxDirectory, { force: true, recursive: true });
});

test("records ESS document, resource, and acknowledgment events through the audit trail route", async () => {
  const documentsResponse = await getDocumentsRoute(
    buildRequest("/api/hr/employee-selfservice-portal/documents")
  );
  const resourcesResponse = await getResourcesRoute(
    buildRequest("/api/hr/employee-selfservice-portal/resources")
  );
  const acknowledgmentsResponse = await getAcknowledgmentsRoute(
    buildRequest(
      "/api/hr/employee-selfservice-portal/documents/acknowledgments"
    )
  );
  const acknowledgeResponse = await postAcknowledgmentRoute(
    buildRequest(
      "/api/hr/employee-selfservice-portal/documents/acknowledgments",
      {
        body: JSON.stringify({
          acknowledgmentMethod: "portal",
          id: acknowledgmentObligationId,
          note: "Reviewed in ESS",
        }),
        method: "POST",
      }
    )
  );
  const auditTrailResponse = await getAuditTrailRoute(
    buildRequest("/api/hr/employee-selfservice-portal/audit-trail")
  );

  assert.equal(documentsResponse.status, 200);
  assert.equal(resourcesResponse.status, 200);
  assert.equal(acknowledgmentsResponse.status, 200);
  assert.equal(acknowledgeResponse.status, 200);
  assert.equal(auditTrailResponse.status, 200);

  const resources = (await resourcesResponse.json()) as Array<{
    category: string;
  }>;
  const auditEntries = (await auditTrailResponse.json()) as Array<{
    action: string;
  }>;

  assert.equal(
    resources.some((entry) => entry.category === "faq"),
    true
  );
  assert.equal(
    resources.some((entry) => entry.category === "handbook"),
    true
  );
  assert.equal(
    resources.some((entry) => entry.category === "form"),
    true
  );
  assert.equal(
    auditEntries.some(
      (entry) =>
        entry.action === "hr.employee-selfservice-portal.documents.view"
    ),
    true
  );
  assert.equal(
    auditEntries.some(
      (entry) =>
        entry.action === "hr.employee-selfservice-portal.resources.view"
    ),
    true
  );
  assert.equal(
    auditEntries.some(
      (entry) =>
        entry.action ===
        "hr.employee-selfservice-portal.documents.acknowledgments.view"
    ),
    true
  );
  assert.equal(
    auditEntries.some(
      (entry) =>
        entry.action ===
        "hr.employee-selfservice-portal.documents.acknowledgments.acknowledge"
    ),
    true
  );
});
