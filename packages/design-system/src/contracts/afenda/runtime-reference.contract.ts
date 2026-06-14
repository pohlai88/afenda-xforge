import { z } from "zod";

import { AFENDA_RULE_REGISTRY } from "./rules";
import {
  AFENDA_RUNTIME_RULE_CATEGORIES,
  type AfendaRuntimeRuleCategory,
} from "./catalogs/runtime-rule-category.catalog";

export {
  AFENDA_RUNTIME_RULE_CATEGORIES,
  type AfendaRuntimeRuleCategory,
} from "./catalogs/runtime-rule-category.catalog";

export const AFENDA_RUNTIME_REFERENCE_ID = "afenda.runtime-reference" as const;
export const AFENDA_RUNTIME_REFERENCE_VERSION = "0.1.0" as const;

export const AFENDA_RUNTIME_RULE_SEVERITIES = [
  "error",
  "warning",
] as const;

export const AFENDA_RUNTIME_RULE_ENFORCEMENT_MODES = [
  "static",
  "manual",
  "hybrid",
] as const;

export type AfendaRuntimeRuleSeverity =
  (typeof AFENDA_RUNTIME_RULE_SEVERITIES)[number];
export type AfendaRuntimeRuleEnforcementMode =
  (typeof AFENDA_RUNTIME_RULE_ENFORCEMENT_MODES)[number];

export type AfendaRuntimeRule = {
  appliesTo: readonly string[];
  category: AfendaRuntimeRuleCategory;
  enforcement: AfendaRuntimeRuleEnforcementMode;
  forbidden?: readonly string[];
  id: string;
  rationale: string;
  references?: readonly string[];
  remediation: string;
  requirement: string;
  severity: AfendaRuntimeRuleSeverity;
};

export type AfendaRuntimeReferenceContract = {
  description: string;
  id: typeof AFENDA_RUNTIME_REFERENCE_ID;
  rules: readonly AfendaRuntimeRule[];
  source: {
    fetchedFrom: string;
    skill: "web-design-guidelines";
  };
  version: typeof AFENDA_RUNTIME_REFERENCE_VERSION;
};

export type AfendaRuleViolation = {
  filePath: string;
  line?: number;
  message: string;
  remediation: string;
  ruleId: string;
  severity: AfendaRuntimeRuleSeverity;
};

/** Canonical flat rule list — same array as `AFENDA_RULE_REGISTRY`. */
export const AFENDA_RUNTIME_RULES = AFENDA_RULE_REGISTRY;

export const afendaRuntimeRuleCategorySchema = z.enum(
  AFENDA_RUNTIME_RULE_CATEGORIES
);
export const afendaRuntimeRuleSeveritySchema = z.enum(
  AFENDA_RUNTIME_RULE_SEVERITIES
);
export const afendaRuntimeRuleEnforcementModeSchema = z.enum(
  AFENDA_RUNTIME_RULE_ENFORCEMENT_MODES
);

export const afendaRuntimeRuleSchema = z
  .object({
    appliesTo: z.array(z.string().trim().min(1)).readonly(),
    category: afendaRuntimeRuleCategorySchema,
    enforcement: afendaRuntimeRuleEnforcementModeSchema,
    forbidden: z.array(z.string().trim().min(1)).readonly().optional(),
    id: z.string().trim().min(1),
    rationale: z.string().trim().min(1),
    references: z.array(z.string().trim().min(1)).readonly().optional(),
    remediation: z.string().trim().min(1),
    requirement: z.string().trim().min(1),
    severity: afendaRuntimeRuleSeveritySchema,
  })
  .strict();

export const afendaRuntimeReferenceContractSchema = z
  .object({
    description: z.string().trim().min(1),
    id: z.literal(AFENDA_RUNTIME_REFERENCE_ID),
    rules: z.array(afendaRuntimeRuleSchema).readonly(),
    source: z
      .object({
        fetchedFrom: z.string().url(),
        skill: z.literal("web-design-guidelines"),
      })
      .strict(),
    version: z.literal(AFENDA_RUNTIME_REFERENCE_VERSION),
  })
  .strict();

export const afendaRuleViolationSchema = z
  .object({
    filePath: z.string().trim().min(1),
    line: z.number().int().positive().optional(),
    message: z.string().trim().min(1),
    remediation: z.string().trim().min(1),
    ruleId: z.string().trim().min(1),
    severity: afendaRuntimeRuleSeveritySchema,
  })
  .strict();

export const afendaRuntimeReferenceContract = {
  id: AFENDA_RUNTIME_REFERENCE_ID,
  version: AFENDA_RUNTIME_REFERENCE_VERSION,
  description:
    "Canonical Afenda runtime reference contract for governing IDE agent UI output.",
  source: {
    skill: "web-design-guidelines",
    fetchedFrom:
      "https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md",
  },
  rules: AFENDA_RUNTIME_RULES,
} as const satisfies AfendaRuntimeReferenceContract;

export function getAfendaRuntimeRule(id: string): AfendaRuntimeRule {
  const rule = AFENDA_RUNTIME_RULES.find((entry) => entry.id === id);
  if (!rule) {
    throw new Error(`Unknown Afenda runtime rule: ${id}`);
  }

  return rule;
}

export function validateAfendaRuntimeReferenceContract(): void {
  afendaRuntimeReferenceContractSchema.parse(afendaRuntimeReferenceContract);

  if (afendaRuntimeReferenceContract.rules !== AFENDA_RULE_REGISTRY) {
    throw new Error(
      "Afenda runtime reference must bind to AFENDA_RULE_REGISTRY without re-aggregation"
    );
  }

  const ids = AFENDA_RUNTIME_RULES.map((rule) => rule.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("AFENDA_RUNTIME_RULES contains duplicate ids");
  }
}
