import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  createEmployeeLifecycleState,
  getEmployeeLifecycleContractStatus,
  listEmployeeLifecycleContractReminderEntries,
  listEmployeeLifecycleContractReviewEntries,
  listEmployeeLifecycleContractStatuses,
  recordEmployeeLifecycleContractReminder,
  recordEmployeeLifecycleContractReview,
  renewEmployeeLifecycleContract,
  resetEmployeeLifecycleRepositoryForTesting,
  setEmployeeLifecycleRepositoryPathForTesting,
  startEmployeeLifecycleContract,
  upsertEmployeeLifecycleState,
} from "../src/index.ts";

const repositoryScope = {
  companyId: "co-contract",
  tenantId: "tenant-contract",
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

const daysFromNow = (days: number): Date =>
  new Date(Date.now() + days * DAY_MS);

const buildState = (
  employeeId: string
): ReturnType<typeof createEmployeeLifecycleState> =>
  createEmployeeLifecycleState({
    employeeId,
    companyId: repositoryScope.companyId,
    tenantId: repositoryScope.tenantId,
    initialStage: "active",
    effectiveAt: daysFromNow(-2),
    recordedAt: daysFromNow(-2),
  });

test("tracks contract expiry, reminders, reviews, and renewals", () => {
  const repositoryFilePath = join(
    mkdtempSync(join(tmpdir(), "employee-lifecycle-contract-")),
    "repository.json"
  );

  setEmployeeLifecycleRepositoryPathForTesting(repositoryFilePath);
  resetEmployeeLifecycleRepositoryForTesting();

  upsertEmployeeLifecycleState(buildState("emp-contract-active"));
  upsertEmployeeLifecycleState(buildState("emp-contract-due"));

  const activeContract = startEmployeeLifecycleContract(
    {
      employeeId: "emp-contract-active",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      expiryAt: daysFromNow(90),
      renewalReviewLeadDays: 30,
      renewalReminderLeadDays: 45,
      startedAt: daysFromNow(-1),
      recordedAt: daysFromNow(-1),
      actorId: "hr-admin",
      reason: "Initial fixed-term contract",
      metadata: {
        contractNumber: "CT-1001",
      },
    },
    repositoryScope
  );

  assert.equal(activeContract.contractStatus, "active");
  assert.equal(activeContract.isExpired, false);
  assert.equal(activeContract.isRenewalDue, false);
  assert.equal(activeContract.isReminderDue, false);
  assert.equal(activeContract.events[0]?.event, "started");

  const dueContract = startEmployeeLifecycleContract(
    {
      employeeId: "emp-contract-due",
      companyId: repositoryScope.companyId,
      tenantId: repositoryScope.tenantId,
      expiryAt: daysFromNow(7),
      renewalReviewLeadDays: 10,
      renewalReminderLeadDays: 14,
      startedAt: daysFromNow(-1),
      recordedAt: daysFromNow(-1),
      actorId: "hr-admin",
      reason: "Short fixed-term contract",
      metadata: {
        contractNumber: "CT-1002",
      },
    },
    repositoryScope
  );

  assert.equal(dueContract.contractStatus, "review_due");
  assert.equal(dueContract.isRenewalDue, true);
  assert.equal(dueContract.isReminderDue, false);

  const remindedContract = recordEmployeeLifecycleContractReminder(
    {
      employeeId: "emp-contract-due",
      reminderKind: "review_due",
      remindedAt: new Date(),
      actorId: "hr-partner",
      reason: "Upcoming renewal review reminder",
      metadata: {
        channel: "email",
      },
    },
    repositoryScope
  );

  assert.equal(remindedContract.reminderHistory.length, 1);
  assert.equal(remindedContract.isReminderDue, false);

  const reviewedContract = recordEmployeeLifecycleContractReview(
    {
      employeeId: "emp-contract-due",
      reviewedAt: new Date(),
      actorId: "hr-manager",
      reason: "Renewal review completed",
      approvalReference: "contract-review-001",
      notes: "Renewal recommended before expiry",
      metadata: {
        outcome: "renewal_recommended",
      },
    },
    repositoryScope
  );

  assert.equal(reviewedContract.reviewHistory.length, 1);
  assert.equal(reviewedContract.isRenewalDue, false);

  const renewedContract = renewEmployeeLifecycleContract(
    {
      employeeId: "emp-contract-due",
      expiryAt: daysFromNow(120),
      renewedAt: new Date(),
      actorId: "hr-director",
      reason: "Contract renewed after review",
      approvalReference: "contract-renew-001",
      metadata: {
        contractNumber: "CT-1002",
      },
    },
    repositoryScope
  );

  assert.equal(renewedContract.renewalCount, 1);
  assert.equal(renewedContract.contractStatus, "active");
  assert.equal(renewedContract.events.at(-1)?.event, "renewed");

  const contractStatus = getEmployeeLifecycleContractStatus(
    "emp-contract-due",
    repositoryScope
  );

  assert.ok(contractStatus);
  assert.equal(contractStatus.renewalCount, 1);
  assert.equal(
    listEmployeeLifecycleContractReminderEntries(
      "emp-contract-due",
      repositoryScope
    ).length,
    1
  );
  assert.equal(
    listEmployeeLifecycleContractReviewEntries(
      "emp-contract-due",
      repositoryScope
    ).length,
    1
  );

  const contractStatuses =
    listEmployeeLifecycleContractStatuses(repositoryScope);

  assert.equal(contractStatuses.length, 2);
  assert.deepEqual(
    contractStatuses.map((status) => status.employeeId),
    ["emp-contract-active", "emp-contract-due"]
  );
});
