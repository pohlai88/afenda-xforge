import { BusinessRuleError, ForbiddenError } from "@repo/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMocks = vi.hoisted(() => ({
  queryWorkspaceShortcuts: vi.fn(),
}));

const executionMocks = vi.hoisted(() => ({
  executeUserShortcutOverridesUpdate: vi.fn(),
}));

vi.mock("../lib/workspace-shortcuts/execution.server.ts", () => executionMocks);
vi.mock("../lib/workspace-shortcuts/queries.server.ts", () => queryMocks);

import { GET, POST } from "../app/api/me/keyboard-shortcuts/route.ts";
import { resolveProductDefaults } from "../lib/workspace-shortcuts/resolve-shortcuts.ts";

describe("/api/me/keyboard-shortcuts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns merged workspace shortcuts for the active tenant membership", async () => {
    const payload = resolveProductDefaults();
    queryMocks.queryWorkspaceShortcuts.mockResolvedValue(payload);

    const response = await GET(
      new Request("http://localhost/api/me/keyboard-shortcuts")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(payload);
    expect(queryMocks.queryWorkspaceShortcuts).toHaveBeenCalledWith({
      requestId: undefined,
    });
  });

  it("returns a mapped error when repository read fails", async () => {
    queryMocks.queryWorkspaceShortcuts.mockRejectedValue(
      new Error("missing table")
    );

    const response = await GET(
      new Request("http://localhost/api/me/keyboard-shortcuts")
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Keyboard shortcut resolution failed");
  });

  it("rejects POST when user customization is disabled", async () => {
    executionMocks.executeUserShortcutOverridesUpdate.mockRejectedValue(
      new ForbiddenError(
        "User keyboard shortcut customization is disabled by policy."
      )
    );

    const response = await POST(
      new Request("http://localhost/api/me/keyboard-shortcuts", {
        body: JSON.stringify({ overrides: { "crud.edit": "f6" } }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(403);
  });

  it("persists user overrides through the execution pipeline", async () => {
    const savedPayload = resolveProductDefaults();
    executionMocks.executeUserShortcutOverridesUpdate.mockResolvedValue(
      savedPayload
    );

    const response = await POST(
      new Request("http://localhost/api/me/keyboard-shortcuts", {
        body: JSON.stringify({ overrides: { "crud.edit": "f6" } }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.payload).toEqual(savedPayload);
    expect(
      executionMocks.executeUserShortcutOverridesUpdate
    ).toHaveBeenCalledWith(
      { overrides: { "crud.edit": "f6" } },
      {
        requestId: undefined,
      }
    );
  });

  it("rejects strict POST bodies with unknown fields", async () => {
    const response = await POST(
      new Request("http://localhost/api/me/keyboard-shortcuts", {
        body: JSON.stringify({
          overrides: { "crud.edit": "f6" },
          bindings: {},
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(400);
  });

  it("returns validation errors from the execution pipeline", async () => {
    executionMocks.executeUserShortcutOverridesUpdate.mockRejectedValue(
      new BusinessRuleError("f5 is reserved by the browser")
    );

    const response = await POST(
      new Request("http://localhost/api/me/keyboard-shortcuts", {
        body: JSON.stringify({ overrides: { "crud.save": "f5" } }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toContain("reserved");
  });

  it("allows reset overrides via null values", async () => {
    const savedPayload = resolveProductDefaults();
    executionMocks.executeUserShortcutOverridesUpdate.mockResolvedValue(
      savedPayload
    );

    const response = await POST(
      new Request("http://localhost/api/me/keyboard-shortcuts", {
        body: JSON.stringify({ overrides: { "crud.edit": null } }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(
      executionMocks.executeUserShortcutOverridesUpdate
    ).toHaveBeenCalledWith(
      { overrides: { "crud.edit": null } },
      {
        requestId: undefined,
      }
    );
  });
});
