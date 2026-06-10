import assert from "node:assert/strict";
import test from "node:test";
import type {
  writeAuditEvent,
  writeAuditEventInTransaction,
} from "@repo/audit";
import { accessCapabilities } from "../domains/access/contract.ts";
import { customizationCapabilities } from "../domains/customization/contract.ts";
import { tenantSettingsCapabilities } from "../domains/tenant-settings/contract.ts";
import { createSystemAdminExecutionHandlers } from "../execution/index.ts";

const mockAuditEvent = {} as Awaited<ReturnType<typeof writeAuditEvent>>;
const mockAuditEventInTransaction = {} as Awaited<
  ReturnType<typeof writeAuditEventInTransaction>
>;

test("tenant settings mutation runs through execution pipeline and returns accepted result", async () => {
  const handlers = createSystemAdminExecutionHandlers({
    createId: () => "exec-id",
    upsertTenantAdminSetting: async () => ({
      themePreset: "xforge",
      moduleLaneOverrides: {},
    }),
    writeAuditEvent: async () => mockAuditEvent,
    writeAuditEventInTransaction: async () => mockAuditEventInTransaction,
  });

  const result = await handlers.executeTenantAdminSettingUpdate(
    {
      key: "default-timezone",
      reason: "Normalize workspace timezone",
      value: "Asia/Bangkok",
    },
    {
      grantedPermissions: [tenantSettingsCapabilities.tenantSettingsWrite],
      tenantId: "tenant_1",
      userId: "user_1",
    }
  );

  assert.equal(result.action, tenantSettingsCapabilities.tenantSettingsWrite);
  assert.equal(result.status, "accepted");
  assert.equal(result.tenantId, "tenant_1");
});

test("access mutation denies callers without access write permission", async () => {
  const handlers = createSystemAdminExecutionHandlers({
    writeAuditEvent: async () => mockAuditEvent,
    writeAuditEventInTransaction: async () => mockAuditEventInTransaction,
  });

  await assert.rejects(
    () =>
      handlers.executeRoleAssignment(
        {
          reason: "Grant tenant admin role",
          roleKey: "tenant-admin",
          targetUserId: "user_2",
        },
        {
          grantedPermissions: [],
          tenantId: "tenant_1",
          userId: "user_1",
        }
      ),
    /Missing required permission/
  );
});

test("customization mutation returns accepted result when permission is present", async () => {
  const handlers = createSystemAdminExecutionHandlers({
    createId: () => "customization-id",
    writeAuditEvent: async () => mockAuditEvent,
    writeAuditEventInTransaction: async () => mockAuditEventInTransaction,
  });

  const result = await handlers.executeCustomizationPublication(
    {
      customizationId: "customization_1",
      reason: "Promote reviewed customization",
    },
    {
      grantedPermissions: [customizationCapabilities.customizationPublish],
      tenantId: "tenant_1",
      userId: "user_1",
    }
  );

  assert.equal(result.action, customizationCapabilities.customizationPublish);
  assert.equal(result.id, "customization-id");
  assert.equal(result.status, "accepted");
});

test("access mutation returns accepted result when permission is present", async () => {
  const handlers = createSystemAdminExecutionHandlers({
    createId: () => "role-id",
    writeAuditEvent: async () => mockAuditEvent,
    writeAuditEventInTransaction: async () => mockAuditEventInTransaction,
  });

  const result = await handlers.executeRoleAssignment(
    {
      reason: "Grant support role",
      roleKey: "support",
      targetUserId: "user_2",
    },
    {
      grantedPermissions: [accessCapabilities.usersAccessWrite],
      tenantId: "tenant_1",
      userId: "user_1",
    }
  );

  assert.equal(result.action, accessCapabilities.usersAccessWrite);
  assert.equal(result.id, "role-id");
});
