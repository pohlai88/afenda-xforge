import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { permissionCatalog } from "@repo/permissions";
import {
  installTestRuntimeTenantAccess,
  TEST_TENANT_ID,
  uninstallTestRuntimeTenantAccess,
} from "./_runtime-access-fixture.ts";

import {
  registerDocumentsManagementDocument,
  verifyDocumentsManagementDocument,
} from "@repo/features-employee-management-documents-management/server";
import {
  resetDocumentsManagementAuditWriterForTesting,
  restoreDocumentsManagementDatabaseAuditWriter,
} from "../../../packages/features/hr-suite/employee-management/documents-management/src/audit.ts";
import {
  resetDocumentsManagementRepositoryForTesting,
  setDocumentsManagementRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/documents-management/src/repository.testing.ts";
import {
  resetDocumentsManagementBlobClientForTesting,
  resetDocumentsManagementStorageProviderForTesting,
  setDocumentsManagementBlobClientForTesting,
  setDocumentsManagementStorageProviderForTesting,
} from "../app/api/hr/documents/_lib/storage.ts";
import { GET as downloadDocumentRoute } from "../app/api/hr/documents/[documentId]/download/route.ts";
import {
  DELETE as deleteDocumentRoute,
  GET as getDocumentRoute,
  PATCH as patchDocumentRoute,
} from "../app/api/hr/documents/[documentId]/route.ts";
import {
  GET as getAcknowledgmentsRoute,
  POST as postAcknowledgmentsRoute,
} from "../app/api/hr/documents/acknowledgments/route.ts";
import { GET as getExpiringRoute } from "../app/api/hr/documents/expiring/route.ts";
import {
  GET as getObligationsRoute,
  POST as postObligationsRoute,
} from "../app/api/hr/documents/obligations/route.ts";
import { GET as getReadinessRoute } from "../app/api/hr/documents/readiness/route.ts";
import {
  GET as getRetentionRoute,
  POST as postRetentionRoute,
} from "../app/api/hr/documents/retention/route.ts";
import {
  GET as getDocumentsRoute,
  POST as postDocumentsRoute,
} from "../app/api/hr/documents/route.ts";
import { POST as postDocumentUploadRoute } from "../app/api/hr/documents/upload/route.ts";

let sandboxDirectory: string;
let blobContents: Map<string, { contentType: string; payload: Uint8Array }>;

const buildRequest = (path: string): Request =>
  new Request(`http://localhost${path}`);

const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

beforeEach(() => {
  installTestRuntimeTenantAccess({ tenantId: TEST_TENANT_ID });
  sandboxDirectory = mkdtempSync(join(tmpdir(), "api-documents-routes-"));
  const repositoryPath = join(sandboxDirectory, "repository.json");
  blobContents = new Map();

  setDocumentsManagementStorageProviderForTesting("blob");
  resetDocumentsManagementAuditWriterForTesting();
  setDocumentsManagementRepositoryPathForTesting(repositoryPath);
  resetDocumentsManagementRepositoryForTesting();
  setDocumentsManagementBlobClientForTesting({
    download({ key }) {
      const storedBlob = blobContents.get(key);

      if (!storedBlob) {
        return Promise.resolve(null);
      }

      return Promise.resolve({
        blob: {
          cacheControl: "private, max-age=0",
          contentDisposition: `attachment; filename="${key.split("/").at(-1) ?? "document"}"`,
          contentType: storedBlob.contentType,
          downloadUrl: `https://blob.local/${key}?download=1`,
          etag: "test-etag",
          pathname: key,
          size: storedBlob.payload.byteLength,
          uploadedAt: new Date("2026-06-09T00:00:00.000Z"),
          url: `https://blob.local/${key}`,
        },
        headers: new Headers({
          "content-length": String(storedBlob.payload.byteLength),
          "content-type": storedBlob.contentType,
        }),
        statusCode: 200 as const,
        stream: new ReadableStream({
          start(controller) {
            controller.enqueue(storedBlob.payload);
            controller.close();
          },
        }),
      });
    },
    async upload({ body, contentType, key }) {
      const payload = new Uint8Array(await body.arrayBuffer());

      blobContents.set(key, {
        contentType: contentType ?? "application/octet-stream",
        payload,
      });

      return {
        contentType: contentType ?? "application/octet-stream",
        key,
        provider: "blob",
        size: payload.byteLength,
        url: `https://blob.local/${key}`,
      };
    },
    uploadToken({ body, onBeforeGenerateToken, onUploadCompleted }) {
      if (body.type === "blob.generate-client-token") {
        return onBeforeGenerateToken(
          body.payload.pathname,
          body.payload.clientPayload ?? null,
          body.payload.multipart
        ).then(() => ({
          clientToken: "test-client-token",
          type: "blob.generate-client-token",
        }));
      }

      return Promise.resolve(onUploadCompleted?.(body.payload)).then(() => ({
        response: "ok" as const,
        type: "blob.upload-completed" as const,
      }));
    },
  });
});

afterEach(() => {
  uninstallTestRuntimeTenantAccess();
  restoreDocumentsManagementDatabaseAuditWriter();
  resetDocumentsManagementBlobClientForTesting();
  resetDocumentsManagementStorageProviderForTesting();
  rmSync(sandboxDirectory, { recursive: true, force: true });
});

test("serves document list, detail, readiness, and expiring routes", async () => {
  const alphaDocument = await registerDocumentsManagementDocument(
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
  await registerDocumentsManagementDocument(
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
  const verifiedSeed = await registerDocumentsManagementDocument(
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
  await verifyDocumentsManagementDocument(
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
  await registerDocumentsManagementDocument(
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
  await registerDocumentsManagementDocument(
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
  await registerDocumentsManagementDocument(
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
  installTestRuntimeTenantAccess({
    role: "viewer",
    grantedPermissions: [],
  });

  const deniedListResponse = await getDocumentsRoute(
    buildRequest("/api/hr/documents")
  );
  const deniedDetailResponse = await getDocumentRoute(
    buildRequest("/api/hr/documents/example"),
    {
      params: Promise.resolve({ documentId: "example" }),
    }
  );
  const invalidQueryResponse = await getDocumentsRoute(
    buildRequest("/api/hr/documents?page=not-a-number")
  );

  assert.equal(deniedListResponse.status, 403);
  assert.equal(deniedDetailResponse.status, 403);
  assert.equal(invalidQueryResponse.status, 400);
  assert.deepEqual(await deniedListResponse.json(), {
    code: "forbidden",
    error: "Read access denied for documents management",
    ok: false,
  });
  assert.deepEqual(await deniedDetailResponse.json(), {
    code: "forbidden",
    error: "Read access denied for documents management",
    ok: false,
  });
  assert.deepEqual(await invalidQueryResponse.json(), {
    error: "Invalid query parameters",
    ok: false,
  });
});

test("enforces granular hrDocuments permissions from the permission catalog", async () => {
  installTestRuntimeTenantAccess({
    role: "member",
    grantedPermissions: [
      permissionCatalog.hrDocuments.read,
      permissionCatalog.hrDocuments.download,
    ],
  });

  const listResponse = await getDocumentsRoute(
    buildRequest("/api/hr/documents")
  );

  const formData = new FormData();
  formData.set(
    "file",
    new File(["read-only-binary"], "read-only.pdf", {
      type: "application/pdf",
    })
  );
  formData.set("documentCategory", "identity");
  formData.set("documentType", "passport");
  formData.set("employeeId", "employee-read-only");
  formData.set("mandatory", "true");
  formData.set("title", "Read Only Upload Attempt");

  const deniedWriteResponse = await postDocumentsRoute(
    new Request("http://localhost/api/hr/documents", {
      body: formData,
      method: "POST",
    })
  );

  assert.equal(listResponse.status, 200);
  assert.equal(deniedWriteResponse.status, 403);
  assert.deepEqual(await deniedWriteResponse.json(), {
    code: "forbidden",
    error: "Write access denied for documents management",
    ok: false,
  });
});

test("uploads a document through the API and downloads the stored binary", async () => {
  const formData = new FormData();
  formData.set(
    "file",
    new File(["passport-binary"], "passport.pdf", {
      type: "application/pdf",
    })
  );
  formData.set("documentCategory", "identity");
  formData.set("documentType", "passport");
  formData.set("employeeId", "employee-upload");
  formData.set("mandatory", "true");
  formData.set("title", "Passport Upload");

  const uploadResponse = await postDocumentsRoute(
    new Request("http://localhost/api/hr/documents", {
      body: formData,
      method: "POST",
    })
  );

  assert.equal(uploadResponse.status, 201);

  const createdDocument = (await uploadResponse.json()) as {
    id: string;
    reference: {
      contentType?: string | null;
      fileName?: string | null;
      sizeBytes?: number | null;
      storagePath?: string | null;
    };
  };

  assert.equal(createdDocument.reference.contentType, "application/pdf");
  assert.equal(createdDocument.reference.fileName, "passport.pdf");
  assert.equal(createdDocument.reference.sizeBytes, 15);
  assert.equal(typeof createdDocument.reference.storagePath, "string");

  const downloadResponse = await downloadDocumentRoute(
    buildRequest(`/api/hr/documents/${createdDocument.id}/download`),
    {
      params: Promise.resolve({ documentId: createdDocument.id }),
    }
  );

  assert.equal(downloadResponse.status, 200);
  assert.equal(downloadResponse.headers.get("content-type"), "application/pdf");
  assert.match(
    downloadResponse.headers.get("content-disposition") ?? "",
    /attachment;\sfilename="passport\.pdf"/
  );
  assert.equal(await downloadResponse.text(), "passport-binary");
});

test("issues a blob client upload token for direct browser uploads", async () => {
  const tokenResponse = await postDocumentUploadRoute(
    new Request("http://localhost/api/hr/documents/upload", {
      body: JSON.stringify({
        payload: {
          clientPayload: JSON.stringify({
            documentCategory: "identity",
            documentType: "passport",
            employeeId: "employee-upload",
            fileName: "passport.pdf",
            sizeBytes: 15,
            title: "Passport Upload",
          }),
          multipart: false,
          pathname: "hr/documents/tenant-a/employee-upload/passport.pdf",
        },
        type: "blob.generate-client-token",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
  );

  assert.equal(tokenResponse.status, 200);
  assert.deepEqual(await tokenResponse.json(), {
    clientToken: "test-client-token",
    type: "blob.generate-client-token",
  });
});

test("acknowledges blob upload completion without duplicating registration", async () => {
  const storagePath = "hr/documents/tenant-a/employee-callback/passport.pdf";
  blobContents.set(storagePath, {
    contentType: "application/pdf",
    payload: new TextEncoder().encode("passport-binary"),
  });

  const completionResponse = await postDocumentUploadRoute(
    new Request("http://localhost/api/hr/documents/upload", {
      body: JSON.stringify({
        payload: {
          blob: {
            contentType: "application/pdf",
            pathname: storagePath,
          },
          tokenPayload: JSON.stringify({
            context: {
              actorId: "actor-a",
              canRead: true,
              canViewSensitive: false,
              canWrite: true,
              companyId: "company-a",
              requestId: "request-a",
              tenantId: "tenant-a",
            },
            document: {
              documentCategory: "identity",
              documentType: "passport",
              employeeId: "employee-callback",
              fileName: "passport.pdf",
              sizeBytes: 15,
              title: "Passport Callback Upload",
            },
          }),
        },
        type: "blob.upload-completed",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
  );

  assert.equal(completionResponse.status, 200);
  assert.deepEqual(await completionResponse.json(), {
    response: "ok",
    type: "blob.upload-completed",
  });

  const listResponse = await getDocumentsRoute(
    buildRequest("/api/hr/documents?employeeId=employee-callback")
  );

  assert.equal(listResponse.status, 200);

  const documents = (await listResponse.json()) as Array<{ title: string }>;

  assert.equal(documents.length, 0);
});

test("registers a document from a pre-uploaded storage reference", async () => {
  const storagePath = "hr/documents/tenant-a/employee-direct/passport.pdf";
  blobContents.set(storagePath, {
    contentType: "application/pdf",
    payload: new TextEncoder().encode("passport-binary"),
  });

  const formData = new FormData();
  formData.set("contentType", "application/pdf");
  formData.set("documentCategory", "identity");
  formData.set("documentType", "passport");
  formData.set("employeeId", "employee-direct");
  formData.set("fileName", "passport.pdf");
  formData.set("sizeBytes", "15");
  formData.set("storagePath", storagePath);
  formData.set("title", "Passport Direct Upload");

  const uploadResponse = await postDocumentsRoute(
    new Request("http://localhost/api/hr/documents", {
      body: formData,
      method: "POST",
    })
  );

  assert.equal(uploadResponse.status, 201);

  const createdDocument = (await uploadResponse.json()) as {
    id: string;
    reference: {
      contentType?: string | null;
      fileName?: string | null;
      sizeBytes?: number | null;
      storagePath?: string | null;
    };
  };

  assert.equal(createdDocument.reference.contentType, "application/pdf");
  assert.equal(createdDocument.reference.fileName, "passport.pdf");
  assert.equal(createdDocument.reference.sizeBytes, 15);
  assert.equal(createdDocument.reference.storagePath, storagePath);

  const downloadResponse = await downloadDocumentRoute(
    buildRequest(`/api/hr/documents/${createdDocument.id}/download`),
    {
      params: Promise.resolve({ documentId: createdDocument.id }),
    }
  );

  assert.equal(downloadResponse.status, 200);
  assert.equal(downloadResponse.headers.get("content-type"), "application/pdf");
  assert.match(
    downloadResponse.headers.get("content-disposition") ?? "",
    /attachment;\sfilename="passport\.pdf"/
  );
  assert.equal(await downloadResponse.text(), "passport-binary");
});

test("surfaces blob storage failures as service-unavailable responses", async () => {
  setDocumentsManagementBlobClientForTesting({
    download() {
      return Promise.reject(new Error("blob unavailable"));
    },
    upload() {
      return Promise.reject(new Error("blob unavailable"));
    },
    uploadToken() {
      return Promise.reject(new Error("blob unavailable"));
    },
  });

  const formData = new FormData();
  formData.set(
    "file",
    new File(["passport-binary"], "passport.pdf", {
      type: "application/pdf",
    })
  );
  formData.set("documentCategory", "identity");
  formData.set("documentType", "passport");
  formData.set("employeeId", "employee-upload");
  formData.set("title", "Passport Upload");

  const uploadResponse = await postDocumentsRoute(
    new Request("http://localhost/api/hr/documents", {
      body: formData,
      method: "POST",
    })
  );

  assert.equal(uploadResponse.status, 503);
  assert.deepEqual(await uploadResponse.json(), {
    error: "Document storage is unavailable",
    ok: false,
  });

  const registeredDocument = await registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "passport",
      employeeId: "employee-download",
      reference: {
        contentType: "application/pdf",
        fileName: "passport.pdf",
        sizeBytes: 15,
        storagePath: "hr/documents/tenant-a/employee-download/passport.pdf",
      },
      title: "Passport Download",
    },
    {
      canRead: true,
      canWrite: true,
      companyId: "company-a",
      tenantId: "tenant-a",
    }
  );

  const downloadResponse = await downloadDocumentRoute(
    buildRequest(`/api/hr/documents/${registeredDocument.id}/download`),
    {
      params: Promise.resolve({ documentId: registeredDocument.id }),
    }
  );

  assert.equal(downloadResponse.status, 503);
  assert.deepEqual(await downloadResponse.json(), {
    error: "Document storage is unavailable",
    ok: false,
  });
});

test("updates and deletes documents through document detail routes", async () => {
  const registeredDocument = await registerDocumentsManagementDocument(
    {
      documentCategory: "identity",
      documentType: "passport",
      employeeId: "employee-mutation",
      title: "Original Title",
    },
    {
      canRead: true,
      canWrite: true,
      companyId: "company-a",
      tenantId: "tenant-a",
    }
  );

  const patchResponse = await patchDocumentRoute(
    new Request(`http://localhost/api/hr/documents/${registeredDocument.id}`, {
      body: JSON.stringify({
        description: "Updated description",
        title: "Updated Title",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
    }),
    {
      params: Promise.resolve({ documentId: registeredDocument.id }),
    }
  );

  assert.equal(patchResponse.status, 200);
  const patchedDocument = (await patchResponse.json()) as { title?: string };
  assert.equal(patchedDocument.title, "Updated Title");

  const deleteResponse = await deleteDocumentRoute(
    new Request(`http://localhost/api/hr/documents/${registeredDocument.id}`, {
      body: JSON.stringify({ reason: "Test cleanup" }),
      headers: {
        "content-type": "application/json",
      },
      method: "DELETE",
    }),
    {
      params: Promise.resolve({ documentId: registeredDocument.id }),
    }
  );

  assert.equal(deleteResponse.status, 200);
  const deletedDocument = (await deleteResponse.json()) as { status?: string };
  assert.equal(deletedDocument.status, "archived");

  const getResponse = await getDocumentRoute(
    buildRequest(`/api/hr/documents/${registeredDocument.id}`),
    {
      params: Promise.resolve({ documentId: registeredDocument.id }),
    }
  );

  assert.equal(getResponse.status, 200);
  const archivedSummary = (await getResponse.json()) as { status?: string };
  assert.equal(archivedSummary.status, "archived");
});

test("blocks denied reads on acknowledgments, obligations, and retention routes", async () => {
  installTestRuntimeTenantAccess({
    role: "viewer",
    grantedPermissions: [],
  });

  const deniedAcknowledgmentsResponse = await getAcknowledgmentsRoute(
    buildRequest("/api/hr/documents/acknowledgments")
  );
  const deniedObligationsResponse = await getObligationsRoute(
    buildRequest("/api/hr/documents/obligations")
  );
  const deniedRetentionResponse = await getRetentionRoute(
    buildRequest("/api/hr/documents/retention")
  );

  assert.equal(deniedAcknowledgmentsResponse.status, 403);
  assert.equal(deniedObligationsResponse.status, 403);
  assert.equal(deniedRetentionResponse.status, 403);

  assert.deepEqual(await deniedAcknowledgmentsResponse.json(), {
    code: "forbidden",
    error: "Read access denied for documents management",
    ok: false,
  });
});

test("blocks denied writes on acknowledgments, obligations, and retention routes", async () => {
  installTestRuntimeTenantAccess({
    role: "member",
    grantedPermissions: [
      permissionCatalog.hrDocuments.read,
      permissionCatalog.hrDocuments.download,
    ],
  });

  const deniedAcknowledgmentWriteResponse = await postAcknowledgmentsRoute(
    new Request("http://localhost/api/hr/documents/acknowledgments", {
      body: JSON.stringify({
        documentType: "employee_handbook_acknowledgment",
        employeeId: "employee-read-only",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
  );
  const deniedObligationWriteResponse = await postObligationsRoute(
    new Request("http://localhost/api/hr/documents/obligations", {
      body: JSON.stringify({
        documentType: "passport",
        employeeId: "employee-read-only",
        mandatory: true,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
  );
  const deniedRetentionWriteResponse = await postRetentionRoute(
    new Request("http://localhost/api/hr/documents/retention", {
      body: JSON.stringify({
        action: "archive",
        documentIds: ["document-read-only"],
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
  );

  assert.equal(deniedAcknowledgmentWriteResponse.status, 403);
  assert.equal(deniedObligationWriteResponse.status, 403);
  assert.equal(deniedRetentionWriteResponse.status, 403);

  assert.deepEqual(await deniedAcknowledgmentWriteResponse.json(), {
    code: "forbidden",
    error: "Write access denied for documents management",
    ok: false,
  });
  assert.deepEqual(await deniedRetentionWriteResponse.json(), {
    error: "Retention execution access denied",
    ok: false,
  });
});
