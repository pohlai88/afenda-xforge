import { InternalError } from "@repo/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";

const executionMocks = vi.hoisted(() => ({
  archiveCustomerForTenant: vi.fn(),
  updateCustomerForTenant: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../app/api/customers/_execution.ts", () => executionMocks);

import { DELETE, PATCH } from "../app/api/customers/[customerId]/route.ts";

describe("/api/customers/[customerId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a customer through the execution wrapper", async () => {
    executionMocks.updateCustomerForTenant.mockResolvedValue({
      code: "ACME",
      id: "11111111-1111-4111-8111-111111111111",
      name: "Acme Ops",
      status: "active",
    });

    const response = await PATCH(
      new Request(
        "http://localhost/api/customers/11111111-1111-4111-8111-111111111111",
        {
          body: JSON.stringify({
            code: "ACME",
            name: "Acme Ops",
          }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        }
      ),
      {
        params: Promise.resolve({
          customerId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.name).toBe("Acme Ops");
    expect(executionMocks.updateCustomerForTenant).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      {
        code: "ACME",
        name: "Acme Ops",
      }
    );
  });

  it("archives a customer through the execution wrapper", async () => {
    executionMocks.archiveCustomerForTenant.mockResolvedValue({
      code: "ACME",
      id: "11111111-1111-4111-8111-111111111111",
      name: "Acme Ops",
      status: "inactive",
    });

    const response = await DELETE(
      new Request(
        "http://localhost/api/customers/11111111-1111-4111-8111-111111111111",
        {
          method: "DELETE",
        }
      ),
      {
        params: Promise.resolve({
          customerId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.status).toBe("inactive");
    expect(executionMocks.archiveCustomerForTenant).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111"
    );
  });

  it("returns validation errors for invalid update bodies", async () => {
    const response = await PATCH(
      new Request(
        "http://localhost/api/customers/11111111-1111-4111-8111-111111111111",
        {
          body: JSON.stringify({ code: "", name: "" }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        }
      ),
      {
        params: Promise.resolve({
          customerId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.error?.message ?? payload.error).toBeTruthy();
    expect(executionMocks.updateCustomerForTenant).not.toHaveBeenCalled();
  });

  it("maps execution failures to API errors", async () => {
    executionMocks.updateCustomerForTenant.mockRejectedValue(
      new InternalError("Customer update failed")
    );

    const response = await PATCH(
      new Request(
        "http://localhost/api/customers/11111111-1111-4111-8111-111111111111",
        {
          body: JSON.stringify({
            code: "ACME",
            name: "Acme Ops",
          }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        }
      ),
      {
        params: Promise.resolve({
          customerId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error.message).toContain("Customer update failed");
  });
});
