import assert from "node:assert/strict";
import { test } from "node:test";
import { submitLamLeaveApplicationInputSchema } from "../src/contracts/command.contract.ts";
import {
  bindEmployeeLeaveApplicationSubmitInput,
  lamLeaveApplicationSubmitFieldLabels,
  mapLamMutationErrorToHttpStatus,
} from "../src/shared/leave-application-submit.ts";

test("AC-006 submit input schema ignores client status override", () => {
  const parsed = submitLamLeaveApplicationInputSchema.parse({
    employeeId: "emp-001",
    leaveTypeId: "lt-001",
    startDate: "2026-07-01",
    endDate: "2026-07-03",
    totalDays: 3,
    status: "approved",
  });

  assert.equal("status" in parsed, false);
});

test("AC-006 bindEmployeeLeaveApplicationSubmitInput binds self-scoped employeeId", () => {
  const bound = bindEmployeeLeaveApplicationSubmitInput(
    {
      employeeId: "emp-tampered",
      leaveTypeId: "lt-001",
    },
    "emp-001"
  );

  assert.equal(bound.employeeId, "emp-001");
});

test("AC-006 lamLeaveApplicationSubmitFieldLabels exposes online form fields", () => {
  assert.equal(lamLeaveApplicationSubmitFieldLabels.startDate, "Start Date");
  assert.equal(lamLeaveApplicationSubmitFieldLabels.leaveTypeId, "Leave Type");
  assert.equal(
    lamLeaveApplicationSubmitFieldLabels.employmentType,
    "Employee Category"
  );
});

test("AC-006 mapLamMutationErrorToHttpStatus maps access and validation failures", () => {
  assert.equal(
    mapLamMutationErrorToHttpStatus(
      "Write access denied for leave and attendance"
    ),
    403
  );
  assert.equal(
    mapLamMutationErrorToHttpStatus(
      "Insufficient leave balance: 1 day(s) remaining, 3 requested"
    ),
    422
  );
});
