import { describe, expect, it } from "vitest";
import {
  assertPostgresSearchQuery,
  assertSearchTenantId,
  clampPostgresSearchLimit,
  mapSearchDocumentToUpsert,
  MIN_POSTGRES_SEARCH_QUERY_LENGTH,
} from "./internal.ts";

describe("postgres search internal", () => {
  it("rejects queries shorter than the minimum length", () => {
    expect(() => assertPostgresSearchQuery("a")).toThrow(
      `Search query must be at least ${MIN_POSTGRES_SEARCH_QUERY_LENGTH} characters`
    );
  });

  it("clamps search limits to the postgres maximum", () => {
    expect(clampPostgresSearchLimit(100)).toBe(25);
    expect(clampPostgresSearchLimit(undefined)).toBe(10);
  });

  it("rejects non-uuid tenant ids before postgres upsert", () => {
    expect(() => assertSearchTenantId("org-1")).toThrow(
      "Search tenantId must be a UUID"
    );
  });

  it("maps search documents into postgres upsert rows", () => {
    const mapped = mapSearchDocumentToUpsert("hr_employee_records", {
      id: "rec-1",
      tenantId: "11111111-1111-4111-8111-111111111111",
      companyId: "company-1",
      title: "Alpha Employee",
      description: "Employee record",
      url: "/hr/rec-1",
      metadata: { recordType: "hrEmployeeRecord" },
    });

    expect(mapped).toEqual({
      companyId: "company-1",
      description: "Employee record",
      entityId: "rec-1",
      entityType: "hr_employee_records",
      metadata: { recordType: "hrEmployeeRecord" },
      tenantId: "11111111-1111-4111-8111-111111111111",
      title: "Alpha Employee",
      url: "/hr/rec-1",
    });
  });
});
