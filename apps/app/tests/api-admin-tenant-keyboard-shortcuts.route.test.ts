import { ForbiddenError } from "@repo/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  requireSystemAdminScope: vi.fn(),
}));

const permissionMocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
}));

const repositoryMocks = vi.hoisted(() => ({
  readTenantKeyboardShortcutPolicy: vi.fn(),
}));

const executionMocks = vi.hoisted(() => ({
  executeTenantKeyboardShortcutPolicyUpdate: vi.fn(),
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
vi.mock("../lib/workspace-shortcuts/execution.server.ts", () => executionMocks);
vi.mock("../lib/workspace-shortcuts/repository.server", () => ({
  readTenantKeyboardShortcutPolicy:
    repositoryMocks.readTenantKeyboardShortcutPolicy,
}));

import { GET, POST } from "../app/api/admin/tenant/keyboard-shortcuts/route.ts";
import { resolveProductDefaults } from "../lib/workspace-shortcuts/resolve-shortcuts.ts";

describe("/api/admin/tenant/keyboard-shortcuts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireSystemAdminScope.mockResolvedValue({
      companyId: undefined,
      grantedPermissions: [
        "system-admin.tenant-settings.read",
        "system-admin.tenant-settings.write",
      ],
      operationId: "op-001",
      requestId: "req-001",
      tenantId: "tenant-001",
      userId: "user-001",
    });
    permissionMocks.requirePermission.mockImplementation(() => undefined);
  });

  it("returns tenant policy payload for authorized admins", async () => {
    const payload = {
      policy: {
        allowUserCustomize: true,
        allowFnKeyBindings: true,
        lockedActions: [],
        overrides: {},
      },
      preview: resolveProductDefaults(),
    };
    repositoryMocks.readTenantKeyboardShortcutPolicy.mockResolvedValue(payload);

    const response = await GET(
      new Request("http://localhost/api/admin/tenant/keyboard-shortcuts")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(payload);
  });

  it("returns 403 when tenant settings read is forbidden", async () => {
    permissionMocks.requirePermission.mockImplementation(() => {
      throw new ForbiddenError(
        "Missing required permission(s) for tenant settings read"
      );
    });

    const response = await GET(
      new Request("http://localhost/api/admin/tenant/keyboard-shortcuts")
    );

    expect(response.status).toBe(403);
  });

  it("rejects unknown fields in POST body", async () => {
    const response = await POST(
      new Request("http://localhost/api/admin/tenant/keyboard-shortcuts", {
        body: JSON.stringify({ allowUserCustomize: true, extra: true }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(400);
  });

  it("persists tenant keyboard shortcut policy through the execution pipeline", async () => {
    const saved = {
      policy: {
        allowUserCustomize: true,
        allowFnKeyBindings: false,
        lockedActions: ["crud.delete"],
        overrides: { "crud.save": "f6" },
      },
      preview: resolveProductDefaults(),
    };
    executionMocks.executeTenantKeyboardShortcutPolicyUpdate.mockResolvedValue(
      saved
    );

    const response = await POST(
      new Request("http://localhost/api/admin/tenant/keyboard-shortcuts", {
        body: JSON.stringify({
          allowUserCustomize: true,
          allowFnKeyBindings: false,
          lockedActions: ["crud.delete"],
          overrides: { "crud.save": "f6" },
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(saved);
    expect(
      executionMocks.executeTenantKeyboardShortcutPolicyUpdate
    ).toHaveBeenCalledWith(
      {
        allowUserCustomize: true,
        allowFnKeyBindings: false,
        lockedActions: ["crud.delete"],
        overrides: { "crud.save": "f6" },
      },
      {
        companyId: undefined,
        grantedPermissions: [
          "system-admin.tenant-settings.read",
          "system-admin.tenant-settings.write",
        ],
        operationId: "op-001",
        requestId: "req-001",
        tenantId: "tenant-001",
        userId: "user-001",
      }
    );
  });
});
