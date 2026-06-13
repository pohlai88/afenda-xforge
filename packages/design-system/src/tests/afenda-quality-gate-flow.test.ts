import assert from "node:assert/strict";
import test from "node:test";

import {
  AFENDA_QUALITY_GATE_CONTRACT_ID,
  AFENDA_REMEDIATION_CONTRACT_ID,
  AFENDA_RULE_EVALUATION_CONTRACT_ID,
  AFENDA_VIOLATION_CONTRACT_ID,
  afendaQualityGateContract,
  afendaRemediationContract,
  afendaRuleEvaluationContract,
  afendaViolationContract,
  validateAfendaAgentGovernanceDecision,
  validateAfendaQualityGateDecision,
  validateAfendaRemediationBatch,
  validateAfendaRemediationPlan,
  validateAfendaRuleEvaluationBatch,
  validateAfendaRuleEvaluationResult,
  validateAfendaViolation,
  validateAfendaViolationBatch,
} from "../contracts/afenda";

test("afenda quality gate flow blocks unresolved runtime governance failures", () => {
  const occurredAt = "2026-06-13T00:00:00.000Z";
  const correlationId = "corr_afenda_quality_gate_flow_001";
  const scope = {
    tenantId: "tenant_demo",
    companyId: "company_demo",
    packageName: "@repo/design-system",
    featureId: "afenda-quality-gate-flow",
    moduleId: "afenda",
  } as const;
  const subject = {
    id: "src/Button.tsx:42",
    type: "component",
    filePath: "src/Button.tsx",
    component: "Button",
    line: 42,
  } as const;
  const staticCheck = {
    type: "static-check",
    name: "afenda-static-contract-check",
    version: "0.1.0",
  } as const;
  const agent = {
    type: "agent",
    name: "afenda-runtime-agent",
    version: "0.1.0",
  } as const;

  const evaluationResult = {
    ruleId: "accessibility.icon-button-label",
    ruleVersion: "0.1.0",
    ruleSnapshotId: "afenda.runtime-reference@0.1.0",
    category: "accessibility",
    severity: "error",
    enforcement: "static",
    status: "fail",
    blocking: true,
    scope,
    subject,
    evidence: [
      {
        type: "static-match",
        description: "Icon-only button has no accessible name.",
        locator: "src/Button.tsx:42",
        expected: "aria-label or visible text",
        actual: "icon only",
        confidence: 0.98,
      },
    ],
    message: "Icon-only buttons must expose a useful aria-label.",
    remediation: "Add aria-label that names the action.",
    references: ["WCAG:4.1.2", "WCAG:2.4.6"],
    evaluatedBy: staticCheck,
    evaluatedAt: occurredAt,
    confidence: 0.98,
  } as const;

  validateAfendaRuleEvaluationResult(evaluationResult);

  const evaluationBatch = {
    batchId: "batch_afenda_quality_gate_flow_001",
    runId: "run_afenda_quality_gate_flow_001",
    contractId: AFENDA_RULE_EVALUATION_CONTRACT_ID,
    contractVersion: afendaRuleEvaluationContract.version,
    sourceRuntimeReferenceId: "afenda.runtime-reference",
    scope,
    evaluatedBy: staticCheck,
    evaluatedAt: occurredAt,
    results: [evaluationResult],
    summary: {
      total: 1,
      pass: 0,
      fail: 1,
      warning: 0,
      manualReview: 0,
      notApplicable: 0,
      notEvaluated: 0,
      blocking: 1,
      averageConfidence: 0.98,
    },
  } as const;

  validateAfendaRuleEvaluationBatch(evaluationBatch);

  const violation = {
    violationId: "violation_afenda_quality_gate_flow_001",
    fingerprint:
      "accessibility.icon-button-label|src/Button.tsx:42|tenant_demo|company_demo",
    evaluationBatchId: evaluationBatch.batchId,
    evaluationRunId: evaluationBatch.runId,
    evaluationResultId: "src/Button.tsx:42:accessibility.icon-button-label",
    evaluationStatus: "fail",
    ruleId: evaluationResult.ruleId,
    ruleVersion: evaluationResult.ruleVersion,
    ruleSnapshotId: evaluationResult.ruleSnapshotId,
    category: evaluationResult.category,
    severity: evaluationResult.severity,
    priority: "critical",
    blocking: true,
    lifecycle: {
      status: "open",
      dueAt: "2026-06-20T00:00:00.000Z",
    },
    scope,
    location: subject,
    message: evaluationResult.message,
    requirement: "Icon-only buttons must expose a useful aria-label.",
    remediation: evaluationResult.remediation,
    evidence: evaluationResult.evidence,
    references: evaluationResult.references,
    detectedBy: staticCheck,
    detectedAt: occurredAt,
    owner: {
      id: "agent_afenda_runtime",
      type: "agent",
      name: "Afenda Runtime Agent",
    },
    auditEventId: "audit_evt_afenda_quality_gate_flow_violation_001",
    correlationId,
  } as const;

  validateAfendaViolation(violation);

  const violationBatch = {
    batchId: "violation_batch_afenda_quality_gate_flow_001",
    evaluationBatchId: evaluationBatch.batchId,
    evaluationRunId: evaluationBatch.runId,
    contractId: AFENDA_VIOLATION_CONTRACT_ID,
    contractVersion: afendaViolationContract.version,
    scope,
    generatedBy: staticCheck,
    generatedAt: occurredAt,
    violations: [violation],
    summary: {
      total: 1,
      open: 1,
      acknowledged: 0,
      inProgress: 0,
      resolved: 0,
      suppressed: 0,
      falsePositive: 0,
      blocking: 1,
      critical: 1,
      high: 0,
      medium: 0,
      low: 0,
    },
  } as const;

  validateAfendaViolationBatch(violationBatch);

  const remediationPlan = {
    remediationId: "remediation_afenda_quality_gate_flow_001",
    violationId: violation.violationId,
    violationFingerprint: violation.fingerprint,
    evaluationBatchId: evaluationBatch.batchId,
    ruleId: evaluationResult.ruleId,
    ruleSnapshotId: evaluationResult.ruleSnapshotId,
    status: "proposed",
    risk: "low",
    automationLevel: "agent-autofix",
    reviewGate: "none",
    scope,
    summary: "Add an accessible name to the icon-only button.",
    rationale:
      "Assistive technology users need a stable text alternative for icon-only controls.",
    actions: [
      {
        actionId: "action_add_icon_button_label",
        type: "code-change",
        description: "Add aria-label that names the button action.",
        target: subject,
        before: "<button><Icon /></button>",
        after: '<button aria-label="Save API Key"><Icon /></button>',
      },
    ],
    verification: [
      {
        verificationId: "verify_afenda_contract_tests",
        description: "Run design-system contract tests.",
        commands: ["pnpm test"],
        expectedOutcome: "All design-system tests pass.",
        required: true,
      },
    ],
    rollback: {
      available: true,
      description: "Revert the icon button label patch.",
    },
    createdBy: agent,
    createdAt: occurredAt,
    auditEventId: "audit_evt_afenda_quality_gate_flow_remediation_001",
    correlationId,
  } as const;

  validateAfendaRemediationPlan(remediationPlan);

  validateAfendaRemediationBatch({
    batchId: "remediation_batch_afenda_quality_gate_flow_001",
    violationBatchId: violationBatch.batchId,
    evaluationBatchId: evaluationBatch.batchId,
    contractId: AFENDA_REMEDIATION_CONTRACT_ID,
    contractVersion: afendaRemediationContract.version,
    scope,
    generatedBy: agent,
    generatedAt: occurredAt,
    plans: [remediationPlan],
    summary: {
      total: 1,
      proposed: 1,
      approved: 0,
      inProgress: 0,
      applied: 0,
      verified: 0,
      rejected: 0,
      rolledBack: 0,
      blocking: 1,
    },
  });

  const agentDecision = {
    decisionId: "agent_decision_afenda_quality_gate_flow_001",
    policyId: "agent-governance.blocking-violation-stop",
    violationId: violation.violationId,
    remediationPlanId: remediationPlan.remediationId,
    evaluationBatchId: evaluationBatch.batchId,
    evaluationResultId: violation.evaluationResultId,
    allowed: false,
    blocking: true,
    reason: "Blocking violation requires remediation before completion.",
    scope,
    decidedBy: agent,
    decidedAt: occurredAt,
    approvalRequired: true,
    verificationEvidence: ["contract fixture validated"],
    verificationPassed: true,
    requiredActions: [
      "create-violation",
      "create-remediation-plan",
      "stop-on-blocking-violation",
    ],
    forbiddenActions: ["ignore-blocking-violation"],
    qualityGates: ["rule-evaluation", "violation-generation", "test"],
    auditEventId: "audit_evt_afenda_quality_gate_flow_agent_001",
    correlationId,
  } as const;

  validateAfendaAgentGovernanceDecision(agentDecision);

  const gateDecision = {
    id: "quality_gate_decision_afenda_flow_001",
    gateId: "afenda.quality-gate.design-system",
    status: "block",
    blocking: true,
    reason:
      "Rule evaluation produced one open blocking violation with proposed remediation only.",
    sourceEvaluationIds: [violation.evaluationResultId],
    sourceViolationIds: [violation.violationId],
    remediationIds: [remediationPlan.remediationId],
    sourceAgentDecisionIds: [agentDecision.decisionId],
    scope,
    decidedBy: {
      type: "ci",
      name: "afenda-quality-gate-flow-test",
      version: "0.1.0",
    },
    decidedAt: occurredAt,
    correlationId,
  } as const;

  validateAfendaQualityGateDecision(gateDecision);

  assert.equal(afendaQualityGateContract.id, AFENDA_QUALITY_GATE_CONTRACT_ID);
  assert.equal(gateDecision.status, "block");
  assert.equal(gateDecision.blocking, true);
  assert.deepEqual(gateDecision.sourceViolationIds, [violation.violationId]);
  assert.deepEqual(gateDecision.remediationIds, [
    remediationPlan.remediationId,
  ]);
});
