import { InternalError } from "@repo/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

const executionMocks = vi.hoisted(() => ({
  archiveCompanyForTenant: vi.fn(),
  updateCompanyForTenant: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../app/api/companies/_execution.ts", () => executionMocks);

import { DELETE, PATCH } from "../app/api/companies/[companyId]/route.ts";

describe("/api/companies/[companyId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a company through the execution wrapper", async () => {
    executionMocks.updateCompanyForTenant.mockResolvedValue({
      code: "HOLD",
      id: "22222222-2222-4222-8222-222222222222",
      name: "Acme Holdings",
      status: "active",
    });

    const response = await PATCH(
      new Request(
        "http://localhost/api/companies/22222222-2222-4222-8222-222222222222",
        {
          body: JSON.stringify({
            code: "HOLD",
            name: "Acme Holdings",
          }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        }
      ),
      {
        params: Promise.resolve({
          companyId: "22222222-2222-4222-8222-222222222222",
        }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.name).toBe("Acme Holdings");
    expect(executionMocks.updateCompanyForTenant).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
      {
        code: "HOLD",
        name: "Acme Holdings",
      }
    );
  });

  it("returns validation errors for invalid update bodies", async () => {
    const response = await PATCH(
      new Request(
        "http://localhost/api/companies/22222222-2222-4222-8222-222222222222",
        {
          body: JSON.stringify({ code: "", name: "" }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        }
      ),
      {
        params: Promise.resolve({
          companyId: "22222222-2222-4222-8222-222222222222",
        }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.error?.message ?? payload.error).toBeTruthy();
    expect(executionMocks.updateCompanyForTenant).not.toHaveBeenCalled();
  });

  it("maps execution failures to API errors", async () => {
    executionMocks.updateCompanyForTenant.mockRejectedValue(
      new InternalError("Company update failed")
    );

    const response = await PATCH(
      new Request(
        "http://localhost/api/companies/22222222-2222-4222-8222-222222222222",
        {
          body: JSON.stringify({
            code: "HOLD",
            name: "Acme Holdings",
          }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        }
      ),
      {
        params: Promise.resolve({
          companyId: "22222222-2222-4222-8222-222222222222",
        }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error.message).toContain("Company update failed");
  });

  it("archives a company through the execution wrapper", async () => {
    executionMocks.archiveCompanyForTenant.mockResolvedValue({
      code: "HOLD",
      id: "22222222-2222-4222-8222-222222222222",
      name: "Acme Holdings",
      status: "inactive",
    });

    const response = await DELETE(
      new Request(
        "http://localhost/api/companies/22222222-2222-4222-8222-222222222222",
        {
          method: "DELETE",
        }
      ),
      {
        params: Promise.resolve({
          companyId: "22222222-2222-4222-8222-222222222222",
        }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.status).toBe("inactive");
    expect(executionMocks.archiveCompanyForTenant).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222"
    );
  });
});
