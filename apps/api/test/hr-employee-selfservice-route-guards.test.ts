import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import { GET as getDocumentsRoute } from "../app/api/hr/employee-selfservice-portal/documents/route.ts";
import { GET as getLeaveBalancesRoute } from "../app/api/hr/employee-selfservice-portal/leave/balances/route.ts";
import { GET as getPortalListRoute } from "../app/api/hr/employee-selfservice-portal/route.ts";
import { GET as getTasksRoute } from "../app/api/hr/employee-selfservice-portal/tasks/route.ts";
import {
  installTestDeniedHrRuntimeTenantAccess,
  installTestRuntimeTenantAccess,
  TEST_TENANT_ID,
  uninstallTestRuntimeTenantAccess,
} from "./_runtime-access-fixture.ts";

const buildRequest = (path: string): Request =>
  new Request(`http://localhost${path}`);

beforeEach(() => {
  installTestRuntimeTenantAccess({ tenantId: TEST_TENANT_ID });
});

afterEach(() => {
  uninstallTestRuntimeTenantAccess();
});

test("employee self-service portal routes return 403 for denied reads", async () => {
  installTestDeniedHrRuntimeTenantAccess();

  const deniedListResponse = await getPortalListRoute(
    buildRequest("/api/hr/employee-selfservice-portal")
  );
  const deniedDocumentsResponse = await getDocumentsRoute(
    buildRequest("/api/hr/employee-selfservice-portal/documents")
  );
  const deniedTasksResponse = await getTasksRoute(
    buildRequest("/api/hr/employee-selfservice-portal/tasks")
  );
  const deniedLeaveBalancesResponse = await getLeaveBalancesRoute(
    buildRequest("/api/hr/employee-selfservice-portal/leave/balances")
  );

  assert.equal(deniedListResponse.status, 403);
  assert.equal(deniedDocumentsResponse.status, 403);
  assert.equal(deniedTasksResponse.status, 403);
  assert.equal(deniedLeaveBalancesResponse.status, 403);

  assert.deepEqual(await deniedListResponse.json(), {
    code: "forbidden",
    error: "Read access denied for employee self-service portal",
    ok: false,
  });
  assert.deepEqual(await deniedDocumentsResponse.json(), {
    code: "forbidden",
    error: "Read access denied for employee self-service portal",
    ok: false,
  });
});
