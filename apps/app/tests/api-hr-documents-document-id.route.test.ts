import { InternalError } from "@repo/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

const executionMocks = vi.hoisted(() => ({
  deleteDocumentForTenant: vi.fn(),
  getDocumentSummaryForTenant: vi.fn(),
  recordDocumentSensitiveReadForTenant: vi.fn(),
  updateDocumentForTenant: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../app/api/hr/documents/_execution.ts", () => executionMocks);

import { DELETE, GET, PATCH } from "../app/api/hr/documents/[documentId]/route.ts";

const documentId = "doc-11111111-1111-4111-8111-111111111111";

describe("/api/hr/documents/[documentId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads a document summary through the execution wrapper", async () => {
    executionMocks.getDocumentSummaryForTenant.mockResolvedValue({
      id: documentId,
      title: "Employment contract",
    });
    executionMocks.recordDocumentSensitiveReadForTenant.mockResolvedValue(
      undefined
    );

    const response = await GET(
      new Request(`http://localhost/api/hr/documents/${documentId}`),
      {
        params: Promise.resolve({ documentId }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.title).toBe("Employment contract");
    expect(executionMocks.getDocumentSummaryForTenant).toHaveBeenCalledWith(
      documentId
    );
    expect(
      executionMocks.recordDocumentSensitiveReadForTenant
    ).toHaveBeenCalledWith(documentId);
  });

  it("updates a document through the execution wrapper", async () => {
    executionMocks.updateDocumentForTenant.mockResolvedValue({
      id: documentId,
      title: "Updated contract",
    });

    const response = await PATCH(
      new Request(`http://localhost/api/hr/documents/${documentId}`, {
        body: JSON.stringify({
          employeeId: "employee-001",
          title: "Updated contract",
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({ documentId }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.title).toBe("Updated contract");
    expect(executionMocks.updateDocumentForTenant).toHaveBeenCalledWith(
      documentId,
      expect.objectContaining({
        employeeId: "employee-001",
        id: documentId,
        title: "Updated contract",
      })
    );
  });

  it("deletes a document through the execution wrapper", async () => {
    executionMocks.deleteDocumentForTenant.mockResolvedValue({
      id: documentId,
      status: "archived",
    });

    const response = await DELETE(
      new Request(`http://localhost/api/hr/documents/${documentId}`, {
        body: JSON.stringify({ reason: "Retention expired" }),
        headers: { "content-type": "application/json" },
        method: "DELETE",
      }),
      {
        params: Promise.resolve({ documentId }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe("archived");
    expect(executionMocks.deleteDocumentForTenant).toHaveBeenCalledWith(
      documentId,
      "Retention expired"
    );
  });

  it("returns validation errors for invalid update bodies", async () => {
    const response = await PATCH(
      new Request(`http://localhost/api/hr/documents/${documentId}`, {
        body: JSON.stringify({ employeeId: "" }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({ documentId }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBeTruthy();
    expect(executionMocks.updateDocumentForTenant).not.toHaveBeenCalled();
  });

  it("maps execution failures to API errors", async () => {
    executionMocks.updateDocumentForTenant.mockRejectedValue(
      new InternalError("Document update failed")
    );

    const response = await PATCH(
      new Request(`http://localhost/api/hr/documents/${documentId}`, {
        body: JSON.stringify({
          employeeId: "employee-001",
          title: "Updated contract",
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({ documentId }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toContain("Document update failed");
  });
});
