import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";

import { openOffboardingCase } from "@repo/features-employee-management-offboarding-exit-management/server";
import {
  resetOffboardingRepositoryForTesting,
  setOffboardingRepositoryPathForTesting,
} from "../../../packages/features/hr-suite/employee-management/offboarding-exit-management/src/repository.testing.ts";
import { POST as postAuditEventRoute } from "../app/api/hr/offboarding/audit-events/route.ts";
import { GET as getAuditTrailRoute } from "../app/api/hr/offboarding/audit-trail/route.ts";
import {
  GET as getCaseDetailRoute,
  PATCH as patchCaseDetailRoute,
} from "../app/api/hr/offboarding/cases/[caseId]/route.ts";
import {
  GET as getCasesRoute,
  POST as postCasesRoute,
} from "../app/api/hr/offboarding/cases/route.ts";
import { GET as getOverviewRoute } from "../app/api/hr/offboarding/overview/route.ts";
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

const resetOffboardingRouteRepository = async (): Promise<void> => {
  setOffboardingRepositoryPathForTesting(
    join(sandboxDirectory, "repository.json")
  );
  await resetOffboardingRepositoryForTesting();
};

beforeEach(async () => {
  installTestRuntimeTenantAccess({ tenantId: TEST_TENANT_ID });
  sandboxDirectory = mkdtempSync(join(tmpdir(), "api-offboarding-routes-"));
  employeeSuffix = randomUUID().slice(0, 8);
  await resetOffboardingRouteRepository();
});

afterEach(() => {
  uninstallTestRuntimeTenantAccess();
  rmSync(sandboxDirectory, { force: true, recursive: true });
});

test("returns overview for trusted reads and blocks untrusted reads", async () => {
  const allowedResponse = await getOverviewRoute(
    buildRequest("/api/hr/offboarding/overview")
  );

  installTestDeniedHrRuntimeTenantAccess();

  const deniedResponse = await getOverviewRoute(
    buildRequest("/api/hr/offboarding/overview")
  );

  assert.equal(allowedResponse.status, 200);
  assert.equal(deniedResponse.status, 403);

  const overview = (await allowedResponse.json()) as { featureId: string };
  assert.equal(
    overview.featureId,
    "hr-suite.employee-management.offboarding-exit-management"
  );
  assert.deepEqual(await deniedResponse.json(), {
    code: "forbidden",
    error: "Read access denied for offboarding",
    ok: false,
  });
});

test("validates cases query and create semantics at the route edge", async () => {
  await resetOffboardingRouteRepository();

  const createResponse = await postCasesRoute(
    buildRequest("/api/hr/offboarding/cases", {
      body: JSON.stringify({
        companyId: "company-a",
        employeeId: `employee-1-${employeeSuffix}`,
        exitType: "resignation",
        reason: "Personal resignation",
        effectiveSeparationDate: "2026-07-15T00:00:00.000Z",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
  );
  const invalidCreateResponse = await postCasesRoute(
    buildRequest("/api/hr/offboarding/cases", {
      body: JSON.stringify({
        companyId: "company-a",
        employeeId: "",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
  );

  const invalidQueryResponse = await getCasesRoute(
    buildRequest("/api/hr/offboarding/cases?page=not-a-number")
  );

  installTestDeniedHrRuntimeTenantAccess();

  const deniedCreateResponse = await postCasesRoute(
    buildRequest("/api/hr/offboarding/cases", {
      body: JSON.stringify({
        companyId: "company-a",
        employeeId: `employee-2-${employeeSuffix}`,
        exitType: "termination",
        reason: "Denied write",
        effectiveSeparationDate: "2026-07-18T00:00:00.000Z",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
  );

  assert.equal(createResponse.status, 201);
  assert.equal(invalidCreateResponse.status, 400);
  assert.equal(deniedCreateResponse.status, 403);
  assert.equal(invalidQueryResponse.status, 400);

  const createPayload = (await createResponse.json()) as {
    ok: boolean;
    targetId: string;
  };
  assert.equal(createPayload.ok, true);
  assert.equal(typeof createPayload.targetId, "string");
});

test("distinguishes case detail not-found, unauthorized, and patch validation paths", async () => {
  await resetOffboardingRouteRepository();

  const opened = await openOffboardingCase(
    {
      companyId: "company-a",
      employeeId: `employee-3-${employeeSuffix}`,
      exitType: "retirement",
      reason: "Retirement",
      effectiveSeparationDate: new Date("2026-08-01T00:00:00.000Z"),
    },
    {
      actorId: "hr-admin",
      canRead: true,
      canWrite: true,
      companyId: "company-a",
      tenantId: TEST_TENANT_ID,
    }
  );

  assert.equal(opened.ok, true);

  const detailResponse = await getCaseDetailRoute(
    buildRequest(`/api/hr/offboarding/cases/${opened.targetId}`),
    {
      params: Promise.resolve({ caseId: opened.targetId }),
    }
  );
  const notFoundResponse = await getCaseDetailRoute(
    buildRequest("/api/hr/offboarding/cases/missing"),
    {
      params: Promise.resolve({ caseId: "missing" }),
    }
  );

  installTestDeniedHrRuntimeTenantAccess();

  const deniedDetailResponse = await getCaseDetailRoute(
    buildRequest(`/api/hr/offboarding/cases/${opened.targetId}`),
    {
      params: Promise.resolve({ caseId: opened.targetId }),
    }
  );

  installTestRuntimeTenantAccess({ tenantId: TEST_TENANT_ID });

  const patchResponse = await patchCaseDetailRoute(
    buildRequest(`/api/hr/offboarding/cases/${opened.targetId}`, {
      body: JSON.stringify({
        waivedNotice: true,
        waivedNoticeReason: "Approved waiver",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
    }),
    {
      params: Promise.resolve({ caseId: opened.targetId }),
    }
  );
  const invalidPatchResponse = await patchCaseDetailRoute(
    buildRequest(`/api/hr/offboarding/cases/${opened.targetId}`, {
      body: JSON.stringify({
        requiredNoticeDays: 0,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
    }),
    {
      params: Promise.resolve({ caseId: opened.targetId }),
    }
  );

  installTestDeniedHrRuntimeTenantAccess();

  const deniedPatchResponse = await patchCaseDetailRoute(
    buildRequest(`/api/hr/offboarding/cases/${opened.targetId}`, {
      body: JSON.stringify({
        waivedNotice: true,
        waivedNoticeReason: "No write permission",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
    }),
    {
      params: Promise.resolve({ caseId: opened.targetId }),
    }
  );

  assert.equal(detailResponse.status, 200);
  assert.equal(notFoundResponse.status, 404);
  assert.equal(deniedDetailResponse.status, 403);
  assert.equal(patchResponse.status, 200);
  assert.equal(invalidPatchResponse.status, 400);
  assert.equal(deniedPatchResponse.status, 403);
});

test("normalizes audit trail reads and audit event writes", async () => {
  await resetOffboardingRouteRepository();

  const writeResponse = await postAuditEventRoute(
    buildRequest("/api/hr/offboarding/audit-events", {
      body: JSON.stringify({
        action: "hr.offboarding.case.reviewed",
        entityType: "case",
        entityId: "case-1",
        summary: "Reviewed offboarding case",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
  );
  const listResponse = await getAuditTrailRoute(
    buildRequest(
      "/api/hr/offboarding/audit-trail?action=hr.offboarding.case.reviewed"
    )
  );

  installTestDeniedHrRuntimeTenantAccess();

  const deniedListResponse = await getAuditTrailRoute(
    buildRequest("/api/hr/offboarding/audit-trail")
  );

  assert.equal(writeResponse.status, 201);
  assert.equal(listResponse.status, 200);
  assert.equal(deniedListResponse.status, 403);

  const auditEntries = (await listResponse.json()) as Array<{ action: string }>;
  assert.equal(
    auditEntries.some(
      (entry) => entry.action === "hr.offboarding.case.reviewed"
    ),
    true
  );
});
