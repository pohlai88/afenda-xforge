import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";

import {
  registerDocumentsManagementDocument,
  verifyDocumentsManagementDocument,
} from "@repo/features-employee-management-documents-management/server";
import {
  resetDocumentsManagementRepositoryForTesting,
  setDocumentsManagementRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/documents-management/src/repository.ts";
import { GET as getDocumentRoute } from "../app/api/hr/documents/[documentId]/route.ts";
import { GET as getExpiringRoute } from "../app/api/hr/documents/expiring/route.ts";
import { GET as getReadinessRoute } from "../app/api/hr/documents/readiness/route.ts";
import { GET as getDocumentsRoute } from "../app/api/hr/documents/route.ts";

let sandboxDirectory: string;

const baseHeaders = {
  "x-can-read-documents": "true",
  "x-company-id": "company-a",
  "x-tenant-id": "tenant-a",
};

const deniedHeaders = {
  "x-can-read-documents": "false",
  "x-company-id": "company-a",
  "x-tenant-id": "tenant-a",
};

const buildRequest = (
  path: string,
  headers: Record<string, string> = baseHeaders
): Request => new Request(`http://localhost${path}`, { headers });

const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

beforeEach(() => {
  sandboxDirectory = mkdtempSync(join(tmpdir(), "api-documents-routes-"));
  const repositoryPath = join(sandboxDirectory, "repository.json");

  setDocumentsManagementRepositoryPathForTesting(repositoryPath);
  resetDocumentsManagementRepositoryForTesting();
});

afterEach(() => {
  rmSync(sandboxDirectory, { recursive: true, force: true });
});

test("serves document list, detail, readiness, and expiring routes", async () => {
  const alphaDocument = registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "passport",
      employeeId: "employee-1",
      title: "Alpha Passport",
    },
    {
      canRead: true,
      canWrite: true,
      companyId: "company-a",
      tenantId: "tenant-a",
    }
  );
  registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "nric",
      employeeId: "employee-1",
      title: "Beta Identity",
    },
    {
      canRead: true,
      canWrite: true,
      companyId: "company-a",
      tenantId: "tenant-a",
    }
  );
  const verifiedSeed = registerDocumentsManagementDocument(
    {
      documentCategory: "policy",
      documentType: "employee_handbook_acknowledgment",
      employeeId: "employee-2",
      mandatory: true,
      title: "Employee Handbook",
    },
    {
      canRead: true,
      canWrite: true,
      companyId: "company-a",
      tenantId: "tenant-a",
    }
  );
  verifyDocumentsManagementDocument(
    {
      id: verifiedSeed.id,
      verifiedAt: new Date("2026-06-09T00:00:00.000Z"),
    },
    {
      canRead: true,
      canWrite: true,
      companyId: "company-a",
      tenantId: "tenant-a",
    }
  );
  registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "passport",
      employeeId: "employee-3",
      expiresAt: daysFromNow(6),
      title: "Expiring Soon",
    },
    {
      canRead: true,
      canWrite: true,
      companyId: "company-a",
      tenantId: "tenant-a",
    }
  );
  registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "passport",
      employeeId: "employee-3",
      expiresAt: daysFromNow(42),
      title: "Not Yet Expiring",
    },
    {
      canRead: true,
      canWrite: true,
      companyId: "company-a",
      tenantId: "tenant-a",
    }
  );
  registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "passport",
      employeeId: "employee-3",
      expiresAt: daysFromNow(-3),
      title: "Already Expired",
    },
    {
      canRead: true,
      canWrite: true,
      companyId: "company-a",
      tenantId: "tenant-a",
    }
  );

  const listResponse = await getDocumentsRoute(
    buildRequest("/api/hr/documents?employeeId=employee-1&pageSize=1&page=2")
  );
  const detailResponse = await getDocumentRoute(
    buildRequest(`/api/hr/documents/${alphaDocument.id}`),
    {
      params: Promise.resolve({ documentId: alphaDocument.id }),
    }
  );
  const readinessResponse = await getReadinessRoute(
    buildRequest("/api/hr/documents/readiness?employeeId=employee-2")
  );
  const expiringResponse = await getExpiringRoute(
    buildRequest("/api/hr/documents/expiring?employeeId=employee-3")
  );

  assert.equal(listResponse.status, 200);
  assert.equal(detailResponse.status, 200);
  assert.equal(readinessResponse.status, 200);
  assert.equal(expiringResponse.status, 200);

  const listPayload = (await listResponse.json()) as Array<{ title: string }>;
  const detailPayload = (await detailResponse.json()) as { id: string };
  const readinessPayload = (await readinessResponse.json()) as Array<{
    employeeId: string;
    ready: boolean;
  }>;
  const expiringPayload = (await expiringResponse.json()) as Array<{
    isExpired: boolean;
    isExpiringSoon: boolean;
    title: string;
  }>;

  assert.equal(listPayload.length, 1);
  assert.equal(listPayload[0]?.title, "Beta Identity");
  assert.equal(detailPayload.id, alphaDocument.id);
  assert.equal(readinessPayload.length, 1);
  assert.equal(readinessPayload[0]?.employeeId, "employee-2");
  assert.equal(readinessPayload[0]?.ready, true);
  assert.equal(expiringPayload.length, 2);
  assert.equal(expiringPayload[0]?.title, "Already Expired");
  assert.equal(expiringPayload[0]?.isExpired, true);
  assert.equal(expiringPayload[1]?.title, "Expiring Soon");
  assert.equal(expiringPayload[1]?.isExpiringSoon, true);
});

test("fails closed for invalid queries and denied reads", async () => {
  const deniedListResponse = await getDocumentsRoute(
    buildRequest("/api/hr/documents", deniedHeaders)
  );
  const deniedDetailResponse = await getDocumentRoute(
    buildRequest("/api/hr/documents/example", deniedHeaders),
    {
      params: Promise.resolve({ documentId: "example" }),
    }
  );
  const invalidQueryResponse = await getDocumentsRoute(
    buildRequest("/api/hr/documents?page=not-a-number")
  );

  assert.equal(deniedListResponse.status, 200);
  assert.equal(deniedDetailResponse.status, 404);
  assert.equal(invalidQueryResponse.status, 400);
  assert.deepEqual(await deniedListResponse.json(), []);
  assert.deepEqual(await deniedDetailResponse.json(), {
    error: "Document not found",
    ok: false,
  });
  assert.deepEqual(await invalidQueryResponse.json(), {
    error: "Invalid query parameters",
    ok: false,
  });
});
