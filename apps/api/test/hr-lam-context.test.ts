import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createLamReadContext as createAttendanceLamReadContext,
  createLamWriteContext as createAttendanceLamWriteContext,
  createLamAttendanceExceptionsReadContext,
  createLamCorrectionApprovalContext,
  createLamCorrectionWriteContext,
} from "../app/api/hr/attendance/_lib/context.ts";
import {
  bindLamEmployeeSubmitBody,
  createLamApprovalContext,
  createLamBalanceWriteContext,
  createLamEmployeeSubmitReadContext,
  createLamNotificationReadContext,
  createLamPayrollExportContext,
  createLamReadContext,
  createLamWriteContext,
  getQuery,
} from "../app/api/hr/leave/_lib/context.ts";

const buildRequest = (headers: Record<string, string> = {}): Request =>
  new Request("http://localhost/api/hr/leave/leave-applications", {
    headers,
  });

test("createLamWriteContext parses approval workflow and HR fallback headers", () => {
  const context = createLamWriteContext(
    buildRequest({
      "x-actor-id": "actor-001",
      "x-company-id": "company-001",
      "x-tenant-id": "tenant-001",
      "x-can-read-lam": "true",
      "x-can-write-lam": "1",
      "x-lam-actor-employee-id": "mgr-001",
      "x-lam-resolved-step-approver-employee-ids": "mgr-001,,hr-001",
      "x-lam-hr-fallback-delegated": "true",
      "x-lam-resolved-hr-fallback-approver-employee-ids": "hr-001, hr-002",
      "x-lam-scoped-employee-id": "emp-001",
      "x-lam-team-employee-ids": "emp-001,emp-002",
      "x-lam-capabilities":
        "hr.lam.leave-applications.read, hr.lam.leave-applications.write",
    })
  );

  assert.equal(context.actorId, "actor-001");
  assert.equal(context.companyId, "company-001");
  assert.equal(context.tenantId, "tenant-001");
  assert.equal(context.canRead, true);
  assert.equal(context.canWrite, true);
  assert.equal(context.actorEmployeeId, "mgr-001");
  assert.deepEqual(context.resolvedStepApproverEmployeeIds, [
    "mgr-001",
    "hr-001",
  ]);
  assert.equal(context.hrFallbackDelegated, true);
  assert.deepEqual(context.resolvedHrFallbackApproverEmployeeIds, [
    "hr-001",
    "hr-002",
  ]);
  assert.equal(context.scopedEmployeeId, "emp-001");
  assert.deepEqual(context.teamEmployeeIds, ["emp-001", "emp-002"]);
  assert.deepEqual(context.grantedCapabilities, [
    "hr.lam.leave-applications.read",
    "hr.lam.leave-applications.write",
  ]);
});

test("createLamWriteContext treats hrFallbackDelegated false as explicit false", () => {
  const context = createLamWriteContext(
    buildRequest({
      "x-lam-hr-fallback-delegated": "false",
    })
  );

  assert.equal(context.hrFallbackDelegated, false);
});

test("createLamWriteContext omits optional headers when absent", () => {
  const context = createLamWriteContext(buildRequest());

  assert.equal(context.actorId, "api");
  assert.equal(context.canRead, false);
  assert.equal(context.canWrite, false);
  assert.equal(context.hrFallbackDelegated, undefined);
  assert.equal(context.actorEmployeeId, undefined);
  assert.equal(context.resolvedStepApproverEmployeeIds, undefined);
  assert.equal(context.resolvedHrFallbackApproverEmployeeIds, undefined);
  assert.equal(context.grantedCapabilities, undefined);
});

test("createLamApprovalContext injects leave approve capability", () => {
  const context = createLamApprovalContext(
    buildRequest({
      "x-lam-capabilities": "hr.lam.leave-applications.read",
    })
  );

  assert.deepEqual(context.grantedCapabilities, [
    "hr.lam.leave-applications.read",
    "hr.lam.leave-applications.approve",
  ]);
});

test("createLamApprovalContext preserves company and tenant scope for balance mutations", () => {
  const context = createLamApprovalContext(
    buildRequest({
      "x-company-id": "company-001",
      "x-tenant-id": "tenant-001",
      "x-lam-actor-employee-id": "mgr-001",
      "x-lam-resolved-step-approver-employee-ids": "mgr-001",
    })
  );

  assert.equal(context.companyId, "company-001");
  assert.equal(context.tenantId, "tenant-001");
  assert.equal(context.actorEmployeeId, "mgr-001");
  assert.deepEqual(context.resolvedStepApproverEmployeeIds, ["mgr-001"]);
  assert.ok(
    context.grantedCapabilities?.includes("hr.lam.leave-applications.approve")
  );
});

test("createLamBalanceWriteContext injects leave balance write capability when write access is granted", () => {
  const context = createLamBalanceWriteContext(
    buildRequest({
      "x-company-id": "company-001",
      "x-tenant-id": "tenant-001",
      "x-can-write-lam": "true",
      "x-lam-capabilities": "hr.lam.leave-applications.read",
    })
  );

  assert.equal(context.companyId, "company-001");
  assert.equal(context.tenantId, "tenant-001");
  assert.equal(context.canWrite, true);
  assert.ok(
    context.grantedCapabilities?.includes("hr.lam.leave-balances.write")
  );
  assert.ok(
    context.grantedCapabilities?.includes("hr.lam.leave-applications.read")
  );
});

test("createLamBalanceWriteContext does not inject balance write without write access", () => {
  const context = createLamBalanceWriteContext(
    buildRequest({
      "x-company-id": "company-001",
      "x-can-write-lam": "false",
    })
  );

  assert.equal(context.canWrite, false);
  assert.equal(context.grantedCapabilities, undefined);
});

test("createLamPayrollExportContext does not elevate generic write access to payroll export", () => {
  const context = createLamPayrollExportContext(
    buildRequest({
      "x-company-id": "company-001",
      "x-tenant-id": "tenant-001",
      "x-can-write-lam": "true",
      "x-lam-capabilities": "hr.lam.leave-applications.write",
    })
  );

  assert.equal(context.canWrite, true);
  assert.equal(
    context.grantedCapabilities?.includes("hr.lam.payroll-references.read"),
    false
  );
});

test("createLamPayrollExportContext preserves explicit payroll reference capability", () => {
  const context = createLamPayrollExportContext(
    buildRequest({
      "x-company-id": "company-001",
      "x-tenant-id": "tenant-001",
      "x-actor-id": "payroll-001",
      "x-lam-capabilities": "hr.lam.payroll-references.read",
    })
  );

  assert.equal(context.actorId, "payroll-001");
  assert.ok(
    context.grantedCapabilities?.includes("hr.lam.payroll-references.read")
  );
});

test("createLamCorrectionApprovalContext does not auto-grant correction write capability", () => {
  const context = createLamCorrectionApprovalContext(
    buildRequest({
      "x-lam-capabilities": "hr.lam.attendance-corrections.read",
    })
  );

  assert.deepEqual(context.grantedCapabilities, [
    "hr.lam.attendance-corrections.read",
  ]);
});

test("createLamCorrectionWriteContext injects correction write when generic write is granted", () => {
  const context = createLamCorrectionWriteContext(
    buildRequest({
      "x-company-id": "company-001",
      "x-can-write-lam": "true",
      "x-lam-capabilities": "hr.lam.attendance-corrections.read",
    })
  );

  assert.equal(context.canWrite, true);
  assert.ok(
    context.grantedCapabilities?.includes("hr.lam.attendance-corrections.write")
  );
});

test("bindLamEmployeeSubmitBody binds scoped employee without mutating input", () => {
  const body = {
    companyId: "company-001",
    employeeId: "emp-999",
    leaveTypeId: "lt-001",
  };
  const bound = bindLamEmployeeSubmitBody(
    buildRequest({ "x-lam-scoped-employee-id": "emp-001" }),
    body
  );

  assert.equal(body.employeeId, "emp-999");
  assert.equal(bound.employeeId, "emp-001");
  assert.notEqual(bound, body);
});

test("createLamEmployeeSubmitReadContext merges write capabilities and elevates read for leave-applications.read", () => {
  const context = createLamEmployeeSubmitReadContext(
    buildRequest({
      "x-can-read-lam": "false",
      "x-lam-scoped-employee-id": "emp-001",
      "x-lam-capabilities":
        "hr.lam.leave-applications.read, hr.lam.leave-applications.write",
    })
  );

  assert.equal(context.canRead, true);
  assert.equal(context.scopedEmployeeId, "emp-001");
  assert.deepEqual(context.grantedCapabilities, [
    "hr.lam.leave-applications.read",
    "hr.lam.leave-applications.write",
  ]);
});

test("createLamReadContext parses scoped employee and team headers", () => {
  const context = createLamReadContext(
    buildRequest({
      "x-can-read-lam": "1",
      "x-can-view-sensitive": "true",
      "x-lam-scoped-employee-id": "emp-001",
      "x-lam-team-employee-ids": "emp-001,emp-002",
    })
  );

  assert.equal(context.canRead, true);
  assert.equal(context.canViewSensitive, true);
  assert.equal(context.scopedEmployeeId, "emp-001");
  assert.deepEqual(context.teamEmployeeIds, ["emp-001", "emp-002"]);
});

test("createLamNotificationReadContext enables post-decision reads without x-can-read-lam", () => {
  const context = createLamNotificationReadContext(
    buildRequest({
      "x-company-id": "company-001",
      "x-lam-capabilities": "hr.lam.leave-applications.approve",
      "x-lam-actor-employee-id": "mgr-001",
    })
  );

  assert.equal(context.canRead, true);
  assert.ok(
    context.grantedCapabilities?.includes("hr.lam.leave-applications.read")
  );
  assert.ok(
    context.grantedCapabilities?.includes("hr.lam.leave-applications.approve")
  );
});

test("attendance createLamWriteContext matches leave approval header parsing", () => {
  const leaveContext = createLamWriteContext(
    buildRequest({
      "x-lam-actor-employee-id": "mgr-001",
      "x-lam-resolved-step-approver-employee-ids": "mgr-001",
      "x-lam-hr-fallback-delegated": "true",
      "x-lam-resolved-hr-fallback-approver-employee-ids": "hr-001",
    })
  );
  const attendanceContext = createAttendanceLamWriteContext(
    buildRequest({
      "x-lam-actor-employee-id": "mgr-001",
      "x-lam-resolved-step-approver-employee-ids": "mgr-001",
      "x-lam-hr-fallback-delegated": "true",
      "x-lam-resolved-hr-fallback-approver-employee-ids": "hr-001",
    })
  );

  assert.deepEqual(
    {
      actorEmployeeId: attendanceContext.actorEmployeeId,
      resolvedStepApproverEmployeeIds:
        attendanceContext.resolvedStepApproverEmployeeIds,
      hrFallbackDelegated: attendanceContext.hrFallbackDelegated,
      resolvedHrFallbackApproverEmployeeIds:
        attendanceContext.resolvedHrFallbackApproverEmployeeIds,
    },
    {
      actorEmployeeId: leaveContext.actorEmployeeId,
      resolvedStepApproverEmployeeIds:
        leaveContext.resolvedStepApproverEmployeeIds,
      hrFallbackDelegated: leaveContext.hrFallbackDelegated,
      resolvedHrFallbackApproverEmployeeIds:
        leaveContext.resolvedHrFallbackApproverEmployeeIds,
    }
  );
});

test("attendance createLamReadContext parses attendance corrections enabled header", () => {
  const context = createAttendanceLamReadContext(
    buildRequest({
      "x-company-id": "company-001",
      "x-lam-attendance-corrections-enabled": "false",
    })
  );

  assert.equal(context.attendanceCorrectionsEnabled, false);
});

test("attendance createLamReadContext matches leave read header parsing", () => {
  const headers = {
    "x-can-read-lam": "true",
    "x-lam-scoped-employee-id": "emp-001",
    "x-lam-team-employee-ids": "emp-001,emp-002",
  };

  assert.deepEqual(
    createAttendanceLamReadContext(buildRequest(headers)),
    createLamReadContext(buildRequest(headers))
  );
});

test("createLamAttendanceExceptionsReadContext preserves explicit corrections read capability", () => {
  const context = createLamAttendanceExceptionsReadContext(
    buildRequest({
      "x-company-id": "company-001",
      "x-tenant-id": "tenant-001",
      "x-can-read-lam": "false",
      "x-lam-capabilities": "hr.lam.attendance-corrections.read",
    })
  );

  assert.equal(context.canRead, false);
  assert.ok(
    context.grantedCapabilities?.includes("hr.lam.attendance-corrections.read")
  );
});

test("leave getQuery coerces numeric pagination and periodYear query params", () => {
  const query = getQuery(
    new Request(
      "http://localhost/api/hr/leave/leave-balances?page=2&pageSize=25&periodYear=2026"
    )
  );

  assert.equal(query.page, 2);
  assert.equal(query.pageSize, 25);
  assert.equal(query.periodYear, 2026);
});

test("leave getQuery joins repeated employeeIds query params", () => {
  const query = getQuery(
    new Request(
      "http://localhost/api/hr/leave/leave-report?employeeIds=emp-001&employeeIds=emp-002"
    )
  );

  assert.equal(query.employeeIds, "emp-001,emp-002");
});
