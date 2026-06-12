import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMocks = vi.hoisted(() => ({
  queryWorkspaceSearch: vi.fn(),
}));

vi.mock("../lib/workspace-search/queries.server.ts", () => queryMocks);

import { GET } from "../app/api/me/workspace-search/route.ts";

describe("/api/me/workspace-search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns indexed search results for the query", async () => {
    queryMocks.queryWorkspaceSearch.mockResolvedValue({
      available: true,
      query: "alpha",
      results: [
        {
          description: "Employee record",
          href: "/hr",
          id: "rec-1",
          indexKey: "hr_employee_records",
          indexLabel: "HR records",
          rankingScore: 0.9,
          title: "Alpha Employee",
        },
      ],
    });

    const response = await GET(
      new Request("http://localhost/api/me/workspace-search?q=alpha&limit=5")
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      available: true,
      query: "alpha",
      results: [
        {
          description: "Employee record",
          href: "/hr",
          id: "rec-1",
          indexKey: "hr_employee_records",
          indexLabel: "HR records",
          rankingScore: 0.9,
          title: "Alpha Employee",
        },
      ],
    });
    expect(queryMocks.queryWorkspaceSearch).toHaveBeenCalledWith({
      limit: 5,
      query: "alpha",
      requestId: undefined,
    });
  });
});
