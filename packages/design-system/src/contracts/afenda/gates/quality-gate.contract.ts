import { z } from "zod";

import {
  afendaRuleEvaluationActorIdentitySchema,
  afendaRuleEvaluationScopeSchema,
  type AfendaRuleEvaluationActorIdentity,
  type AfendaRuleEvaluationScope,
} from "../runtime/rule-evaluation.contract";

export const AFENDA_QUALITY_GATE_CONTRACT_ID =
  "afenda.quality-gate-contract" as const;
export const AFENDA_QUALITY_GATE_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_QUALITY_GATE_STATUSES = [
  "pass",
  "warn",
  "block",
] as const;

export const AFENDA_QUALITY_GATE_GOVERNANCE_REFERENCES = [
  "AFENDA:runtime-reference-contract",
  "AFENDA:rule-evaluation-contract",
  "AFENDA:violation-contract",
  "AFENDA:remediation-contract",
  "AFENDA:agent-governance-contract",
  "AFENDA:quality-gate-contract",
] as const;

export type AfendaQualityGateStatus =
  (typeof AFENDA_QUALITY_GATE_STATUSES)[number];
export type AfendaRuntimeScope = AfendaRuleEvaluationScope;

export type AfendaGateApproval = {
  approvedBy: AfendaRuleEvaluationActorIdentity;
  approvedAt: string;
  reason: string;
  auditEventId?: string;
};

export type AfendaQualityGateDecision = {
  id: string;
  gateId: string;
  status: AfendaQualityGateStatus;
  blocking: boolean;
  reason: string;
  sourceEvaluationIds: readonly string[];
  sourceViolationIds: readonly string[];
  remediationIds: readonly string[];
  sourceAgentDecisionIds?: readonly string[];
  scope?: AfendaRuntimeScope;
  approval?: AfendaGateApproval;
  decidedBy: AfendaRuleEvaluationActorIdentity;
  decidedAt: string;
  correlationId?: string;
};

export type AfendaQualityGateContract = {
  id: typeof AFENDA_QUALITY_GATE_CONTRACT_ID;
  version: typeof AFENDA_QUALITY_GATE_CONTRACT_VERSION;
  statuses: readonly AfendaQualityGateStatus[];
  sourceRuntimeReferenceId: "afenda.runtime-reference";
  sourceRuleEvaluationContractId: "afenda.rule-evaluation-contract";
  sourceViolationContractId: "afenda.violation-contract";
  sourceRemediationContractId: "afenda.remediation-contract";
  sourceAgentGovernanceContractId: "afenda.agent-governance-contract";
  governanceReferences: readonly string[];
};

export const afendaQualityGateStatusSchema = z.enum(
  AFENDA_QUALITY_GATE_STATUSES
);

export const afendaGateApprovalSchema = z
  .object({
    approvedBy: afendaRuleEvaluationActorIdentitySchema,
    approvedAt: z.string().datetime({ offset: true }),
    reason: z.string().trim().min(1),
    auditEventId: z.string().trim().min(1).optional(),
  })
  .strict();

export const afendaQualityGateDecisionSchema = z
  .object({
    id: z.string().trim().min(1),
    gateId: z.string().trim().min(1),
    status: afendaQualityGateStatusSchema,
    blocking: z.boolean(),
    reason: z.string().trim().min(1),
    sourceEvaluationIds: z.array(z.string().trim().min(1)).readonly(),
    sourceViolationIds: z.array(z.string().trim().min(1)).readonly(),
    remediationIds: z.array(z.string().trim().min(1)).readonly(),
    sourceAgentDecisionIds: z.array(z.string().trim().min(1)).readonly().optional(),
    scope: afendaRuleEvaluationScopeSchema.optional(),
    approval: afendaGateApprovalSchema.optional(),
    decidedBy: afendaRuleEvaluationActorIdentitySchema,
    decidedAt: z.string().datetime({ offset: true }),
    correlationId: z.string().trim().min(1).optional(),
  })
  .strict()
  .refine(
    (decision) => decision.status !== "pass" || !decision.blocking,
    "Passing quality gate decisions cannot be blocking"
  )
  .refine(
    (decision) => decision.status !== "block" || decision.blocking,
    "Blocking quality gate decisions must use status block"
  )
  .refine(
    (decision) =>
      decision.status !== "block" ||
      decision.sourceEvaluationIds.length > 0 ||
      decision.sourceViolationIds.length > 0 ||
      Boolean(decision.sourceAgentDecisionIds?.length),
    "Blocked quality gate decisions require evaluation, violation, or agent-governance source ids"
  )
  .refine(
    (decision) =>
      !decision.approval || decision.status !== "pass" || !decision.blocking,
    "Approved quality gate bypasses must not report a blocking pass"
  );

export const afendaQualityGateContractSchema = z
  .object({
    id: z.literal(AFENDA_QUALITY_GATE_CONTRACT_ID),
    version: z.literal(AFENDA_QUALITY_GATE_CONTRACT_VERSION),
    statuses: z.array(afendaQualityGateStatusSchema).min(1).readonly(),
    sourceRuntimeReferenceId: z.literal("afenda.runtime-reference"),
    sourceRuleEvaluationContractId: z.literal("afenda.rule-evaluation-contract"),
    sourceViolationContractId: z.literal("afenda.violation-contract"),
    sourceRemediationContractId: z.literal("afenda.remediation-contract"),
    sourceAgentGovernanceContractId: z.literal(
      "afenda.agent-governance-contract"
    ),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
  })
  .strict();

export const afendaQualityGateContract = {
  id: AFENDA_QUALITY_GATE_CONTRACT_ID,
  version: AFENDA_QUALITY_GATE_CONTRACT_VERSION,
  statuses: AFENDA_QUALITY_GATE_STATUSES,
  sourceRuntimeReferenceId: "afenda.runtime-reference",
  sourceRuleEvaluationContractId: "afenda.rule-evaluation-contract",
  sourceViolationContractId: "afenda.violation-contract",
  sourceRemediationContractId: "afenda.remediation-contract",
  sourceAgentGovernanceContractId: "afenda.agent-governance-contract",
  governanceReferences: AFENDA_QUALITY_GATE_GOVERNANCE_REFERENCES,
} as const satisfies AfendaQualityGateContract;

export function validateAfendaQualityGateContract(): void {
  afendaQualityGateContractSchema.parse(afendaQualityGateContract);
}

export function validateAfendaQualityGateDecision(
  decision: AfendaQualityGateDecision
): void {
  afendaQualityGateDecisionSchema.parse(decision);
}
