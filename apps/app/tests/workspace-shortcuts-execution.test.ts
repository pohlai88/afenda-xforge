import { ForbiddenError } from "@repo/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auditMocks = vi.hoisted(() => ({
  writeAuditEvent: vi.fn().mockResolvedValue({ id: "audit-1" }),
  writeAuditEventInTransaction: vi.fn().mockResolvedValue({ id: "audit-1" }),
}));

const repositoryMocks = vi.hoisted(() => ({
  readTenantKeyboardShortcutPolicy: vi.fn(),
  readWorkspaceShortcuts: vi.fn(),
  upsertTenantKeyboardShortcutPolicy: vi.fn(),
  upsertUserShortcutOverrides: vi.fn(),
}));

const permissionMocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  requireActiveTenantAccess: vi.fn(),
  requireActiveTenantMembership: vi.fn(),
}));

const transactionMocks = vi.hoisted(() => ({
  transaction: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@repo/audit", () => auditMocks);
vi.mock("@repo/permissions", () => ({
  permissionCatalog: {
    systemAdmin: {
      tenantSettingsWrite: "system-admin.tenant-settings.write",
    },
  },
  requirePermission: permissionMocks.requirePermission,
  resolvePermissionsForTenantRole: () => ["system-admin.tenant-settings.write"],
}));
vi.mock("@repo/database", () => ({
  database: {
    transaction: transactionMocks.transaction,
  },
}));
vi.mock(
  "../../../packages/features/workspace/keyboard-shortcuts/src/repository.server.ts",
  () => repositoryMocks
);

import { bindKeyboardShortcutsAuth } from "../../../packages/features/workspace/keyboard-shortcuts/src/auth-bindings.server.ts";
import {
  executeTenantKeyboardShortcutPolicyUpdate,
  executeUserShortcutOverridesUpdate,
} from "../../../packages/features/workspace/keyboard-shortcuts/src/execution.server.ts";
import { resolveProductDefaults } from "../lib/workspace-shortcuts/resolve-shortcuts.ts";

describe("workspace shortcut execution pipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bindKeyboardShortcutsAuth({
      requireActiveTenantAccess: authMocks.requireActiveTenantAccess,
      requireActiveTenantMembership: authMocks.requireActiveTenantMembership,
    });
    authMocks.requireActiveTenantMembership.mockResolvedValue({
      id: "membership-1",
      role: "admin",
      tenantId: "tenant-001",
      userId: "user-001",
    });
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
    permissionMocks.requirePermission.mockImplementation(() => undefined);
    transactionMocks.transaction.mockImplementation(
      async (run: (db: { id: string }) => Promise<unknown>) =>
        run({ id: "tx-1" })
    );
  });

  it("writes audit events when user overrides are updated", async () => {
    const current = {
      ...resolveProductDefaults(),
      policy: {
        ...resolveProductDefaults().policy,
        allowUserCustomize: true,
      },
    };
    const saved = resolveProductDefaults();

    repositoryMocks.readWorkspaceShortcuts.mockResolvedValue(current);
    repositoryMocks.upsertUserShortcutOverrides.mockResolvedValue(saved);

    const result = await executeUserShortcutOverridesUpdate(
      { overrides: { "crud.edit": "f6" } },
      {
        requestId: "req-user-1",
      }
    );

    expect(result).toEqual(saved);
    expect(authMocks.requireActiveTenantMembership).toHaveBeenCalled();
    expect(repositoryMocks.upsertUserShortcutOverrides).toHaveBeenCalledWith(
      "tenant-001",
      "user-001",
      { "crud.edit": "f6" },
      { id: "tx-1" }
    );
    expect(auditMocks.writeAuditEventInTransaction).toHaveBeenCalledWith(
      { id: "tx-1" },
      expect.objectContaining({
        action: "workspace.keyboard-shortcuts.user.update",
        actorId: "user-001",
        targetId: "user-001",
        targetType: "user-workspace-preferences",
      })
    );
  });

  it("rejects user override updates when customization is disabled", async () => {
    repositoryMocks.readWorkspaceShortcuts.mockResolvedValue(
      resolveProductDefaults()
    );

    await expect(
      executeUserShortcutOverridesUpdate(
        { overrides: { "crud.edit": "f6" } },
        {}
      )
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects reserved browser shortcuts during user override updates", async () => {
    const current = {
      ...resolveProductDefaults(),
      policy: {
        ...resolveProductDefaults().policy,
        allowUserCustomize: true,
      },
    };

    repositoryMocks.readWorkspaceShortcuts.mockResolvedValue(current);

    await expect(
      executeUserShortcutOverridesUpdate(
        { overrides: { "crud.save": "f5" } },
        {}
      )
    ).rejects.toMatchObject({
      message: expect.stringContaining("reserved"),
      statusCode: 422,
    });
  });

  it("writes audit events when tenant policy is updated", async () => {
    const before = {
      policy: {
        allowUserCustomize: true,
        allowFnKeyBindings: true,
        lockedActions: [],
        overrides: {},
      },
      preview: resolveProductDefaults(),
    };
    const saved = {
      policy: {
        allowUserCustomize: false,
        allowFnKeyBindings: false,
        lockedActions: ["crud.delete"],
        overrides: {},
      },
      preview: resolveProductDefaults(),
    };

    repositoryMocks.readTenantKeyboardShortcutPolicy.mockResolvedValue(before);
    repositoryMocks.upsertTenantKeyboardShortcutPolicy.mockResolvedValue(saved);

    const result = await executeTenantKeyboardShortcutPolicyUpdate(
      {
        allowUserCustomize: false,
        allowFnKeyBindings: false,
        lockedActions: ["crud.delete"],
      },
      {
        requestId: "req-admin-1",
      }
    );

    expect(result).toEqual(saved);
    expect(authMocks.requireActiveTenantAccess).toHaveBeenCalled();
    expect(permissionMocks.requirePermission).toHaveBeenCalled();
    expect(repositoryMocks.upsertTenantKeyboardShortcutPolicy).toHaveBeenCalledWith(
      "tenant-001",
      {
        allowUserCustomize: false,
        allowFnKeyBindings: false,
        lockedActions: ["crud.delete"],
      },
      { id: "tx-1" }
    );
    expect(auditMocks.writeAuditEventInTransaction).toHaveBeenCalledWith(
      { id: "tx-1" },
      expect.objectContaining({
        action: "system-admin.tenant-settings.write",
        targetId: "tenant-001",
        targetType: "tenant-keyboard-shortcut-policy",
      })
    );
  });
});
