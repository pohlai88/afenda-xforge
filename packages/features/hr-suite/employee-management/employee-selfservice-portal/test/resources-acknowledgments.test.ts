import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import {
  resetDocumentsManagementRepositoryForTesting,
  setDocumentsManagementRepositoryPathForTesting,
} from "../../documents-management/src/repository.testing.ts";
import {
  upsertDocumentsManagementRepositoryDocument,
  upsertDocumentsManagementRepositoryDocumentObligation,
} from "../../documents-management/src/repository.ts";
import {
  documentsManagementDocumentObligationSchema,
  documentsManagementDocumentSchema,
} from "../../documents-management/src/schema.ts";
import { createEmployeeSelfservicePortalRecord } from "../src/actions.ts";
import {
  resetEmployeeSelfservicePortalRepositoryForTesting,
  setEmployeeSelfservicePortalRepositoryPathForTesting,
} from "../src/repository.ts";
import { listEmployeeSelfservicePortalResources } from "../src/server.ts";

let portalRepositoryPath = "";
let documentsRepositoryPath = "";

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
  documentType:
    | "code_of_conduct_acknowledgment"
    | "employee_handbook_acknowledgment"
    | "tax_form";
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

const seedAcknowledgmentObligation = () =>
  upsertDocumentsManagementRepositoryDocumentObligation(
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

beforeEach(() => {
  portalRepositoryPath = resolve(
    tmpdir(),
    `afenda-employee-selfservice-resources-portal-${randomUUID()}.json`
  );
  documentsRepositoryPath = resolve(
    tmpdir(),
    `afenda-employee-selfservice-resources-documents-${randomUUID()}.json`
  );

  setEmployeeSelfservicePortalRepositoryPathForTesting(portalRepositoryPath);
  resetEmployeeSelfservicePortalRepositoryForTesting();
  setDocumentsManagementRepositoryPathForTesting(documentsRepositoryPath);
  resetDocumentsManagementRepositoryForTesting();
});

afterEach(() => {
  rmSync(portalRepositoryPath, { force: true });
  rmSync(documentsRepositoryPath, { force: true });
});

test("lists self-service policies, handbook resources, forms, and FAQs for the actor scope", () => {
  createEmployeeSelfservicePortalRecord(
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
    documentCategory: "policy",
    documentType: "code_of_conduct_acknowledgment",
    employeeId: "employee-1",
    id: "document-code-of-conduct",
    mandatory: true,
    title: "Code of Conduct",
  });
  seedDocument({
    documentCategory: "other",
    documentType: "tax_form",
    employeeId: "employee-1",
    id: "document-tax-form",
    mandatory: false,
    title: "Tax Declaration Form",
  });
  seedAcknowledgmentObligation();

  const resources = listEmployeeSelfservicePortalResources(
    {},
    {
      actorEmployeeId: "employee-1",
      canRead: true,
      companyId: "company-a",
      tenantId: "tenant-a",
      userId: "employee-user",
    }
  );

  assert.equal(
    resources.some((resource) => resource.category === "handbook"),
    true
  );
  assert.equal(
    resources.some((resource) => resource.category === "policy"),
    true
  );
  assert.equal(
    resources.some((resource) => resource.category === "form"),
    true
  );
  assert.equal(
    resources.some((resource) => resource.category === "faq"),
    true
  );
  assert.equal(
    resources.some(
      (resource) =>
        resource.category !== "faq" && resource.employeeId !== "employee-1"
    ),
    false
  );
});

test("filters resources by category and search term within the actor scope", () => {
  createEmployeeSelfservicePortalRecord(
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
    documentCategory: "other",
    documentType: "tax_form",
    employeeId: "employee-1",
    id: "document-tax-form",
    mandatory: false,
    title: "Tax Declaration Form",
  });

  const formResources = listEmployeeSelfservicePortalResources(
    {
      category: "form",
      search: "tax",
    },
    {
      actorEmployeeId: "employee-1",
      canRead: true,
      companyId: "company-a",
      tenantId: "tenant-a",
      userId: "employee-user",
    }
  );

  assert.equal(formResources.length, 1);
  assert.equal(formResources[0]?.title, "Tax Declaration Form");
});
