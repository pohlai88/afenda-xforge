import { describe, expect, it, vi } from "vitest";

import { persistTenantKeyboardShortcutPolicy } from "../lib/workspace-shortcuts/persist-tenant-shortcuts.client.ts";

describe("persistTenantKeyboardShortcutPolicy", () => {
  it("posts tenant policy patches to the admin API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        policy: {
          allowUserCustomize: true,
          allowFnKeyBindings: true,
          lockedActions: [],
          overrides: {},
        },
        preview: {
          bindings: {},
          policy: {
            allowUserCustomize: true,
            allowFnKeyBindings: true,
            lockedActions: [],
          },
          source: {},
        },
      }),
      ok: true,
      status: 200,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await persistTenantKeyboardShortcutPolicy({
      allowUserCustomize: true,
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/tenant/keyboard-shortcuts",
      {
        body: JSON.stringify({ allowUserCustomize: true }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }
    );
  });
});
