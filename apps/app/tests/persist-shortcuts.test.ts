import { describe, expect, it, vi } from "vitest";

import { persistShortcutOverrides } from "../lib/workspace-shortcuts/persist-shortcuts.client.ts";
import { resolveProductDefaults } from "../lib/workspace-shortcuts/resolve-shortcuts.ts";

describe("persistShortcutOverrides", () => {
  it("posts overrides and returns saved payload", async () => {
    const payload = resolveProductDefaults();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ payload }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await persistShortcutOverrides({ "crud.edit": "f6" });

    expect(result).toEqual({ ok: true, payload });
    expect(fetchMock).toHaveBeenCalledWith("/api/me/keyboard-shortcuts", {
      body: JSON.stringify({ overrides: { "crud.edit": "f6" } }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    vi.unstubAllGlobals();
  });
});
