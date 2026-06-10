import assert from "node:assert/strict";
import test from "node:test";
import { permissionCatalog } from "@repo/permissions";
import {
  createLamConfigWriteContext,
  isLamOrchestrationHeaderMode,
} from "../app/api/hr/_lib/lam-governed-context.ts";

test("orchestration header mode is active in api test setup", () => {
  assert.equal(isLamOrchestrationHeaderMode(), true);
});

test("config write context denies when headers omit lam write capabilities", async () => {
  const request = new Request("http://localhost/api/hr/leave/leave-types", {
    headers: {
      "x-actor-id": "operator_1",
      "x-can-read-lam": "true",
      "x-can-write-lam": "true",
      "x-company-id": "company_1",
      "x-lam-capabilities": permissionCatalog.hrConsole.sectionsRead,
      "x-tenant-id": "tenant_1",
    },
    method: "POST",
  });

  const context = await createLamConfigWriteContext(request);

  assert.equal(context.canWrite, false);
  assert.ok(
    !context.grantedCapabilities?.includes(
      permissionCatalog.hrLam.leaveTypesWrite
    )
  );
});

test("config write context allows when headers include lam config capability", async () => {
  const request = new Request("http://localhost/api/hr/leave/leave-types", {
    headers: {
      "x-actor-id": "operator_1",
      "x-can-read-lam": "true",
      "x-can-write-lam": "true",
      "x-company-id": "company_1",
      "x-lam-capabilities": [
        permissionCatalog.hrLam.leaveTypesWrite,
        permissionCatalog.hrConsole.sectionsRead,
      ].join(","),
      "x-tenant-id": "tenant_1",
    },
    method: "POST",
  });

  const context = await createLamConfigWriteContext(request);

  assert.equal(context.canWrite, false);
  assert.ok(
    context.grantedCapabilities?.includes(
      permissionCatalog.hrLam.leaveTypesWrite
    )
  );
});

test("phase 2 config capabilities gate calendar and encashment writes", async () => {
  const calendarRequest = new Request(
    "http://localhost/api/hr/attendance/work-calendars",
    {
      headers: {
        "x-can-write-lam": "true",
        "x-company-id": "company_1",
        "x-lam-capabilities": permissionCatalog.hrLam.calendarsWrite,
        "x-tenant-id": "tenant_1",
      },
      method: "POST",
    }
  );
  const encashmentRequest = new Request(
    "http://localhost/api/hr/leave/leave-encashment-policies",
    {
      headers: {
        "x-can-write-lam": "true",
        "x-company-id": "company_1",
        "x-lam-capabilities": permissionCatalog.hrLam.encashmentWrite,
        "x-tenant-id": "tenant_1",
      },
      method: "POST",
    }
  );

  const calendarContext = await createLamConfigWriteContext(calendarRequest);
  const encashmentContext = await createLamConfigWriteContext(encashmentRequest);

  assert.equal(calendarContext.canWrite, false);
  assert.equal(encashmentContext.canWrite, false);
  assert.ok(
    calendarContext.grantedCapabilities?.includes(
      permissionCatalog.hrLam.calendarsWrite
    )
  );
  assert.ok(
    encashmentContext.grantedCapabilities?.includes(
      permissionCatalog.hrLam.encashmentWrite
    )
  );
});
