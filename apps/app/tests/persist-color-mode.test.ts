import { describe, expect, it, vi } from "vitest";

import { persistColorModePreferences } from "../lib/user-appearance/persist-color-mode.client";

describe("persistColorModePreferences", () => {
  it("posts merged preferences and returns saved payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        preferences: {
          colorMode: "dark",
          themePreset: "teal",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await persistColorModePreferences(
      { themePreset: "teal" },
      "dark"
    );

    expect(result).toEqual({
      ok: true,
      preferences: {
        colorMode: "dark",
        themePreset: "teal",
      },
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/me/appearance", {
      body: JSON.stringify({
        preferences: {
          themePreset: "teal",
          colorMode: "dark",
        },
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    vi.unstubAllGlobals();
  });

  it("returns an error when the API rejects the update", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Invalid preferences" }),
      })
    );

    const result = await persistColorModePreferences({}, "light");

    expect(result).toEqual({
      ok: false,
      error: "Invalid preferences",
    });

    vi.unstubAllGlobals();
  });
});
