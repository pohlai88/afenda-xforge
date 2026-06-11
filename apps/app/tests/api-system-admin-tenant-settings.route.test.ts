import { ForbiddenError, UnauthorizedError } from "@repo/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  requireSystemAdminScope: vi.fn(),
}));

const permissionMocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
}));

const serverMocks = vi.hoisted(() => ({
  readTenantAdminSettingsForTenant: vi.fn(),
  updateTenantAdminSetting: vi.fn(),
}));

vi.mock("../app/api/system-admin/_lib/context.ts", () => authMocks);
vi.mock("@repo/permissions", () => ({
  permissionCatalog: {
    systemAdmin: {
      tenantSettingsRead: "system-admin.tenant-settings.read",
      tenantSettingsWrite: "system-admin.tenant-settings.write",
    },
  },
  requirePermission: permissionMocks.requirePermission,
}));
vi.mock("@repo/features-system-admin-control-plane/server", () => serverMocks);

import { GET, POST } from "../app/api/system-admin/tenant-settings/route.ts";

const tenantSettingsPayload = {
  branding: { themePreset: "xforge" },
  customizationMode: null,
  defaultLocale: "en",
  defaultTimezone: "UTC",
  displayName: "Acme",
  tenantId: "00000000-0000-4000-8000-000000000001",
};

describe("/api/system-admin/tenant-settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireSystemAdminScope.mockResolvedValue({
      companyId: undefined,
      grantedPermissions: ["system-admin.tenant-settings.read"],
      requestId: undefined,
      tenantId: tenantSettingsPayload.tenantId,
      userId: "user-001",
    });
    permissionMocks.requirePermission.mockImplementation(() => undefined);
  });

  it("returns tenant settings for authorized admins", async () => {
    serverMocks.readTenantAdminSettingsForTenant.mockResolvedValue(
      tenantSettingsPayload
    );

    const response = await GET(
      new Request("http://localhost/api/system-admin/tenant-settings")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(tenantSettingsPayload);
    expect(serverMocks.readTenantAdminSettingsForTenant).toHaveBeenCalledWith(
      tenantSettingsPayload.tenantId
    );
  });

  it("returns 403 when tenant settings read is forbidden", async () => {
    serverMocks.readTenantAdminSettingsForTenant.mockResolvedValue(
      tenantSettingsPayload
    );
    permissionMocks.requirePermission.mockImplementation(() => {
      throw new ForbiddenError("Missing required permission");
    });

    const response = await GET(
      new Request("http://localhost/api/system-admin/tenant-settings")
    );

    expect(response.status).toBe(403);
  });

  it("returns 401 when system admin scope is unauthorized", async () => {
    authMocks.requireSystemAdminScope.mockRejectedValue(
      new UnauthorizedError()
    );

    const response = await GET(
      new Request("http://localhost/api/system-admin/tenant-settings")
    );

    expect(response.status).toBe(401);
    expect(serverMocks.readTenantAdminSettingsForTenant).not.toHaveBeenCalled();
  });

  it("returns 500 when settings read fails unexpectedly", async () => {
    serverMocks.readTenantAdminSettingsForTenant.mockRejectedValue(
      new Error("database unavailable")
    );

    const response = await GET(
      new Request("http://localhost/api/system-admin/tenant-settings")
    );

    expect(response.status).toBe(500);
  });

  it("rejects invalid update payloads with 400", async () => {
    const response = await POST(
      new Request("http://localhost/api/system-admin/tenant-settings", {
        body: JSON.stringify({ key: "display-name" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Validation failed");
    expect(serverMocks.updateTenantAdminSetting).not.toHaveBeenCalled();
  });

  it("accepts tenant setting updates with 202", async () => {
    const result = {
      action: "update-tenant-setting",
      id: "mutation-1",
      status: "accepted" as const,
      summary: "Updated display name",
      tenantId: tenantSettingsPayload.tenantId,
    };
    serverMocks.updateTenantAdminSetting.mockResolvedValue(result);

    const response = await POST(
      new Request("http://localhost/api/system-admin/tenant-settings", {
        body: JSON.stringify({
          key: "display-name",
          reason: "Rebrand",
          value: "New Name",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body).toEqual(result);
  });
});
