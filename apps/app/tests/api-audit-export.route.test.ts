import { ForbiddenError, UnauthorizedError } from "@repo/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const authMocks = vi.hoisted(() => ({
  requireActiveTenantAccess: vi.fn(),
}));

const auditMocks = vi.hoisted(() => ({
  exportAuditEvents: vi.fn(),
}));

const permissionMocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  resolvePermissionsForTenantRole: vi.fn(),
}));

vi.mock("@repo/auth/server", () => authMocks);
vi.mock("@repo/audit", () => auditMocks);
vi.mock("@repo/permissions", () => ({
  permissionCatalog: {
    audit: {
      read: "audit.read",
    },
  },
  requirePermission: permissionMocks.requirePermission,
  resolvePermissionsForTenantRole:
    permissionMocks.resolvePermissionsForTenantRole,
}));

import { GET } from "../app/api/audit/export/route.ts";

describe("/api/audit/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireActiveTenantAccess.mockResolvedValue({
      membership: {
        id: "membership-1",
        role: "admin",
        tenantId: "tenant-001",
        userId: "user-001",
      },
      user: {
        id: "user-001",
      },
    });
    permissionMocks.resolvePermissionsForTenantRole.mockReturnValue([
      "audit.read",
    ]);
    permissionMocks.requirePermission.mockImplementation(() => undefined);
  });

  it("returns csv export with content-disposition", async () => {
    auditMocks.exportAuditEvents.mockResolvedValue("id,action\n1,create");

    const response = await GET(
      new Request("http://localhost/api/audit/export?format=csv")
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="audit-events.csv"'
    );
    expect(body).toBe("id,action\n1,create");
    expect(auditMocks.exportAuditEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "csv",
        limit: 1000,
        offset: 0,
        tenantId: "tenant-001",
      })
    );
  });

  it("returns 401 when tenant access is required", async () => {
    authMocks.requireActiveTenantAccess.mockRejectedValue(
      new UnauthorizedError()
    );

    const response = await GET(
      new Request("http://localhost/api/audit/export?format=csv")
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBeTruthy();
    expect(auditMocks.exportAuditEvents).not.toHaveBeenCalled();
  });

  it("returns 403 when audit export is forbidden", async () => {
    permissionMocks.requirePermission.mockImplementation(() => {
      throw new ForbiddenError("Missing required permission");
    });

    const response = await GET(
      new Request("http://localhost/api/audit/export?format=csv")
    );

    expect(response.status).toBe(403);
    expect(auditMocks.exportAuditEvents).not.toHaveBeenCalled();
  });
});
