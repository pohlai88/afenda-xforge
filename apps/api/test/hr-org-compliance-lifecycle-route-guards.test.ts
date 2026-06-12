import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";

import {
  resetComplianceRepositoryForTesting,
  setComplianceRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/compliance-regulatory-tracking/src/repository.testing.ts";
import {
  resetEmployeeLifecycleRepositoryForTesting,
  setEmployeeLifecycleRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/employee-lifecycle-management/src/repository.testing.ts";
import {
  resetHrOrgRepositoryForTesting,
  setHrOrgRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/organizational-chart-hierarchy/src/repository.testing.ts";
import { GET as getComplianceOverviewRoute } from "../app/api/hr/compliance/overview/route.ts";
import {
  GET as getComplianceFilingsRoute,
  POST as postComplianceFilingsRoute,
} from "../app/api/hr/compliance/filings/route.ts";
import { GET as getLifecycleOverviewRoute } from "../app/api/hr/lifecycle/overview/route.ts";
import { POST as postLifecycleTransitionsRoute } from "../app/api/hr/lifecycle/transitions/route.ts";
import { GET as getOrgOverviewRoute } from "../app/api/hr/org/overview/route.ts";
import { GET as getOrgUnitsRoute } from "../app/api/hr/org/units/route.ts";
import {
  installTestDeniedHrRuntimeTenantAccess,
  installTestRuntimeTenantAccess,
  TEST_TENANT_ID,
  uninstallTestRuntimeTenantAccess,
} from "./_runtime-access-fixture.ts";

let sandboxDirectory: string;

const buildRequest = (
  path: string,
  options?: {
    body?: BodyInit | null;
    headers?: Record<string, string>;
    method?: string;
  }
): Request =>
  new Request(`http://localhost${path}`, {
    body: options?.body,
    headers: options?.headers,
    method: options?.method,
  });

const resetHrRouteRepositories = async (): Promise<void> => {
  setHrOrgRepositoryPathForTesting(join(sandboxDirectory, "org-repository.json"));
  await resetHrOrgRepositoryForTesting();

  setComplianceRepositoryPathForTesting(
    join(sandboxDirectory, "compliance-repository.json")
  );
  await resetComplianceRepositoryForTesting();

  setEmployeeLifecycleRepositoryPathForTesting(
    join(sandboxDirectory, "lifecycle-repository.json")
  );
  resetEmployeeLifecycleRepositoryForTesting();
};

const forbiddenPayload = (error: string) => ({
  code: "forbidden",
  error,
  ok: false,
});

beforeEach(async () => {
  installTestRuntimeTenantAccess({ tenantId: TEST_TENANT_ID });
  sandboxDirectory = mkdtempSync(
    join(tmpdir(), "api-hr-org-compliance-lifecycle-guards-")
  );
  await resetHrRouteRepositories();
});

afterEach(() => {
  uninstallTestRuntimeTenantAccess();
  rmSync(sandboxDirectory, { force: true, recursive: true });
});

test("organization structure routes allow trusted reads and block denied reads", async () => {
  const allowedOverviewResponse = await getOrgOverviewRoute(
    buildRequest("/api/hr/org/overview")
  );

  installTestDeniedHrRuntimeTenantAccess();

  const deniedOverviewResponse = await getOrgOverviewRoute(
    buildRequest("/api/hr/org/overview")
  );
  const deniedUnitsResponse = await getOrgUnitsRoute(
    buildRequest("/api/hr/org/units")
  );

  assert.equal(allowedOverviewResponse.status, 200);
  assert.equal(deniedOverviewResponse.status, 403);
  assert.equal(deniedUnitsResponse.status, 403);

  assert.deepEqual(await deniedOverviewResponse.json(), {
    ...forbiddenPayload("Read access denied for organization structure"),
  });
  assert.deepEqual(await deniedUnitsResponse.json(), {
    ...forbiddenPayload("Read access denied for organization structure"),
  });
});

test("compliance routes allow trusted reads and block denied reads and writes", async () => {
  const allowedOverviewResponse = await getComplianceOverviewRoute(
    buildRequest("/api/hr/compliance/overview")
  );
  const allowedFilingsResponse = await getComplianceFilingsRoute(
    buildRequest("/api/hr/compliance/filings")
  );

  installTestDeniedHrRuntimeTenantAccess();

  const deniedOverviewResponse = await getComplianceOverviewRoute(
    buildRequest("/api/hr/compliance/overview")
  );
  const deniedFilingsReadResponse = await getComplianceFilingsRoute(
    buildRequest("/api/hr/compliance/filings")
  );
  const deniedFilingsWriteResponse = await postComplianceFilingsRoute(
    buildRequest("/api/hr/compliance/filings", {
      body: JSON.stringify({
        companyId: "company-a",
        filingType: "annual-report",
        jurisdiction: "US",
        periodStart: "2026-01-01",
        periodEnd: "2026-12-31",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
  );

  assert.equal(allowedOverviewResponse.status, 200);
  assert.equal(allowedFilingsResponse.status, 200);
  assert.equal(deniedOverviewResponse.status, 403);
  assert.equal(deniedFilingsReadResponse.status, 403);
  assert.equal(deniedFilingsWriteResponse.status, 403);

  assert.deepEqual(await deniedOverviewResponse.json(), {
    ...forbiddenPayload("Read access denied for compliance"),
  });
  assert.deepEqual(await deniedFilingsReadResponse.json(), {
    ...forbiddenPayload("Read access denied for compliance"),
  });
  assert.deepEqual(await deniedFilingsWriteResponse.json(), {
    ...forbiddenPayload("Write access denied for compliance"),
  });
});

test("employee lifecycle routes allow trusted reads and block denied reads and writes", async () => {
  const allowedOverviewResponse = await getLifecycleOverviewRoute(
    buildRequest("/api/hr/lifecycle/overview")
  );

  installTestDeniedHrRuntimeTenantAccess();

  const deniedOverviewResponse = await getLifecycleOverviewRoute(
    buildRequest("/api/hr/lifecycle/overview")
  );
  const deniedTransitionResponse = await postLifecycleTransitionsRoute(
    buildRequest("/api/hr/lifecycle/transitions", {
      body: JSON.stringify({
        employeeId: "employee-1",
        targetStage: "active",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
  );

  assert.equal(allowedOverviewResponse.status, 200);
  assert.equal(deniedOverviewResponse.status, 403);
  assert.equal(deniedTransitionResponse.status, 403);

  assert.deepEqual(await deniedOverviewResponse.json(), {
    ...forbiddenPayload("Read access denied for employee lifecycle"),
  });
  assert.deepEqual(await deniedTransitionResponse.json(), {
    ...forbiddenPayload("Write access denied for employee lifecycle"),
  });
});
