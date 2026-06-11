import { BusinessRuleError, ForbiddenError } from "@repo/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  requireActiveTenantMembership: vi.fn(),
}));

const repositoryMocks = vi.hoisted(() => ({
  readWorkspaceShortcuts: vi.fn(),
}));

const executionMocks = vi.hoisted(() => ({
  executeUserShortcutOverridesUpdate: vi.fn(),
}));

vi.mock("@repo/auth/server", () => authMocks);
vi.mock("../lib/workspace-shortcuts/execution.server.ts", () => executionMocks);
vi.mock("../lib/workspace-shortcuts/repository.server", () => ({
  readWorkspaceShortcuts: repositoryMocks.readWorkspaceShortcuts,
}));

import { GET, POST } from "../app/api/me/keyboard-shortcuts/route.ts";
import { resolveProductDefaults } from "../lib/workspace-shortcuts/resolve-shortcuts.ts";

describe("/api/me/keyboard-shortcuts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireActiveTenantMembership.mockResolvedValue({
      id: "membership-1",
      role: "admin",
      tenantId: "tenant-001",
      userId: "user-001",
    });
  });

  it("returns merged workspace shortcuts for the active tenant membership", async () => {
    const payload = resolveProductDefaults();
    repositoryMocks.readWorkspaceShortcuts.mockResolvedValue(payload);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(payload);
    expect(repositoryMocks.readWorkspaceShortcuts).toHaveBeenCalledWith(
      "tenant-001",
      "user-001"
    );
  });

  it("falls back to product defaults when repository read fails", async () => {
    repositoryMocks.readWorkspaceShortcuts.mockRejectedValue(
      new Error("missing table")
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.bindings["workspace.commandSearch"].binding.normalized).toBe(
      "mod+k"
    );
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
    expect(executionMocks.executeUserShortcutOverridesUpdate).toHaveBeenCalledWith(
      { overrides: { "crud.edit": "f6" } },
      {
        requestId: undefined,
        tenantId: "tenant-001",
        userId: "user-001",
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
    expect(executionMocks.executeUserShortcutOverridesUpdate).toHaveBeenCalledWith(
      { overrides: { "crud.edit": null } },
      {
        requestId: undefined,
        tenantId: "tenant-001",
        userId: "user-001",
      }
    );
  });
});
