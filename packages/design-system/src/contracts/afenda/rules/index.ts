import type {
  AfendaRuntimeRule,
  AfendaRuntimeRuleCategory,
} from "../runtime-reference.contract";

export * from "./accessibility.rules";
export * from "./admin-shell.rules";
export * from "./anti-pattern.rules";
export * from "./audit.rules";
export * from "./content.rules";
export * from "./copy.rules";
export * from "./data-display.rules";
export * from "./feedback.rules";
export * from "./focus.rules";
export * from "./forms.rules";
export * from "./hydration.rules";
export * from "./images.rules";
export * from "./interaction.rules";
export * from "./layout.rules";
export * from "./locale.rules";
export * from "./motion.rules";
export * from "./mutation.rules";
export * from "./navigation.rules";
export * from "./observability.rules";
export * from "./performance.rules";
export * from "./route-state.rules";
export * from "./security-ui.rules";
export * from "./semantics.rules";
export * from "./tenant-context.rules";
export * from "./theming.rules";
export * from "./touch-layout.rules";
export * from "./typography.rules";
export * from "./visual-design.rules";

import { AFENDA_ACCESSIBILITY_RULES } from "./accessibility.rules";
import { AFENDA_ADMIN_SHELL_RULES } from "./admin-shell.rules";
import { AFENDA_ANTI_PATTERN_RULES } from "./anti-pattern.rules";
import { AFENDA_AUDIT_RULES } from "./audit.rules";
import { AFENDA_CONTENT_RULES } from "./content.rules";
import { AFENDA_COPY_RULES } from "./copy.rules";
import { AFENDA_DATA_DISPLAY_RULES } from "./data-display.rules";
import { AFENDA_FEEDBACK_RULES } from "./feedback.rules";
import { AFENDA_FOCUS_RULES } from "./focus.rules";
import { AFENDA_FORMS_RULES } from "./forms.rules";
import { AFENDA_HYDRATION_RULES } from "./hydration.rules";
import { AFENDA_IMAGES_RULES } from "./images.rules";
import { AFENDA_INTERACTION_RULES } from "./interaction.rules";
import { AFENDA_LAYOUT_RULES } from "./layout.rules";
import { AFENDA_LOCALE_RULES } from "./locale.rules";
import { AFENDA_MOTION_RULES } from "./motion.rules";
import { AFENDA_MUTATION_RULES } from "./mutation.rules";
import { AFENDA_NAVIGATION_RULES } from "./navigation.rules";
import { AFENDA_OBSERVABILITY_RULES } from "./observability.rules";
import { AFENDA_PERFORMANCE_RULES } from "./performance.rules";
import { AFENDA_ROUTE_STATE_RULES } from "./route-state.rules";
import { AFENDA_SECURITY_UI_RULES } from "./security-ui.rules";
import { AFENDA_SEMANTICS_RULES } from "./semantics.rules";
import { AFENDA_TENANT_CONTEXT_RULES } from "./tenant-context.rules";
import { AFENDA_THEMING_RULES } from "./theming.rules";
import { AFENDA_TOUCH_LAYOUT_RULES } from "./touch-layout.rules";
import { AFENDA_TYPOGRAPHY_RULES } from "./typography.rules";
import { AFENDA_VISUAL_DESIGN_RULES } from "./visual-design.rules";

export type AfendaRuleGroup = {
  category: AfendaRuntimeRuleCategory;
  rules: readonly AfendaRuntimeRule[];
};

export const AFENDA_RULE_GROUPS: readonly AfendaRuleGroup[] = [
  { category: "accessibility", rules: AFENDA_ACCESSIBILITY_RULES },
  { category: "admin-shell", rules: AFENDA_ADMIN_SHELL_RULES },
  { category: "anti-pattern", rules: AFENDA_ANTI_PATTERN_RULES },
  { category: "audit", rules: AFENDA_AUDIT_RULES },
  { category: "content", rules: AFENDA_CONTENT_RULES },
  { category: "copy", rules: AFENDA_COPY_RULES },
  { category: "data-display", rules: AFENDA_DATA_DISPLAY_RULES },
  { category: "feedback", rules: AFENDA_FEEDBACK_RULES },
  { category: "focus", rules: AFENDA_FOCUS_RULES },
  { category: "forms", rules: AFENDA_FORMS_RULES },
  { category: "hydration", rules: AFENDA_HYDRATION_RULES },
  { category: "images", rules: AFENDA_IMAGES_RULES },
  { category: "interaction", rules: AFENDA_INTERACTION_RULES },
  { category: "layout", rules: AFENDA_LAYOUT_RULES },
  { category: "locale", rules: AFENDA_LOCALE_RULES },
  { category: "motion", rules: AFENDA_MOTION_RULES },
  { category: "mutation", rules: AFENDA_MUTATION_RULES },
  { category: "navigation", rules: AFENDA_NAVIGATION_RULES },
  { category: "observability", rules: AFENDA_OBSERVABILITY_RULES },
  { category: "performance", rules: AFENDA_PERFORMANCE_RULES },
  { category: "route-state", rules: AFENDA_ROUTE_STATE_RULES },
  { category: "security-ui", rules: AFENDA_SECURITY_UI_RULES },
  { category: "semantics", rules: AFENDA_SEMANTICS_RULES },
  { category: "scope-integrity", rules: AFENDA_TENANT_CONTEXT_RULES },
  { category: "theming", rules: AFENDA_THEMING_RULES },
  { category: "touch-layout", rules: AFENDA_TOUCH_LAYOUT_RULES },
  { category: "typography", rules: AFENDA_TYPOGRAPHY_RULES },
  { category: "visual-design", rules: AFENDA_VISUAL_DESIGN_RULES },
] as const;

export const AFENDA_RULE_REGISTRY = AFENDA_RULE_GROUPS.flatMap(
  (group) => group.rules
) as readonly AfendaRuntimeRule[];

export function getAfendaRuleRegistryRule(ruleId: string): AfendaRuntimeRule {
  const rule = AFENDA_RULE_REGISTRY.find((item) => item.id === ruleId);

  if (!rule) {
    throw new Error(`Unknown AFENDA rule: ${ruleId}`);
  }

  return rule;
}

export function validateAfendaRuleRegistry(): void {
  const ruleIds = AFENDA_RULE_REGISTRY.map((rule) => rule.id);
  if (new Set(ruleIds).size !== ruleIds.length) {
    throw new Error("AFENDA rule registry contains duplicate rule ids");
  }

  for (const group of AFENDA_RULE_GROUPS) {
    const invalidRule = group.rules.find(
      (rule) => rule.category !== group.category
    );

    if (invalidRule) {
      throw new Error(
        `AFENDA rule ${invalidRule.id} is registered under ${group.category}`
      );
    }
  }
}
