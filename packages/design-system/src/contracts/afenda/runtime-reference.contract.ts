import { z } from "zod";

import { AFENDA_ACCESSIBILITY_RULES } from "./rules/accessibility.rules";
import { AFENDA_ADMIN_SHELL_RULES } from "./rules/admin-shell.rules";
import { AFENDA_ANTI_PATTERN_RULES } from "./rules/anti-pattern.rules";
import { AFENDA_AUDIT_RULES } from "./rules/audit.rules";
import { AFENDA_CONTENT_RULES } from "./rules/content.rules";
import { AFENDA_COPY_RULES } from "./rules/copy.rules";
import { AFENDA_DATA_DISPLAY_RULES } from "./rules/data-display.rules";
import { AFENDA_FEEDBACK_RULES } from "./rules/feedback.rules";
import { AFENDA_FOCUS_RULES } from "./rules/focus.rules";
import { AFENDA_FORMS_RULES } from "./rules/forms.rules";
import { AFENDA_HYDRATION_RULES } from "./rules/hydration.rules";
import { AFENDA_IMAGES_RULES } from "./rules/images.rules";
import { AFENDA_INTERACTION_RULES } from "./rules/interaction.rules";
import { AFENDA_LAYOUT_RULES } from "./rules/layout.rules";
import { AFENDA_LOCALE_RULES } from "./rules/locale.rules";
import { AFENDA_MOTION_RULES } from "./rules/motion.rules";
import { AFENDA_MUTATION_RULES } from "./rules/mutation.rules";
import { AFENDA_NAVIGATION_RULES } from "./rules/navigation.rules";
import { AFENDA_OBSERVABILITY_RULES } from "./rules/observability.rules";
import { AFENDA_PERFORMANCE_RULES } from "./rules/performance.rules";
import { AFENDA_ROUTE_STATE_RULES } from "./rules/route-state.rules";
import { AFENDA_SECURITY_UI_RULES } from "./rules/security-ui.rules";
import { AFENDA_SEMANTICS_RULES } from "./rules/semantics.rules";
import { AFENDA_TENANT_CONTEXT_RULES } from "./rules/tenant-context.rules";
import { AFENDA_THEMING_RULES } from "./rules/theming.rules";
import { AFENDA_TOUCH_LAYOUT_RULES } from "./rules/touch-layout.rules";
import { AFENDA_TYPOGRAPHY_RULES } from "./rules/typography.rules";
import { AFENDA_VISUAL_DESIGN_RULES } from "./rules/visual-design.rules";

export const AFENDA_RUNTIME_REFERENCE_ID = "afenda.runtime-reference" as const;
export const AFENDA_RUNTIME_REFERENCE_VERSION = "0.1.0" as const;

export const AFENDA_RUNTIME_RULE_CATEGORIES = [
  "accessibility",
  "admin-shell",
  "audit",
  "focus",
  "forms",
  "motion",
  "typography",
  "content",
  "data-display",
  "feedback",
  "images",
  "performance",
  "mutation",
  "navigation",
  "observability",
  "route-state",
  "security-ui",
  "semantics",
  "scope-integrity",
  "touch-layout",
  "theming",
  "locale",
  "hydration",
  "interaction",
  "layout",
  "visual-design",
  "copy",
  "anti-pattern",
] as const;

export const AFENDA_RUNTIME_RULE_SEVERITIES = [
  "error",
  "warning",
] as const;

export const AFENDA_RUNTIME_RULE_ENFORCEMENT_MODES = [
  "static",
  "manual",
  "hybrid",
] as const;

export type AfendaRuntimeRuleCategory =
  (typeof AFENDA_RUNTIME_RULE_CATEGORIES)[number];
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

export const AFENDA_RUNTIME_RULES: readonly AfendaRuntimeRule[] = [
  ...AFENDA_ACCESSIBILITY_RULES,
  ...AFENDA_ADMIN_SHELL_RULES,
  ...AFENDA_AUDIT_RULES,
  ...AFENDA_FOCUS_RULES,
  ...AFENDA_INTERACTION_RULES,
  ...AFENDA_FORMS_RULES,
  ...AFENDA_ROUTE_STATE_RULES,
  ...AFENDA_NAVIGATION_RULES,
  ...AFENDA_SEMANTICS_RULES,
  ...AFENDA_LAYOUT_RULES,
  ...AFENDA_CONTENT_RULES,
  ...AFENDA_DATA_DISPLAY_RULES,
  ...AFENDA_FEEDBACK_RULES,
  ...AFENDA_VISUAL_DESIGN_RULES,
  ...AFENDA_MOTION_RULES,
  ...AFENDA_PERFORMANCE_RULES,
  ...AFENDA_MUTATION_RULES,
  ...AFENDA_OBSERVABILITY_RULES,
  ...AFENDA_SECURITY_UI_RULES,
  ...AFENDA_TENANT_CONTEXT_RULES,
  ...AFENDA_TYPOGRAPHY_RULES,
  ...AFENDA_IMAGES_RULES,
  ...AFENDA_TOUCH_LAYOUT_RULES,
  ...AFENDA_THEMING_RULES,
  ...AFENDA_LOCALE_RULES,
  ...AFENDA_HYDRATION_RULES,
  ...AFENDA_COPY_RULES,
  ...AFENDA_ANTI_PATTERN_RULES,
] as const satisfies readonly AfendaRuntimeRule[];

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

  const ids = AFENDA_RUNTIME_RULES.map((rule) => rule.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("AFENDA_RUNTIME_RULES contains duplicate ids");
  }
}
