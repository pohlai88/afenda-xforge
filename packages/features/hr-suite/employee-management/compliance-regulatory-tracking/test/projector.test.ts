import assert from "node:assert/strict";
import { test } from "node:test";
import type {
  ComplianceEvidenceArtifact,
  ComplianceException,
  ComplianceObligation,
  ComplianceWorkerProfile,
} from "../src/index.ts";
import { deriveRequirementOutcome } from "../src/projector.ts";

const now = new Date();
const days = (offset: number): Date =>
  new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);

const createObligation = (
  overrides: Partial<ComplianceObligation> = {}
): ComplianceObligation => ({
  id: "obl-1",
  companyId: "acme",
  code: "CMP-001",
  title: "Compliance obligation",
  description: null,
  requirementKind: "document",
  severity: "high",
  scope: { companyId: "acme", countryCode: "TH" },
  expectedEvidenceType: "document",
  initialDueInDays: null,
  renewalEveryDays: null,
  effectiveFrom: days(-30),
  effectiveTo: null,
  active: true,
  jurisdictionSource: "policy",
  version: "2026.06",
  ownerTeam: null,
  createdAt: days(-30),
  updatedAt: days(-30),
  ...overrides,
});

const createWorker = (
  overrides: Partial<ComplianceWorkerProfile> = {}
): ComplianceWorkerProfile => ({
  id: "worker-1",
  companyId: "acme",
  employeeId: "emp-001",
  employeeNumber: "E001",
  displayName: "Alex Worker",
  legalEntityCode: "LE-TH",
  countryCode: "TH",
  workLocationCode: "BKK",
  employmentType: "full_time",
  workerCategory: "employee",
  departmentId: "ops",
  hireDate: days(-60),
  terminationDate: null,
  active: true,
  createdAt: days(-60),
  updatedAt: days(-60),
  ...overrides,
});

const createEvidence = (
  overrides: Partial<ComplianceEvidenceArtifact> = {}
): ComplianceEvidenceArtifact => ({
  id: "evidence-1",
  companyId: "acme",
  employeeId: "emp-001",
  obligationId: "obl-1",
  requirementId: "emp-001:obl-1",
  evidenceType: "document",
  title: "Evidence",
  sourceDocumentId: null,
  sourceDocumentNumber: null,
  sourceNotes: null,
  sensitivity: "restricted",
  status: "verified",
  issuedAt: days(-10),
  expiresAt: days(60),
  verifiedAt: days(-10),
  verifiedBy: "verifier",
  createdAt: days(-10),
  updatedAt: days(-10),
  ...overrides,
});

const createException = (
  overrides: Partial<ComplianceException> = {}
): ComplianceException => ({
  id: "exception-1",
  companyId: "acme",
  employeeId: "emp-001",
  obligationId: "obl-1",
  requirementId: "emp-001:obl-1",
  reason: "Exception reason",
  status: "open",
  ownerId: "owner-1",
  dueAt: days(7),
  waiverExpiresAt: null,
  approvedBy: null,
  approvedAt: null,
  resolvedAt: null,
  resolutionNotes: null,
  createdAt: days(-2),
  updatedAt: days(-1),
  ...overrides,
});

test("deriveRequirementOutcome returns expired for expired verified evidence", () => {
  const outcome = deriveRequirementOutcome({
    evidence: [
      createEvidence({
        expiresAt: days(-1),
        verifiedAt: days(-30),
      }),
    ],
    exception: null,
    obligation: createObligation(),
    worker: createWorker(),
  });

  assert.equal(outcome.status, "expired");
});

test("deriveRequirementOutcome returns at_risk for verified evidence nearing expiry", () => {
  const outcome = deriveRequirementOutcome({
    evidence: [
      createEvidence({
        expiresAt: days(10),
        verifiedAt: days(-5),
      }),
    ],
    exception: null,
    obligation: createObligation({
      initialDueInDays: null,
      renewalEveryDays: null,
    }),
    worker: createWorker({ hireDate: null }),
  });

  assert.equal(outcome.status, "at_risk");
});

test("deriveRequirementOutcome returns waived for active waived exception", () => {
  const outcome = deriveRequirementOutcome({
    evidence: [],
    exception: createException({
      status: "waived",
      waiverExpiresAt: days(14),
      updatedAt: days(0),
    }),
    obligation: createObligation({
      initialDueInDays: 5,
    }),
    worker: createWorker(),
  });

  assert.equal(outcome.status, "waived");
});

test("deriveRequirementOutcome returns non_compliant for rejected exception", () => {
  const outcome = deriveRequirementOutcome({
    evidence: [],
    exception: createException({
      status: "rejected",
      resolutionNotes: "Rejected by compliance manager",
      updatedAt: days(0),
    }),
    obligation: createObligation(),
    worker: createWorker(),
  });

  assert.equal(outcome.status, "non_compliant");
});

test("deriveRequirementOutcome returns overdue when due date has passed without evidence", () => {
  const outcome = deriveRequirementOutcome({
    evidence: [],
    exception: null,
    obligation: createObligation({
      initialDueInDays: 10,
    }),
    worker: createWorker({
      hireDate: days(-20),
    }),
  });

  assert.equal(outcome.status, "overdue");
});

test("deriveRequirementOutcome returns pending when due date is not yet reached", () => {
  const outcome = deriveRequirementOutcome({
    evidence: [],
    exception: null,
    obligation: createObligation({
      initialDueInDays: 45,
    }),
    worker: createWorker({
      hireDate: days(-5),
    }),
  });

  assert.equal(outcome.status, "pending");
});

test("deriveRequirementOutcome returns compliant for active verified evidence", () => {
  const outcome = deriveRequirementOutcome({
    evidence: [
      createEvidence({
        expiresAt: days(90),
        verifiedAt: days(-10),
      }),
    ],
    exception: null,
    obligation: createObligation({
      initialDueInDays: null,
      renewalEveryDays: null,
    }),
    worker: createWorker({
      hireDate: null,
    }),
  });

  assert.equal(outcome.status, "compliant");
});
