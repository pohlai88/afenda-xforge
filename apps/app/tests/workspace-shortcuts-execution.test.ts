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
}));
vi.mock("@repo/database", () => ({
  database: {
    transaction: transactionMocks.transaction,
  },
}));
vi.mock("../lib/workspace-shortcuts/repository.server", () => repositoryMocks);

import {
  executeTenantKeyboardShortcutPolicyUpdate,
  executeUserShortcutOverridesUpdate,
} from "../lib/workspace-shortcuts/execution.server.ts";
import { resolveProductDefaults } from "../lib/workspace-shortcuts/resolve-shortcuts.ts";

describe("workspace shortcut execution pipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    permissionMocks.requirePermission.mockImplementation(() => undefined);
    transactionMocks.transaction.mockImplementation(
      async (run: (db: { id: string }) => Promise<unknown>) => run({ id: "tx-1" })
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
        tenantId: "tenant-001",
        userId: "user-001",
      }
    );

    expect(result).toEqual(saved);
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
        {
          tenantId: "tenant-001",
          userId: "user-001",
        }
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
        {
          tenantId: "tenant-001",
          userId: "user-001",
        }
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
        grantedPermissions: ["system-admin.tenant-settings.write"],
        requestId: "req-admin-1",
        tenantId: "tenant-001",
        userId: "user-001",
      }
    );

    expect(result).toEqual(saved);
    expect(permissionMocks.requirePermission).toHaveBeenCalled();
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
