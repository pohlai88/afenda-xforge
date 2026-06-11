import { ForbiddenError } from "@repo/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMocks = vi.hoisted(() => ({
  queryTenantKeyboardShortcutPolicy: vi.fn(),
}));

const executionMocks = vi.hoisted(() => ({
  executeTenantKeyboardShortcutPolicyUpdate: vi.fn(),
}));

vi.mock("../lib/workspace-shortcuts/execution.server.ts", () => executionMocks);
vi.mock("../lib/workspace-shortcuts/queries.server.ts", () => queryMocks);

import { GET, POST } from "../app/api/admin/tenant/keyboard-shortcuts/route.ts";
import { resolveProductDefaults } from "../lib/workspace-shortcuts/resolve-shortcuts.ts";

describe("/api/admin/tenant/keyboard-shortcuts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    queryMocks.queryTenantKeyboardShortcutPolicy.mockResolvedValue(payload);

    const response = await GET(
      new Request("http://localhost/api/admin/tenant/keyboard-shortcuts")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(payload);
  });

  it("returns 403 when tenant settings read is forbidden", async () => {
    queryMocks.queryTenantKeyboardShortcutPolicy.mockRejectedValue(
      new ForbiddenError(
        "Missing required permission(s) for system-admin.tenant-settings.read"
      )
    );

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
        headers: {
          "content-type": "application/json",
          "x-request-id": "req-001",
        },
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
        requestId: "req-001",
      }
    );
  });
});
