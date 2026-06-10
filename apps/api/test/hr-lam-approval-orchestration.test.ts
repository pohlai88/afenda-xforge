import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { hrOrgStore } from "../../../packages/features/hr-suite/employee-management/organizational-chart-hierarchy/src/store.ts";
import {
  resolveLeaveApprovalHrFallbackApproverEmployeeIds,
  resolveLeaveApprovalStepApproverEmployeeIds,
} from "../app/api/hr/_lib/lam-approval-orchestration.ts";

const scope = {
  companyId: "company-001",
  tenantId: "tenant-001",
} as const;

const writeContext = {
  actorId: "hr-admin",
  canRead: true,
  canWrite: true,
  companyId: scope.companyId,
  tenantId: scope.tenantId,
} as const;

beforeEach(() => {
  hrOrgStore.resetForTesting();
});

test("resolveLeaveApprovalStepApproverEmployeeIds resolves direct manager from org reporting lines", () => {
  hrOrgStore.upsertReportingLine(
    {
      employeeId: "emp-001",
      managerEmployeeId: "mgr-001",
      relationshipType: "direct",
    },
    writeContext
  );

  const approvers = resolveLeaveApprovalStepApproverEmployeeIds({
    scope,
    step: {
      kind: "direct_manager",
      order: 1,
    },
    subjectEmployeeId: "emp-001",
  });

  assert.deepEqual(approvers, ["mgr-001"]);
});

test("resolveLeaveApprovalStepApproverEmployeeIds resolves named approver from step ref", () => {
  const approvers = resolveLeaveApprovalStepApproverEmployeeIds({
    scope,
    step: {
      approverRef: "named-approver-001",
      kind: "named_approver",
      order: 1,
    },
    subjectEmployeeId: "emp-001",
  });

  assert.deepEqual(approvers, ["named-approver-001"]);
});

test("resolveLeaveApprovalHrFallbackApproverEmployeeIds returns empty without employee records", () => {
  const approvers = resolveLeaveApprovalHrFallbackApproverEmployeeIds({
    scope,
    subjectEmployeeId: "emp-unknown",
  });

  assert.deepEqual(approvers, []);
});
