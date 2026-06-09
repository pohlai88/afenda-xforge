import assert from "node:assert/strict";
import { test } from "node:test";
import { hrRecordsSearchParamsSchema } from "../src/records.contract.ts";
import {
  hrEmployeeArchiveRoutePath,
  hrEmployeeDetailRoutePath,
  hrEmployeeRehireRoutePath,
  hrEmployeeStatusHistoryRoutePath,
} from "../src/route-paths.ts";
import {
  parseHrRecordsSearchParams,
  toHrRecordsPageModelInput,
} from "../src/search-params.parse.shared.ts";

test("normalizes legacy employee record search params", () => {
  const parsed = parseHrRecordsSearchParams({
    search: "annual review",
    employmentStatusFilter: "active",
  });

  assert.equal(parsed.directorySearch, "annual review");
  assert.equal(parsed.incompleteSearch, "annual review");
  assert.equal(parsed.employmentStatusFilter, "active");
  assert.doesNotThrow(() =>
    hrRecordsSearchParamsSchema.parse({
      directorySearch: parsed.directorySearch,
      incompleteSearch: parsed.incompleteSearch,
      employmentStatusFilter: parsed.employmentStatusFilter,
    })
  );
});

test("builds the employee record detail route and page model input", () => {
  assert.equal(hrEmployeeDetailRoutePath("emp-123"), "/hr/records/emp-123");
  assert.equal(
    hrEmployeeArchiveRoutePath("emp-123"),
    "/hr/records/emp-123/archive"
  );
  assert.equal(
    hrEmployeeRehireRoutePath("emp-123"),
    "/hr/records/emp-123/rehire"
  );
  assert.equal(
    hrEmployeeStatusHistoryRoutePath("emp-123"),
    "/hr/records/emp-123/status-history"
  );

  const modelInput = toHrRecordsPageModelInput({
    organizationId: "org-1",
    canWrite: true,
    canViewSensitive: false,
    searchParams: {
      recordsSearch: "onboarding",
    },
  });

  assert.equal(modelInput.organizationId, "org-1");
  assert.equal(modelInput.directorySearch, "onboarding");
  assert.equal(modelInput.auditTrailSearch, "onboarding");
});
