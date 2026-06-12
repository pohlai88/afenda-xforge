import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";

import { createHrEmployeeRecord } from "@repo/features-employee-management-employee-records-management/server";
import {
  resetHrEmployeeRecordsRepositoryForTesting,
  setHrEmployeeRecordsRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/employee-records-management/src/repository.testing.ts";
import { POST as postArchiveRoute } from "../app/api/hr/records/[employeeId]/archive/route.ts";
import { GET as getAssignmentsRoute } from "../app/api/hr/records/[employeeId]/assignments/route.ts";
import { POST as postRehireRoute } from "../app/api/hr/records/[employeeId]/rehire/route.ts";
import {
  GET as getEmployeeRoute,
  PATCH as patchEmployeeRoute,
} from "../app/api/hr/records/[employeeId]/route.ts";
import { GET as getStatusHistoryRoute } from "../app/api/hr/records/[employeeId]/status-history/route.ts";
import {
  GET as getRecordsRoute,
  POST as postRecordsRoute,
} from "../app/api/hr/records/route.ts";
import {
  installTestDeniedHrRuntimeTenantAccess,
  installTestRuntimeTenantAccess,
  TEST_TENANT_ID,
  uninstallTestRuntimeTenantAccess,
} from "./_runtime-access-fixture.ts";

let sandboxDirectory: string;
let employeeSuffix = "";

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

const resetRecordsRouteRepository = (): void => {
  setHrEmployeeRecordsRepositoryPathForTesting(
    join(sandboxDirectory, "repository.json")
  );
  resetHrEmployeeRecordsRepositoryForTesting();
};

beforeEach(() => {
  installTestRuntimeTenantAccess({ tenantId: TEST_TENANT_ID });
  sandboxDirectory = mkdtempSync(join(tmpdir(), "api-records-routes-"));
  employeeSuffix = randomUUID().slice(0, 8);
  resetRecordsRouteRepository();
});

afterEach(() => {
  uninstallTestRuntimeTenantAccess();
  rmSync(sandboxDirectory, { force: true, recursive: true });
});

test("blocks denied reads and writes at the employee records route edge", async () => {
  installTestDeniedHrRuntimeTenantAccess();

  const deniedListResponse = await getRecordsRoute(
    buildRequest("/api/hr/records")
  );
  const deniedCreateResponse = await postRecordsRoute(
    buildRequest("/api/hr/records", {
      body: JSON.stringify({
        employeeNumber: "E-DENIED",
        legalName: "Denied Create",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
  );
  const deniedDetailResponse = await getEmployeeRoute(
    buildRequest("/api/hr/records/employee-denied"),
    {
      params: Promise.resolve({ employeeId: "employee-denied" }),
    }
  );
  const deniedAssignmentsResponse = await getAssignmentsRoute(
    buildRequest("/api/hr/records/employee-denied/assignments"),
    {
      params: Promise.resolve({ employeeId: "employee-denied" }),
    }
  );
  const deniedStatusHistoryResponse = await getStatusHistoryRoute(
    buildRequest("/api/hr/records/employee-denied/status-history"),
    {
      params: Promise.resolve({ employeeId: "employee-denied" }),
    }
  );

  assert.equal(deniedListResponse.status, 403);
  assert.equal(deniedCreateResponse.status, 403);
  assert.equal(deniedDetailResponse.status, 403);
  assert.equal(deniedAssignmentsResponse.status, 403);
  assert.equal(deniedStatusHistoryResponse.status, 403);

  assert.deepEqual(await deniedListResponse.json(), {
    code: "forbidden",
    error: "Read access denied for employee records",
    ok: false,
  });
  assert.deepEqual(await deniedCreateResponse.json(), {
    code: "forbidden",
    error: "Write access denied for employee records",
    ok: false,
  });
});

test("serves list and detail routes for trusted employee record reads", async () => {
  const created = await createHrEmployeeRecord(
    {
      employeeNumber: `E-${employeeSuffix}`,
      legalName: "Route Worker",
      email: `worker-${employeeSuffix}@example.com`,
    },
    {
      canWrite: true,
      canViewSensitive: true,
      organizationId: TEST_TENANT_ID,
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  assert.ok(created.targetId);

  const employeeId = created.targetId;

  const listResponse = await getRecordsRoute(buildRequest("/api/hr/records"));
  const detailResponse = await getEmployeeRoute(
    buildRequest(`/api/hr/records/${employeeId}`),
    {
      params: Promise.resolve({ employeeId }),
    }
  );
  const assignmentsResponse = await getAssignmentsRoute(
    buildRequest(`/api/hr/records/${employeeId}/assignments`),
    {
      params: Promise.resolve({ employeeId }),
    }
  );
  const statusHistoryResponse = await getStatusHistoryRoute(
    buildRequest(`/api/hr/records/${employeeId}/status-history`),
    {
      params: Promise.resolve({ employeeId }),
    }
  );

  assert.equal(listResponse.status, 200);
  assert.equal(detailResponse.status, 200);
  assert.equal(assignmentsResponse.status, 200);
  assert.equal(statusHistoryResponse.status, 200);

  const listPayload = (await listResponse.json()) as Array<{ id: string }>;
  assert.equal(
    listPayload.some((record) => record.id === employeeId),
    true
  );

  const detailPayload = (await detailResponse.json()) as { id: string };
  assert.equal(detailPayload.id, employeeId);
});

test("blocks denied writes for patch, archive, and rehire routes", async () => {
  const created = await createHrEmployeeRecord(
    {
      employeeNumber: `E-WRITE-${employeeSuffix}`,
      legalName: "Write Guard Worker",
    },
    {
      canWrite: true,
      canViewSensitive: true,
      organizationId: TEST_TENANT_ID,
      userId: "hr-admin",
    }
  );

  assert.equal(created.ok, true);
  assert.ok(created.targetId);

  const employeeId = created.targetId;

  installTestDeniedHrRuntimeTenantAccess();

  const deniedPatchResponse = await patchEmployeeRoute(
    buildRequest(`/api/hr/records/${employeeId}`, {
      body: JSON.stringify({ preferredName: "Denied Patch" }),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
    }),
    {
      params: Promise.resolve({ employeeId }),
    }
  );
  const deniedArchiveResponse = await postArchiveRoute(
    buildRequest(`/api/hr/records/${employeeId}/archive`, {
      body: JSON.stringify({ reason: "Denied archive" }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    }),
    {
      params: Promise.resolve({ employeeId }),
    }
  );
  const deniedRehireResponse = await postRehireRoute(
    buildRequest(`/api/hr/records/${employeeId}/rehire`, {
      body: JSON.stringify({
        employeeNumber: `E-REHIRE-${employeeSuffix}`,
        legalName: "Denied Rehire",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    }),
    {
      params: Promise.resolve({ employeeId }),
    }
  );

  assert.equal(deniedPatchResponse.status, 403);
  assert.equal(deniedArchiveResponse.status, 403);
  assert.equal(deniedRehireResponse.status, 403);

  assert.deepEqual(await deniedPatchResponse.json(), {
    code: "forbidden",
    error: "Write access denied for employee records",
    ok: false,
  });
});
