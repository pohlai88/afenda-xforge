import { z } from "zod";

import { defineGovernanceReferences } from "../../registry.schema";
import {
  AFENDA_GOV_EXECUTION_CONTEXT,
  AFENDA_RUNTIME_PIPELINE_GOVERNANCE_REFERENCES,
  XFORGE_GOV_PERMISSION_PIPELINE,
  XFORGE_GOV_SERVER_FIRST_UI,
} from "../catalogs/governance-reference.catalog";
import {
  AFENDA_RUNTIME_RULE_CATEGORIES,
  AFENDA_RUNTIME_RULE_ENFORCEMENT_MODES,
  AFENDA_RUNTIME_RULE_SEVERITIES,
  afendaRuntimeRuleCategorySchema,
  afendaRuntimeRuleEnforcementModeSchema,
  afendaRuntimeRuleSeveritySchema,
  type AfendaRuntimeRuleCategory,
  type AfendaRuntimeRuleEnforcementMode,
  type AfendaRuntimeRuleSeverity,
} from "../runtime-reference.contract";

export const AFENDA_RULE_EVALUATION_CONTRACT_ID =
  "afenda.rule-evaluation-contract" as const;
export const AFENDA_RULE_EVALUATION_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_RULE_EVALUATION_STATUSES = [
  "pass",
  "fail",
  "warning",
  "manual-review",
  "not-applicable",
  "not-evaluated",
] as const;

export const AFENDA_RULE_EVALUATION_EVIDENCE_TYPES = [
  "static-match",
  "ast-node",
  "dom-node",
  "token",
  "computed-style",
  "runtime-observation",
  "manual-note",
  "test-result",
  "schema-parse",
  "contract-check",
  "accessibility-check",
  "performance-metric",
  "security-check",
  "visual-regression",
] as const;

export const AFENDA_RULE_EVALUATION_SUBJECT_TYPES = [
  "file",
  "component",
  "route",
  "page",
  "token",
  "contract",
  "runtime-surface",
  "test",
  "theme",
  "rule",
  "rule-set",
  "manifest",
  "schema",
  "server-action",
  "api-route",
  "client-boundary",
] as const;

export const AFENDA_RULE_EVALUATION_ACTORS = [
  "static-check",
  "runtime-check",
  "manual-review",
  "agent",
  "test-suite",
  "ci",
  "unknown",
] as const;

export const AFENDA_RULE_EVALUATION_GOVERNANCE_REFERENCES =
  defineGovernanceReferences([
    ...AFENDA_RUNTIME_PIPELINE_GOVERNANCE_REFERENCES,
    AFENDA_GOV_EXECUTION_CONTEXT,
    XFORGE_GOV_SERVER_FIRST_UI,
    XFORGE_GOV_PERMISSION_PIPELINE,
  ]);

export type AfendaRuleEvaluationStatus =
  (typeof AFENDA_RULE_EVALUATION_STATUSES)[number];
export type AfendaRuleEvaluationEvidenceType =
  (typeof AFENDA_RULE_EVALUATION_EVIDENCE_TYPES)[number];
export type AfendaRuleEvaluationSubjectType =
  (typeof AFENDA_RULE_EVALUATION_SUBJECT_TYPES)[number];
export type AfendaRuleEvaluationActor =
  (typeof AFENDA_RULE_EVALUATION_ACTORS)[number];

export type AfendaRuleEvaluationScope = {
  tenantId?: string;
  companyId?: string;
  organizationId?: string;
  workspaceId?: string;
  route?: string;
  packageName?: string;
  featureId?: string;
  moduleId?: string;
};

export type AfendaRuleEvaluationActorIdentity = {
  type: AfendaRuleEvaluationActor;
  name: string;
  version?: string;
};

export type AfendaRuleEvaluationSubject = {
  id: string;
  type: AfendaRuleEvaluationSubjectType;
  filePath?: string;
  route?: string;
  component?: string;
  selector?: string;
  line?: number;
  column?: number;
};

export type AfendaRuleEvaluationEvidence = {
  type: AfendaRuleEvaluationEvidenceType;
  description: string;
  locator?: string;
  excerpt?: string;
  expected?: string;
  actual?: string;
  confidence?: number;
};

export type AfendaRuleEvaluationResult = {
  ruleId: string;
  ruleVersion?: string;
  ruleSnapshotId?: string;
  category: AfendaRuntimeRuleCategory;
  severity: AfendaRuntimeRuleSeverity;
  enforcement: AfendaRuntimeRuleEnforcementMode;
  status: AfendaRuleEvaluationStatus;
  blocking: boolean;
  scope?: AfendaRuleEvaluationScope;
  subject: AfendaRuleEvaluationSubject;
  evidence: readonly AfendaRuleEvaluationEvidence[];
  message: string;
  remediation: string;
  references?: readonly string[];
  evaluatedBy: AfendaRuleEvaluationActorIdentity;
  evaluatedAt: string;
  confidence: number;
};

export type AfendaRuleEvaluationSummary = {
  total: number;
  pass: number;
  fail: number;
  warning: number;
  manualReview: number;
  notApplicable: number;
  notEvaluated: number;
  blocking: number;
  averageConfidence: number;
};

export type AfendaRuleEvaluationBatch = {
  batchId: string;
  runId?: string;
  contractId: typeof AFENDA_RULE_EVALUATION_CONTRACT_ID;
  contractVersion: typeof AFENDA_RULE_EVALUATION_CONTRACT_VERSION;
  sourceRuntimeReferenceId: "afenda.runtime-reference";
  scope?: AfendaRuleEvaluationScope;
  evaluatedBy: AfendaRuleEvaluationActorIdentity;
  evaluatedAt: string;
  results: readonly AfendaRuleEvaluationResult[];
  summary: AfendaRuleEvaluationSummary;
};

export const afendaRuleEvaluationStatusSchema = z.enum(
  AFENDA_RULE_EVALUATION_STATUSES
);
export const afendaRuleEvaluationEvidenceTypeSchema = z.enum(
  AFENDA_RULE_EVALUATION_EVIDENCE_TYPES
);
export const afendaRuleEvaluationSubjectTypeSchema = z.enum(
  AFENDA_RULE_EVALUATION_SUBJECT_TYPES
);
export const afendaRuleEvaluationActorSchema = z.enum(
  AFENDA_RULE_EVALUATION_ACTORS
);

export const afendaRuleEvaluationScopeSchema = z
  .object({
    tenantId: z.string().trim().min(1).optional(),
    companyId: z.string().trim().min(1).optional(),
    organizationId: z.string().trim().min(1).optional(),
    workspaceId: z.string().trim().min(1).optional(),
    route: z.string().trim().min(1).optional(),
    packageName: z.string().trim().min(1).optional(),
    featureId: z.string().trim().min(1).optional(),
    moduleId: z.string().trim().min(1).optional(),
  })
  .strict();

export const afendaRuleEvaluationActorIdentitySchema = z
  .object({
    type: afendaRuleEvaluationActorSchema,
    name: z.string().trim().min(1),
    version: z.string().trim().min(1).optional(),
  })
  .strict();

export const afendaRuleEvaluationSubjectSchema = z
  .object({
    id: z.string().trim().min(1),
    type: afendaRuleEvaluationSubjectTypeSchema,
    filePath: z.string().trim().min(1).optional(),
    route: z.string().trim().min(1).optional(),
    component: z.string().trim().min(1).optional(),
    selector: z.string().trim().min(1).optional(),
    line: z.number().int().positive().optional(),
    column: z.number().int().positive().optional(),
  })
  .strict();

export const afendaRuleEvaluationEvidenceSchema = z
  .object({
    type: afendaRuleEvaluationEvidenceTypeSchema,
    description: z.string().trim().min(1),
    locator: z.string().trim().min(1).optional(),
    excerpt: z.string().trim().min(1).optional(),
    expected: z.string().trim().min(1).optional(),
    actual: z.string().trim().min(1).optional(),
    confidence: z.number().min(0).max(1).optional(),
  })
  .strict();

export const afendaRuleEvaluationResultSchema = z
  .object({
    ruleId: z.string().trim().min(1),
    ruleVersion: z.string().trim().min(1).optional(),
    ruleSnapshotId: z.string().trim().min(1).optional(),
    category: afendaRuntimeRuleCategorySchema,
    severity: afendaRuntimeRuleSeveritySchema,
    enforcement: afendaRuntimeRuleEnforcementModeSchema,
    status: afendaRuleEvaluationStatusSchema,
    blocking: z.boolean(),
    scope: afendaRuleEvaluationScopeSchema.optional(),
    subject: afendaRuleEvaluationSubjectSchema,
    evidence: z.array(afendaRuleEvaluationEvidenceSchema).readonly(),
    message: z.string().trim().min(1),
    remediation: z.string().trim().min(1),
    references: z.array(z.string().trim().min(1)).readonly().optional(),
    evaluatedBy: afendaRuleEvaluationActorIdentitySchema,
    evaluatedAt: z.string().datetime({ offset: true }),
    confidence: z.number().min(0).max(1),
  })
  .strict();

export const afendaRuleEvaluationSummarySchema = z
  .object({
    total: z.number().int().nonnegative(),
    pass: z.number().int().nonnegative(),
    fail: z.number().int().nonnegative(),
    warning: z.number().int().nonnegative(),
    manualReview: z.number().int().nonnegative(),
    notApplicable: z.number().int().nonnegative(),
    notEvaluated: z.number().int().nonnegative(),
    blocking: z.number().int().nonnegative(),
    averageConfidence: z.number().min(0).max(1),
  })
  .strict()
  .refine(
    (summary) =>
      summary.total ===
      summary.pass +
        summary.fail +
        summary.warning +
        summary.manualReview +
        summary.notApplicable +
        summary.notEvaluated,
    "Rule evaluation summary counts must add up to total"
  );

export const afendaRuleEvaluationBatchSchema = z
  .object({
    batchId: z.string().trim().min(1),
    runId: z.string().trim().min(1).optional(),
    contractId: z.literal(AFENDA_RULE_EVALUATION_CONTRACT_ID),
    contractVersion: z.literal(AFENDA_RULE_EVALUATION_CONTRACT_VERSION),
    sourceRuntimeReferenceId: z.literal("afenda.runtime-reference"),
    scope: afendaRuleEvaluationScopeSchema.optional(),
    evaluatedBy: afendaRuleEvaluationActorIdentitySchema,
    evaluatedAt: z.string().datetime({ offset: true }),
    results: z.array(afendaRuleEvaluationResultSchema).readonly(),
    summary: afendaRuleEvaluationSummarySchema,
  })
  .strict()
  .refine(
    (batch) => batch.results.length === batch.summary.total,
    "Rule evaluation batch summary total must equal result count"
  );

export const afendaRuleEvaluationContract = {
  id: AFENDA_RULE_EVALUATION_CONTRACT_ID,
  version: AFENDA_RULE_EVALUATION_CONTRACT_VERSION,
  sourceRuntimeReferenceId: "afenda.runtime-reference",
  categories: AFENDA_RUNTIME_RULE_CATEGORIES,
  severities: AFENDA_RUNTIME_RULE_SEVERITIES,
  enforcementModes: AFENDA_RUNTIME_RULE_ENFORCEMENT_MODES,
  statuses: AFENDA_RULE_EVALUATION_STATUSES,
  evidenceTypes: AFENDA_RULE_EVALUATION_EVIDENCE_TYPES,
  subjectTypes: AFENDA_RULE_EVALUATION_SUBJECT_TYPES,
  actors: AFENDA_RULE_EVALUATION_ACTORS,
  governanceReferences: AFENDA_RULE_EVALUATION_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaRuleEvaluationResult(
  result: AfendaRuleEvaluationResult
): void {
  afendaRuleEvaluationResultSchema.parse(result);
}

export function validateAfendaRuleEvaluationBatch(
  batch: AfendaRuleEvaluationBatch
): void {
  afendaRuleEvaluationBatchSchema.parse(batch);
}
