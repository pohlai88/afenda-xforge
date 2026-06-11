import { ForbiddenError, UnauthorizedError } from "@repo/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  ACTIVE_COMPANY_COOKIE_NAME: "xforge_active_company_id",
  requireActiveTenantAccess: vi.fn(),
  requireCompanyAccess: vi.fn(),
}));

const cookieMocks = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
}));

vi.mock("@repo/auth/server", () => authMocks);
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(cookieMocks),
}));

import { POST } from "../app/api/companies/select/route.ts";

describe("/api/companies/select", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    authMocks.requireCompanyAccess.mockResolvedValue(undefined);
  });

  it("returns selected company id when access is granted", async () => {
    const response = await POST(
      new Request("http://localhost/api/companies/select", {
        body: JSON.stringify({ companyId: "company-001" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ companyId: "company-001" });
    expect(authMocks.requireActiveTenantAccess).toHaveBeenCalled();
    expect(authMocks.requireCompanyAccess).toHaveBeenCalledWith({
      companyId: "company-001",
      tenantId: "tenant-001",
    });
    expect(cookieMocks.set).toHaveBeenCalledWith(
      authMocks.ACTIVE_COMPANY_COOKIE_NAME,
      "company-001",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      })
    );
  });

  it("returns 400 when companyId validation fails", async () => {
    const response = await POST(
      new Request("http://localhost/api/companies/select", {
        body: JSON.stringify({ companyId: "" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Validation failed");
    expect(authMocks.requireActiveTenantAccess).not.toHaveBeenCalled();
  });

  it("returns 401 when tenant access is required", async () => {
    authMocks.requireActiveTenantAccess.mockRejectedValue(
      new UnauthorizedError()
    );

    const response = await POST(
      new Request("http://localhost/api/companies/select", {
        body: JSON.stringify({ companyId: "company-001" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBeTruthy();
    expect(authMocks.requireCompanyAccess).not.toHaveBeenCalled();
  });

  it("returns 403 when company access is forbidden", async () => {
    authMocks.requireCompanyAccess.mockRejectedValue(
      new ForbiddenError("Company access denied")
    );

    const response = await POST(
      new Request("http://localhost/api/companies/select", {
        body: JSON.stringify({ companyId: "company-001" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );

    expect(response.status).toBe(403);
  });
});
