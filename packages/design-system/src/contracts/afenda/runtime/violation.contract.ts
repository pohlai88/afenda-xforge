import { z } from "zod";

import { defineGovernanceReferences } from "../../registry.schema";
import {
  AFENDA_RUNTIME_PIPELINE_GOVERNANCE_REFERENCES,
  AFENDA_RUNTIME_POLICY_GOVERNANCE_REFERENCES,
  AFENDA_GOV_PERMISSION,
  AFENDA_GOV_RUNTIME_DIAGNOSTICS,
  AFENDA_GOV_SLA,
} from "../catalogs/governance-reference.catalog";
import {
  afendaRuntimeRuleCategorySchema,
  afendaRuntimeRuleSeveritySchema,
  type AfendaRuntimeRuleCategory,
  type AfendaRuntimeRuleSeverity,
} from "../runtime-reference.contract";
import {
  afendaRuleEvaluationActorIdentitySchema,
  afendaRuleEvaluationEvidenceSchema,
  afendaRuleEvaluationScopeSchema,
  afendaRuleEvaluationSubjectSchema,
  type AfendaRuleEvaluationActorIdentity,
  type AfendaRuleEvaluationEvidence,
  type AfendaRuleEvaluationStatus,
  type AfendaRuleEvaluationScope,
  type AfendaRuleEvaluationSubject,
} from "./rule-evaluation.contract";

export const AFENDA_VIOLATION_CONTRACT_ID =
  "afenda.violation-contract" as const;
export const AFENDA_VIOLATION_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_VIOLATION_STATUSES = [
  "open",
  "acknowledged",
  "in-progress",
  "resolved",
  "suppressed",
  "false-positive",
] as const;

export const AFENDA_VIOLATION_PRIORITIES = [
  "critical",
  "high",
  "medium",
  "low",
] as const;

export const AFENDA_VIOLATION_EVALUATION_STATUSES = [
  "fail",
  "warning",
  "manual-review",
] as const satisfies readonly AfendaRuleEvaluationStatus[];

export const AFENDA_VIOLATION_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  ...AFENDA_RUNTIME_PIPELINE_GOVERNANCE_REFERENCES,
  ...AFENDA_RUNTIME_POLICY_GOVERNANCE_REFERENCES,
  AFENDA_GOV_PERMISSION,
  AFENDA_GOV_SLA,
  AFENDA_GOV_RUNTIME_DIAGNOSTICS,
]);

export type AfendaViolationStatus =
  (typeof AFENDA_VIOLATION_STATUSES)[number];
export type AfendaViolationPriority =
  (typeof AFENDA_VIOLATION_PRIORITIES)[number];
export type AfendaViolationEvaluationStatus =
  (typeof AFENDA_VIOLATION_EVALUATION_STATUSES)[number];

export type AfendaViolationOwner = {
  id: string;
  type: "agent" | "team" | "user" | "system";
  name?: string;
};

export type AfendaViolationLocation = AfendaRuleEvaluationSubject;
export type AfendaViolationScope = AfendaRuleEvaluationScope;
export type AfendaViolationEvidence = AfendaRuleEvaluationEvidence;

export type AfendaViolationLifecycle = {
  status: AfendaViolationStatus;
  dueAt?: string;
  escalatedAt?: string;
  escalationReason?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  suppressionReason?: string;
  suppressionExpiresAt?: string;
  suppressionApprovedBy?: string;
  suppressionAuditEventId?: string;
  falsePositiveReason?: string;
};

export type AfendaViolation = {
  violationId: string;
  fingerprint: string;
  evaluationBatchId: string;
  evaluationRunId?: string;
  evaluationResultId?: string;
  evaluationStatus: AfendaViolationEvaluationStatus;
  ruleId: string;
  ruleVersion?: string;
  ruleSnapshotId?: string;
  category: AfendaRuntimeRuleCategory;
  severity: AfendaRuntimeRuleSeverity;
  priority: AfendaViolationPriority;
  priorityOverrideReason?: string;
  blocking: boolean;
  lifecycle: AfendaViolationLifecycle;
  scope?: AfendaViolationScope;
  location: AfendaViolationLocation;
  message: string;
  requirement: string;
  remediation: string;
  evidence: readonly AfendaViolationEvidence[];
  references?: readonly string[];
  detectedBy: AfendaRuleEvaluationActorIdentity;
  detectedAt: string;
  owner?: AfendaViolationOwner;
  auditEventId?: string;
  correlationId?: string;
};

export type AfendaViolationSummary = {
  total: number;
  open: number;
  acknowledged: number;
  inProgress: number;
  resolved: number;
  suppressed: number;
  falsePositive: number;
  blocking: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
};

export type AfendaViolationBatch = {
  batchId: string;
  evaluationBatchId: string;
  evaluationRunId?: string;
  contractId: typeof AFENDA_VIOLATION_CONTRACT_ID;
  contractVersion: typeof AFENDA_VIOLATION_CONTRACT_VERSION;
  scope?: AfendaViolationScope;
  generatedBy: AfendaRuleEvaluationActorIdentity;
  generatedAt: string;
  violations: readonly AfendaViolation[];
  summary: AfendaViolationSummary;
};

export const afendaViolationStatusSchema = z.enum(AFENDA_VIOLATION_STATUSES);
export const afendaViolationPrioritySchema = z.enum(
  AFENDA_VIOLATION_PRIORITIES
);
export const afendaViolationEvaluationStatusSchema = z.enum(
  AFENDA_VIOLATION_EVALUATION_STATUSES
);

export const afendaViolationOwnerSchema = z
  .object({
    id: z.string().trim().min(1),
    type: z.enum(["agent", "team", "user", "system"]),
    name: z.string().trim().min(1).optional(),
  })
  .strict();

export const afendaViolationLifecycleSchema = z
  .object({
    status: afendaViolationStatusSchema,
    dueAt: z.string().datetime({ offset: true }).optional(),
    escalatedAt: z.string().datetime({ offset: true }).optional(),
    escalationReason: z.string().trim().min(1).optional(),
    acknowledgedBy: z.string().trim().min(1).optional(),
    acknowledgedAt: z.string().datetime({ offset: true }).optional(),
    resolvedBy: z.string().trim().min(1).optional(),
    resolvedAt: z.string().datetime({ offset: true }).optional(),
    suppressionReason: z.string().trim().min(1).optional(),
    suppressionExpiresAt: z.string().datetime({ offset: true }).optional(),
    suppressionApprovedBy: z.string().trim().min(1).optional(),
    suppressionAuditEventId: z.string().trim().min(1).optional(),
    falsePositiveReason: z.string().trim().min(1).optional(),
  })
  .strict()
  .refine(
    (lifecycle) =>
      !lifecycle.escalatedAt || Boolean(lifecycle.escalationReason),
    "Escalated violations require an escalation reason"
  )
  .refine(
    (lifecycle) =>
      lifecycle.status !== "suppressed" || Boolean(lifecycle.suppressionReason),
    "Suppressed violations require a suppression reason"
  )
  .refine(
    (lifecycle) =>
      lifecycle.status !== "false-positive" ||
      Boolean(lifecycle.falsePositiveReason),
    "False-positive violations require a false-positive reason"
  )
  .refine(
    (lifecycle) =>
      lifecycle.status !== "resolved" || Boolean(lifecycle.resolvedAt),
    "Resolved violations require resolvedAt"
  );

export const afendaViolationSchema = z
  .object({
    violationId: z.string().trim().min(1),
    fingerprint: z.string().trim().min(1),
    evaluationBatchId: z.string().trim().min(1),
    evaluationRunId: z.string().trim().min(1).optional(),
    evaluationResultId: z.string().trim().min(1).optional(),
    evaluationStatus: afendaViolationEvaluationStatusSchema,
    ruleId: z.string().trim().min(1),
    ruleVersion: z.string().trim().min(1).optional(),
    ruleSnapshotId: z.string().trim().min(1).optional(),
    category: afendaRuntimeRuleCategorySchema,
    severity: afendaRuntimeRuleSeveritySchema,
    priority: afendaViolationPrioritySchema,
    priorityOverrideReason: z.string().trim().min(1).optional(),
    blocking: z.boolean(),
    lifecycle: afendaViolationLifecycleSchema,
    scope: afendaRuleEvaluationScopeSchema.optional(),
    location: afendaRuleEvaluationSubjectSchema,
    message: z.string().trim().min(1),
    requirement: z.string().trim().min(1),
    remediation: z.string().trim().min(1),
    evidence: z.array(afendaRuleEvaluationEvidenceSchema).readonly(),
    references: z.array(z.string().trim().min(1)).readonly().optional(),
    detectedBy: afendaRuleEvaluationActorIdentitySchema,
    detectedAt: z.string().datetime({ offset: true }),
    owner: afendaViolationOwnerSchema.optional(),
    auditEventId: z.string().trim().min(1).optional(),
    correlationId: z.string().trim().min(1).optional(),
  })
  .strict()
  .refine(
    (violation) =>
      violation.lifecycle.status !== "suppressed" ||
      !violation.blocking ||
      Boolean(violation.lifecycle.suppressionExpiresAt),
    "Blocking suppressed violations require suppressionExpiresAt"
  )
  .refine(
    (violation) =>
      violation.lifecycle.status !== "suppressed" ||
      !violation.blocking ||
      Boolean(violation.lifecycle.suppressionApprovedBy),
    "Blocking suppressed violations require suppressionApprovedBy"
  )
  .refine(
    (violation) =>
      violation.lifecycle.status !== "suppressed" ||
      !violation.blocking ||
      Boolean(violation.lifecycle.suppressionAuditEventId),
    "Blocking suppressed violations require suppressionAuditEventId"
  )
  .refine(
    (violation) =>
      violation.severity !== "error" ||
      violation.priority !== "low" ||
      Boolean(violation.priorityOverrideReason),
    "Error severity with low priority requires priorityOverrideReason"
  );

export const afendaViolationSummarySchema = z
  .object({
    total: z.number().int().nonnegative(),
    open: z.number().int().nonnegative(),
    acknowledged: z.number().int().nonnegative(),
    inProgress: z.number().int().nonnegative(),
    resolved: z.number().int().nonnegative(),
    suppressed: z.number().int().nonnegative(),
    falsePositive: z.number().int().nonnegative(),
    blocking: z.number().int().nonnegative(),
    critical: z.number().int().nonnegative(),
    high: z.number().int().nonnegative(),
    medium: z.number().int().nonnegative(),
    low: z.number().int().nonnegative(),
  })
  .strict()
  .refine(
    (summary) =>
      summary.total ===
      summary.open +
        summary.acknowledged +
        summary.inProgress +
        summary.resolved +
        summary.suppressed +
        summary.falsePositive,
    "Violation lifecycle counts must add up to total"
  )
  .refine(
    (summary) =>
      summary.total ===
      summary.critical + summary.high + summary.medium + summary.low,
    "Violation priority counts must add up to total"
  );

export const afendaViolationBatchSchema = z
  .object({
    batchId: z.string().trim().min(1),
    evaluationBatchId: z.string().trim().min(1),
    evaluationRunId: z.string().trim().min(1).optional(),
    contractId: z.literal(AFENDA_VIOLATION_CONTRACT_ID),
    contractVersion: z.literal(AFENDA_VIOLATION_CONTRACT_VERSION),
    scope: afendaRuleEvaluationScopeSchema.optional(),
    generatedBy: afendaRuleEvaluationActorIdentitySchema,
    generatedAt: z.string().datetime({ offset: true }),
    violations: z.array(afendaViolationSchema).readonly(),
    summary: afendaViolationSummarySchema,
  })
  .strict()
  .refine(
    (batch) => batch.violations.length === batch.summary.total,
    "Violation batch summary total must equal violation count"
  );

export const afendaViolationContract = {
  id: AFENDA_VIOLATION_CONTRACT_ID,
  version: AFENDA_VIOLATION_CONTRACT_VERSION,
  sourceRuntimeReferenceId: "afenda.runtime-reference",
  sourceRuleEvaluationContractId: "afenda.rule-evaluation-contract",
  statuses: AFENDA_VIOLATION_STATUSES,
  priorities: AFENDA_VIOLATION_PRIORITIES,
  evaluationStatuses: AFENDA_VIOLATION_EVALUATION_STATUSES,
  governanceReferences: AFENDA_VIOLATION_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaViolation(violation: AfendaViolation): void {
  afendaViolationSchema.parse(violation);
}

export function validateAfendaViolationBatch(
  batch: AfendaViolationBatch
): void {
  afendaViolationBatchSchema.parse(batch);
}
