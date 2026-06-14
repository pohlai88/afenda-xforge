import { z } from "zod";

import { defineGovernanceReferences, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_GOV_APPROVAL_POLICY,
  AFENDA_GOV_AUDIT,
  AFENDA_GOV_HYDRATION,
  AFENDA_GOV_PERMISSION,
  AFENDA_GOV_QUALITY_GATE,
  AFENDA_GOV_REMEDIATION,
  AFENDA_GOV_RISK_POLICY,
  AFENDA_GOV_RUNTIME_DIAGNOSTICS,
  AFENDA_GOV_RUNTIME_REFERENCE,
  AFENDA_GOV_RULE_EVALUATION,
  AFENDA_GOV_SECURITY_UI,
  AFENDA_GOV_SUPPRESSION_POLICY,
  AFENDA_GOV_TENANT_CONTEXT,
  AFENDA_GOV_VERIFICATION,
  AFENDA_GOV_VIOLATION,
  AFENDA_RUNTIME_PIPELINE_GOVERNANCE_REFERENCES,
  AFENDA_RUNTIME_POLICY_GOVERNANCE_REFERENCES,
} from "../catalogs/governance-reference.catalog";
import {
  afendaRuleEvaluationActorIdentitySchema,
  afendaRuleEvaluationScopeSchema,
  type AfendaRuleEvaluationActorIdentity,
  type AfendaRuleEvaluationScope,
} from "./rule-evaluation.contract";

export const AFENDA_AGENT_GOVERNANCE_CONTRACT_ID =
  "afenda.agent-governance-contract" as const;
export const AFENDA_AGENT_GOVERNANCE_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_AGENT_GOVERNANCE_POLICY_TYPES = [
  "required-action",
  "forbidden-action",
  "approval-gate",
  "quality-gate",
  "escalation",
  "reporting",
] as const;

export const AFENDA_AGENT_GOVERNANCE_SEVERITIES = [
  "error",
  "warning",
  "info",
] as const;

export const AFENDA_AGENT_GOVERNANCE_TRIGGERS = [
  "blocking-violation",
  "manual-review-required",
  "high-risk-remediation",
  "critical-risk-remediation",
  "suppression-request",
  "security-sensitive-change",
  "tenant-scope-change",
  "audit-required-action",
  "quality-gate-failure",
] as const;

export const AFENDA_AGENT_GOVERNANCE_ACTIONS = [
  "evaluate-rules",
  "create-violation",
  "create-remediation-plan",
  "apply-approved-remediation",
  "run-verification",
  "record-audit-event",
  "escalate-to-owner",
  "request-human-approval",
  "stop-on-blocking-violation",
  "refuse-unsafe-suppression",
] as const;

export const AFENDA_AGENT_GOVERNANCE_FORBIDDEN_ACTIONS = [
  "ignore-blocking-violation",
  "suppress-without-reason",
  "suppress-blocking-without-expiry",
  "apply-high-risk-without-review",
  "weaken-rule-to-pass",
  "remove-test-to-pass",
  "bypass-runtime-reference",
  "change-legacy-master-authority",
  "cross-tenant-remediation-without-scope",
  "claim-complete-without-verification",
  "change-scope-to-pass",
  "delete-violation-to-pass",
  "skip-required-quality-gate",
  "claim-human-approval-without-record",
  "apply-remediation-outside-approved-scope",
] as const;

export const AFENDA_AGENT_GOVERNANCE_QUALITY_GATES = [
  "rule-evaluation",
  "violation-generation",
  "remediation-verification",
  "typecheck",
  "test",
  "lint",
  "architecture-boundary",
  "accessibility-check",
  "security-review",
  "tenant-scope-check",
  "hydration-check",
  "runtime-diagnostics-check",
] as const;

export const AFENDA_AGENT_GOVERNANCE_RISK_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const AFENDA_AGENT_GOVERNANCE_GOVERNANCE_REFERENCES =
  defineGovernanceReferences([
    ...AFENDA_RUNTIME_PIPELINE_GOVERNANCE_REFERENCES,
    ...AFENDA_RUNTIME_POLICY_GOVERNANCE_REFERENCES,
    AFENDA_GOV_PERMISSION,
    AFENDA_GOV_QUALITY_GATE,
    AFENDA_GOV_APPROVAL_POLICY,
    AFENDA_GOV_VERIFICATION,
    AFENDA_GOV_RUNTIME_DIAGNOSTICS,
    AFENDA_GOV_TENANT_CONTEXT,
    AFENDA_GOV_HYDRATION,
    AFENDA_GOV_SECURITY_UI,
  ]);

export type AfendaAgentGovernancePolicyType =
  (typeof AFENDA_AGENT_GOVERNANCE_POLICY_TYPES)[number];
export type AfendaAgentGovernanceSeverity =
  (typeof AFENDA_AGENT_GOVERNANCE_SEVERITIES)[number];
export type AfendaAgentGovernanceTrigger =
  (typeof AFENDA_AGENT_GOVERNANCE_TRIGGERS)[number];
export type AfendaAgentGovernanceAction =
  (typeof AFENDA_AGENT_GOVERNANCE_ACTIONS)[number];
export type AfendaAgentGovernanceForbiddenAction =
  (typeof AFENDA_AGENT_GOVERNANCE_FORBIDDEN_ACTIONS)[number];
export type AfendaAgentGovernanceQualityGate =
  (typeof AFENDA_AGENT_GOVERNANCE_QUALITY_GATES)[number];
export type AfendaAgentGovernanceRiskLevel =
  (typeof AFENDA_AGENT_GOVERNANCE_RISK_LEVELS)[number];

export type AfendaAgentGovernancePolicy = {
  policyId: string;
  type: AfendaAgentGovernancePolicyType;
  severity: AfendaAgentGovernanceSeverity;
  appliesTo?: readonly string[];
  scopeRequired?: boolean;
  riskLevel?: AfendaAgentGovernanceRiskLevel;
  triggers: readonly AfendaAgentGovernanceTrigger[];
  requiredActions?: readonly AfendaAgentGovernanceAction[];
  forbiddenActions?: readonly AfendaAgentGovernanceForbiddenAction[];
  qualityGates?: readonly AfendaAgentGovernanceQualityGate[];
  rationale: string;
  requirement: string;
  remediation: string;
  references: readonly string[];
};

export type AfendaAgentGovernanceDecision = {
  decisionId: string;
  policyId: string;
  violationId?: string;
  remediationPlanId?: string;
  evaluationBatchId?: string;
  evaluationResultId?: string;
  allowed: boolean;
  blocking: boolean;
  reason: string;
  scope?: AfendaRuleEvaluationScope;
  decidedBy: AfendaRuleEvaluationActorIdentity;
  decidedAt: string;
  approvalRequired?: boolean;
  approvedBy?: AfendaRuleEvaluationActorIdentity;
  approvedAt?: string;
  approvalReason?: string;
  verificationEvidence?: readonly string[];
  verificationPassed?: boolean;
  requiredActions: readonly AfendaAgentGovernanceAction[];
  forbiddenActions: readonly AfendaAgentGovernanceForbiddenAction[];
  qualityGates: readonly AfendaAgentGovernanceQualityGate[];
  auditEventId?: string;
  correlationId?: string;
};

export type AfendaAgentGovernanceContract = {
  id: typeof AFENDA_AGENT_GOVERNANCE_CONTRACT_ID;
  version: typeof AFENDA_AGENT_GOVERNANCE_CONTRACT_VERSION;
  sourceRuntimeReferenceId: "afenda.runtime-reference";
  sourceRuleEvaluationContractId: "afenda.rule-evaluation-contract";
  sourceViolationContractId: "afenda.violation-contract";
  sourceRemediationContractId: "afenda.remediation-contract";
  policies: readonly AfendaAgentGovernancePolicy[];
  governanceReferences: readonly string[];
};

export const afendaAgentGovernancePolicyTypeSchema = z.enum(
  AFENDA_AGENT_GOVERNANCE_POLICY_TYPES
);
export const afendaAgentGovernanceSeveritySchema = z.enum(
  AFENDA_AGENT_GOVERNANCE_SEVERITIES
);
export const afendaAgentGovernanceTriggerSchema = z.enum(
  AFENDA_AGENT_GOVERNANCE_TRIGGERS
);
export const afendaAgentGovernanceActionSchema = z.enum(
  AFENDA_AGENT_GOVERNANCE_ACTIONS
);
export const afendaAgentGovernanceForbiddenActionSchema = z.enum(
  AFENDA_AGENT_GOVERNANCE_FORBIDDEN_ACTIONS
);
export const afendaAgentGovernanceQualityGateSchema = z.enum(
  AFENDA_AGENT_GOVERNANCE_QUALITY_GATES
);
export const afendaAgentGovernanceRiskLevelSchema = z.enum(
  AFENDA_AGENT_GOVERNANCE_RISK_LEVELS
);

export const afendaAgentGovernancePolicySchema = z
  .object({
    policyId: z.string().trim().min(1),
    type: afendaAgentGovernancePolicyTypeSchema,
    severity: afendaAgentGovernanceSeveritySchema,
    appliesTo: z.array(z.string().trim().min(1)).readonly().optional(),
    scopeRequired: z.boolean().optional(),
    riskLevel: afendaAgentGovernanceRiskLevelSchema.optional(),
    triggers: z.array(afendaAgentGovernanceTriggerSchema).min(1).readonly(),
    requiredActions: z
      .array(afendaAgentGovernanceActionSchema)
      .readonly()
      .optional(),
    forbiddenActions: z
      .array(afendaAgentGovernanceForbiddenActionSchema)
      .readonly()
      .optional(),
    qualityGates: z
      .array(afendaAgentGovernanceQualityGateSchema)
      .readonly()
      .optional(),
    rationale: z.string().trim().min(1),
    requirement: z.string().trim().min(1),
    remediation: z.string().trim().min(1),
    references: z.array(z.string().trim().min(1)).min(1).readonly(),
  })
  .strict()
  .refine(
    (policy) =>
      Boolean(policy.requiredActions?.length) ||
      Boolean(policy.forbiddenActions?.length) ||
      Boolean(policy.qualityGates?.length),
    "Agent governance policies require at least one action or quality gate"
  );

export const afendaAgentGovernanceDecisionSchema = z
  .object({
    decisionId: z.string().trim().min(1),
    policyId: z.string().trim().min(1),
    violationId: z.string().trim().min(1).optional(),
    remediationPlanId: z.string().trim().min(1).optional(),
    evaluationBatchId: z.string().trim().min(1).optional(),
    evaluationResultId: z.string().trim().min(1).optional(),
    allowed: z.boolean(),
    blocking: z.boolean(),
    reason: z.string().trim().min(1),
    scope: afendaRuleEvaluationScopeSchema.optional(),
    decidedBy: afendaRuleEvaluationActorIdentitySchema,
    decidedAt: z.string().datetime({ offset: true }),
    approvalRequired: z.boolean().optional(),
    approvedBy: afendaRuleEvaluationActorIdentitySchema.optional(),
    approvedAt: z.string().datetime({ offset: true }).optional(),
    approvalReason: z.string().trim().min(1).optional(),
    verificationEvidence: z.array(z.string().trim().min(1)).readonly().optional(),
    verificationPassed: z.boolean().optional(),
    requiredActions: z.array(afendaAgentGovernanceActionSchema).readonly(),
    forbiddenActions: z
      .array(afendaAgentGovernanceForbiddenActionSchema)
      .readonly(),
    qualityGates: z.array(afendaAgentGovernanceQualityGateSchema).readonly(),
    auditEventId: z.string().trim().min(1).optional(),
    correlationId: z.string().trim().min(1).optional(),
  })
  .strict()
  .refine(
    (decision) =>
      decision.allowed || decision.blocking || decision.forbiddenActions.length > 0,
    "Disallowed governance decisions must be blocking or include forbidden actions"
  )
  .refine(
    (decision) =>
      !decision.approvalRequired ||
      decision.blocking ||
      (Boolean(decision.approvedBy) &&
        Boolean(decision.approvedAt) &&
        Boolean(decision.approvalReason)),
    "Approval-required decisions must be approved with identity, timestamp, and reason or remain blocking"
  )
  .refine(
    (decision) =>
      !decision.verificationPassed ||
      Boolean(decision.verificationEvidence?.length),
    "Passed verification decisions require verification evidence"
  );

export const afendaAgentGovernanceContractSchema = z
  .object({
    id: z.literal(AFENDA_AGENT_GOVERNANCE_CONTRACT_ID),
    version: z.literal(AFENDA_AGENT_GOVERNANCE_CONTRACT_VERSION),
    sourceRuntimeReferenceId: z.literal("afenda.runtime-reference"),
    sourceRuleEvaluationContractId: z.literal("afenda.rule-evaluation-contract"),
    sourceViolationContractId: z.literal("afenda.violation-contract"),
    sourceRemediationContractId: z.literal("afenda.remediation-contract"),
    policies: z.array(afendaAgentGovernancePolicySchema).min(1).readonly(),
    governanceReferences: governanceReferencesSchema,
  })
  .strict();

export const afendaAgentGovernanceContract = {
  id: AFENDA_AGENT_GOVERNANCE_CONTRACT_ID,
  version: AFENDA_AGENT_GOVERNANCE_CONTRACT_VERSION,
  sourceRuntimeReferenceId: "afenda.runtime-reference",
  sourceRuleEvaluationContractId: "afenda.rule-evaluation-contract",
  sourceViolationContractId: "afenda.violation-contract",
  sourceRemediationContractId: "afenda.remediation-contract",
  policies: [
    {
      policyId: "agent-governance.blocking-violation-stop",
      type: "required-action",
      severity: "error",
      appliesTo: ["violation", "remediation-plan", "ci", "agent"],
      scopeRequired: false,
      riskLevel: "high",
      triggers: ["blocking-violation"],
      requiredActions: [
        "create-violation",
        "create-remediation-plan",
        "stop-on-blocking-violation",
      ],
      forbiddenActions: ["ignore-blocking-violation"],
      qualityGates: ["rule-evaluation", "violation-generation", "typecheck", "test"],
      rationale:
        "Blocking violations must stop unsafe completion claims and force traceable remediation.",
      requirement:
        "Agents must stop, report, and create remediation plans for blocking violations.",
      remediation:
        "Create a violation record, propose a remediation plan, run required gates, and do not claim completion until verified.",
      references: [
        AFENDA_GOV_VIOLATION,
        AFENDA_GOV_REMEDIATION,
        AFENDA_GOV_AUDIT,
      ],
    },
    {
      policyId: "agent-governance.no-rule-weakening",
      type: "forbidden-action",
      severity: "error",
      appliesTo: ["runtime-reference", "rule", "test", "schema"],
      scopeRequired: false,
      riskLevel: "critical",
      triggers: ["quality-gate-failure"],
      forbiddenActions: [
        "weaken-rule-to-pass",
        "remove-test-to-pass",
        "delete-violation-to-pass",
        "skip-required-quality-gate",
      ],
      requiredActions: ["run-verification", "escalate-to-owner"],
      qualityGates: ["typecheck", "test", "architecture-boundary"],
      rationale:
        "Governance authority loses value if agents weaken rules or tests to manufacture a pass.",
      requirement:
        "Agents must fix implementation defects instead of weakening runtime rules, schemas, or tests.",
      remediation:
        "Restore the governing rule or test and correct the underlying implementation or remediation plan.",
      references: [
        AFENDA_GOV_RUNTIME_REFERENCE,
        AFENDA_GOV_RULE_EVALUATION,
        AFENDA_GOV_RISK_POLICY,
      ],
    },
    {
      policyId: "agent-governance.suppression-safety",
      type: "approval-gate",
      severity: "error",
      appliesTo: ["violation", "suppression-request", "blocking-violation"],
      scopeRequired: true,
      riskLevel: "high",
      triggers: ["suppression-request", "blocking-violation"],
      requiredActions: [
        "request-human-approval",
        "record-audit-event",
        "refuse-unsafe-suppression",
      ],
      forbiddenActions: [
        "suppress-without-reason",
        "suppress-blocking-without-expiry",
      ],
      rationale:
        "Suppression is a governance exception and must be time-bound, approved, and auditable.",
      requirement:
        "Agents must not suppress blocking violations without reason, expiry, approval, and audit evidence.",
      remediation:
        "Request approval, record the reason and expiry, and attach the audit event before suppression.",
      references: [
        AFENDA_GOV_VIOLATION,
        AFENDA_GOV_SUPPRESSION_POLICY,
        AFENDA_GOV_AUDIT,
      ],
    },
    {
      policyId: "agent-governance.scope-safe-remediation",
      type: "approval-gate",
      severity: "error",
      appliesTo: ["tenant", "company", "workspace", "remediation-plan"],
      scopeRequired: true,
      riskLevel: "critical",
      triggers: ["tenant-scope-change", "security-sensitive-change"],
      requiredActions: [
        "request-human-approval",
        "record-audit-event",
        "run-verification",
      ],
      forbiddenActions: [
        "cross-tenant-remediation-without-scope",
        "apply-remediation-outside-approved-scope",
        "change-scope-to-pass",
        "claim-human-approval-without-record",
      ],
      qualityGates: ["tenant-scope-check", "security-review"],
      rationale:
        "Scope-sensitive remediation can create cross-tenant defects if applied without bounded context.",
      requirement:
        "Agents must verify scope and approval before applying tenant-sensitive remediation.",
      remediation:
        "Confirm tenant/company/workspace scope, request approval, record audit evidence, and verify after change.",
      references: [
        AFENDA_GOV_TENANT_CONTEXT,
        AFENDA_GOV_PERMISSION,
        AFENDA_GOV_AUDIT,
      ],
    },
  ],
  governanceReferences: AFENDA_AGENT_GOVERNANCE_GOVERNANCE_REFERENCES,
} as const satisfies AfendaAgentGovernanceContract;

export function validateAfendaAgentGovernanceContract(): void {
  afendaAgentGovernanceContractSchema.parse(afendaAgentGovernanceContract);

  const policyIds = afendaAgentGovernanceContract.policies.map(
    (policy) => policy.policyId
  );
  if (new Set(policyIds).size !== policyIds.length) {
    throw new Error("AFENDA agent governance policies contain duplicate ids");
  }
}

export function validateAfendaAgentGovernanceDecision(
  decision: AfendaAgentGovernanceDecision
): void {
  afendaAgentGovernanceDecisionSchema.parse(decision);
}
