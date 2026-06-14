import { z } from "zod";

import { defineGovernanceReferences } from "../../registry.schema";
import {
  AFENDA_RUNTIME_PIPELINE_GOVERNANCE_REFERENCES,
  AFENDA_RUNTIME_POLICY_GOVERNANCE_REFERENCES,
} from "../catalogs/governance-reference.catalog";
import {
  afendaRuleEvaluationActorIdentitySchema,
  afendaRuleEvaluationScopeSchema,
  afendaRuleEvaluationSubjectSchema,
  type AfendaRuleEvaluationActorIdentity,
  type AfendaRuleEvaluationScope,
  type AfendaRuleEvaluationSubject,
} from "./rule-evaluation.contract";

export const AFENDA_REMEDIATION_CONTRACT_ID =
  "afenda.remediation-contract" as const;
export const AFENDA_REMEDIATION_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_REMEDIATION_STATUSES = [
  "proposed",
  "approved",
  "in-progress",
  "applied",
  "verified",
  "rejected",
  "rolled-back",
] as const;

export const AFENDA_REMEDIATION_ACTION_TYPES = [
  "code-change",
  "token-change",
  "schema-change",
  "contract-change",
  "test-change",
  "documentation-change",
  "configuration-change",
  "manual-review",
  "suppression-request",
] as const;

export const AFENDA_REMEDIATION_RISK_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const AFENDA_REMEDIATION_AUTOMATION_LEVELS = [
  "manual",
  "agent-assisted",
  "agent-autofix",
  "ci-autofix",
] as const;

export const AFENDA_REMEDIATION_REVIEW_GATES = [
  "none",
  "code-owner",
  "design-system-owner",
  "accessibility-owner",
  "security-owner",
  "tenant-owner",
  "human-approval",
] as const;

export const AFENDA_REMEDIATION_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  ...AFENDA_RUNTIME_PIPELINE_GOVERNANCE_REFERENCES,
  ...AFENDA_RUNTIME_POLICY_GOVERNANCE_REFERENCES,
]);

export type AfendaRemediationStatus =
  (typeof AFENDA_REMEDIATION_STATUSES)[number];
export type AfendaRemediationActionType =
  (typeof AFENDA_REMEDIATION_ACTION_TYPES)[number];
export type AfendaRemediationRiskLevel =
  (typeof AFENDA_REMEDIATION_RISK_LEVELS)[number];
export type AfendaRemediationAutomationLevel =
  (typeof AFENDA_REMEDIATION_AUTOMATION_LEVELS)[number];
export type AfendaRemediationReviewGate =
  (typeof AFENDA_REMEDIATION_REVIEW_GATES)[number];

export type AfendaRemediationTarget = AfendaRuleEvaluationSubject;
export type AfendaRemediationScope = AfendaRuleEvaluationScope;

export type AfendaRemediationAction = {
  actionId: string;
  type: AfendaRemediationActionType;
  description: string;
  target: AfendaRemediationTarget;
  before?: string;
  after?: string;
  commands?: readonly string[];
};

export type AfendaRemediationVerification = {
  verificationId: string;
  description: string;
  commands: readonly string[];
  expectedOutcome: string;
  required: boolean;
};

export type AfendaRemediationRollback = {
  available: boolean;
  description?: string;
  commands?: readonly string[];
};

export type AfendaRemediationPlan = {
  remediationId: string;
  violationId: string;
  violationFingerprint: string;
  evaluationBatchId: string;
  ruleId: string;
  ruleSnapshotId?: string;
  status: AfendaRemediationStatus;
  risk: AfendaRemediationRiskLevel;
  automationLevel: AfendaRemediationAutomationLevel;
  reviewGate: AfendaRemediationReviewGate;
  scope?: AfendaRemediationScope;
  summary: string;
  rationale: string;
  actions: readonly AfendaRemediationAction[];
  verification: readonly AfendaRemediationVerification[];
  rollback: AfendaRemediationRollback;
  createdBy: AfendaRuleEvaluationActorIdentity;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  appliedBy?: AfendaRuleEvaluationActorIdentity;
  appliedAt?: string;
  verifiedBy?: AfendaRuleEvaluationActorIdentity;
  verifiedAt?: string;
  rejectedReason?: string;
  auditEventId?: string;
  correlationId?: string;
};

export type AfendaRemediationSummary = {
  total: number;
  proposed: number;
  approved: number;
  inProgress: number;
  applied: number;
  verified: number;
  rejected: number;
  rolledBack: number;
  blocking: number;
};

export type AfendaRemediationBatch = {
  batchId: string;
  violationBatchId: string;
  evaluationBatchId: string;
  contractId: typeof AFENDA_REMEDIATION_CONTRACT_ID;
  contractVersion: typeof AFENDA_REMEDIATION_CONTRACT_VERSION;
  scope?: AfendaRemediationScope;
  generatedBy: AfendaRuleEvaluationActorIdentity;
  generatedAt: string;
  plans: readonly AfendaRemediationPlan[];
  summary: AfendaRemediationSummary;
};

export const afendaRemediationStatusSchema = z.enum(
  AFENDA_REMEDIATION_STATUSES
);
export const afendaRemediationActionTypeSchema = z.enum(
  AFENDA_REMEDIATION_ACTION_TYPES
);
export const afendaRemediationRiskLevelSchema = z.enum(
  AFENDA_REMEDIATION_RISK_LEVELS
);
export const afendaRemediationAutomationLevelSchema = z.enum(
  AFENDA_REMEDIATION_AUTOMATION_LEVELS
);
export const afendaRemediationReviewGateSchema = z.enum(
  AFENDA_REMEDIATION_REVIEW_GATES
);

export const afendaRemediationActionSchema = z
  .object({
    actionId: z.string().trim().min(1),
    type: afendaRemediationActionTypeSchema,
    description: z.string().trim().min(1),
    target: afendaRuleEvaluationSubjectSchema,
    before: z.string().trim().min(1).optional(),
    after: z.string().trim().min(1).optional(),
    commands: z.array(z.string().trim().min(1)).readonly().optional(),
  })
  .strict();

export const afendaRemediationVerificationSchema = z
  .object({
    verificationId: z.string().trim().min(1),
    description: z.string().trim().min(1),
    commands: z.array(z.string().trim().min(1)).readonly(),
    expectedOutcome: z.string().trim().min(1),
    required: z.boolean(),
  })
  .strict();

export const afendaRemediationRollbackSchema = z
  .object({
    available: z.boolean(),
    description: z.string().trim().min(1).optional(),
    commands: z.array(z.string().trim().min(1)).readonly().optional(),
  })
  .strict()
  .refine(
    (rollback) => !rollback.available || Boolean(rollback.description),
    "Available rollback requires a description"
  );

export const afendaRemediationPlanSchema = z
  .object({
    remediationId: z.string().trim().min(1),
    violationId: z.string().trim().min(1),
    violationFingerprint: z.string().trim().min(1),
    evaluationBatchId: z.string().trim().min(1),
    ruleId: z.string().trim().min(1),
    ruleSnapshotId: z.string().trim().min(1).optional(),
    status: afendaRemediationStatusSchema,
    risk: afendaRemediationRiskLevelSchema,
    automationLevel: afendaRemediationAutomationLevelSchema,
    reviewGate: afendaRemediationReviewGateSchema,
    scope: afendaRuleEvaluationScopeSchema.optional(),
    summary: z.string().trim().min(1),
    rationale: z.string().trim().min(1),
    actions: z.array(afendaRemediationActionSchema).min(1).readonly(),
    verification: z
      .array(afendaRemediationVerificationSchema)
      .min(1)
      .readonly(),
    rollback: afendaRemediationRollbackSchema,
    createdBy: afendaRuleEvaluationActorIdentitySchema,
    createdAt: z.string().datetime({ offset: true }),
    approvedBy: z.string().trim().min(1).optional(),
    approvedAt: z.string().datetime({ offset: true }).optional(),
    appliedBy: afendaRuleEvaluationActorIdentitySchema.optional(),
    appliedAt: z.string().datetime({ offset: true }).optional(),
    verifiedBy: afendaRuleEvaluationActorIdentitySchema.optional(),
    verifiedAt: z.string().datetime({ offset: true }).optional(),
    rejectedReason: z.string().trim().min(1).optional(),
    auditEventId: z.string().trim().min(1).optional(),
    correlationId: z.string().trim().min(1).optional(),
  })
  .strict()
  .refine(
    (plan) =>
      !["approved", "in-progress", "applied", "verified"].includes(
        plan.status
      ) || Boolean(plan.approvedBy),
    "Approved, in-progress, applied, and verified remediations require approvedBy"
  )
  .refine(
    (plan) =>
      (plan.status !== "applied" && plan.status !== "verified") ||
      Boolean(plan.appliedAt),
    "Applied and verified remediations require appliedAt"
  )
  .refine(
    (plan) => plan.status !== "verified" || Boolean(plan.verifiedAt),
    "Verified remediations require verifiedAt"
  )
  .refine(
    (plan) => plan.status !== "rejected" || Boolean(plan.rejectedReason),
    "Rejected remediations require rejectedReason"
  )
  .refine(
    (plan) =>
      plan.reviewGate !== "none" ||
      (plan.risk !== "high" && plan.risk !== "critical"),
    "High and critical risk remediations require a review gate"
  )
  .refine(
    (plan) =>
      plan.automationLevel !== "agent-autofix" ||
      plan.risk === "low" ||
      plan.reviewGate !== "none",
    "Agent autofix above low risk requires a review gate"
  );

export const afendaRemediationSummarySchema = z
  .object({
    total: z.number().int().nonnegative(),
    proposed: z.number().int().nonnegative(),
    approved: z.number().int().nonnegative(),
    inProgress: z.number().int().nonnegative(),
    applied: z.number().int().nonnegative(),
    verified: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
    rolledBack: z.number().int().nonnegative(),
    blocking: z.number().int().nonnegative(),
  })
  .strict()
  .refine(
    (summary) =>
      summary.total ===
      summary.proposed +
        summary.approved +
        summary.inProgress +
        summary.applied +
        summary.verified +
        summary.rejected +
        summary.rolledBack,
    "Remediation summary counts must add up to total"
  );

export const afendaRemediationBatchSchema = z
  .object({
    batchId: z.string().trim().min(1),
    violationBatchId: z.string().trim().min(1),
    evaluationBatchId: z.string().trim().min(1),
    contractId: z.literal(AFENDA_REMEDIATION_CONTRACT_ID),
    contractVersion: z.literal(AFENDA_REMEDIATION_CONTRACT_VERSION),
    scope: afendaRuleEvaluationScopeSchema.optional(),
    generatedBy: afendaRuleEvaluationActorIdentitySchema,
    generatedAt: z.string().datetime({ offset: true }),
    plans: z.array(afendaRemediationPlanSchema).readonly(),
    summary: afendaRemediationSummarySchema,
  })
  .strict()
  .refine(
    (batch) => batch.plans.length === batch.summary.total,
    "Remediation batch summary total must equal plan count"
  );

export const afendaRemediationContract = {
  id: AFENDA_REMEDIATION_CONTRACT_ID,
  version: AFENDA_REMEDIATION_CONTRACT_VERSION,
  sourceRuntimeReferenceId: "afenda.runtime-reference",
  sourceRuleEvaluationContractId: "afenda.rule-evaluation-contract",
  sourceViolationContractId: "afenda.violation-contract",
  statuses: AFENDA_REMEDIATION_STATUSES,
  actionTypes: AFENDA_REMEDIATION_ACTION_TYPES,
  riskLevels: AFENDA_REMEDIATION_RISK_LEVELS,
  automationLevels: AFENDA_REMEDIATION_AUTOMATION_LEVELS,
  reviewGates: AFENDA_REMEDIATION_REVIEW_GATES,
  governanceReferences: AFENDA_REMEDIATION_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaRemediationPlan(
  plan: AfendaRemediationPlan
): void {
  afendaRemediationPlanSchema.parse(plan);
}

export function validateAfendaRemediationBatch(
  batch: AfendaRemediationBatch
): void {
  afendaRemediationBatchSchema.parse(batch);
}
