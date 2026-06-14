import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_RUNTIME_RULE_CATEGORIES,
  type AfendaRuntimeRuleCategory,
} from "../catalogs/runtime-rule-category.catalog";

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
export * from "./scope-integrity.rules";
export * from "./theming.rules";
export * from "./touch-layout.rules";
export * from "./typography.rules";
export * from "./visual-design.rules";

import * as accessibility from "./accessibility.rules";
import * as adminShell from "./admin-shell.rules";
import * as antiPattern from "./anti-pattern.rules";
import * as audit from "./audit.rules";
import * as content from "./content.rules";
import * as copy from "./copy.rules";
import * as dataDisplay from "./data-display.rules";
import * as feedback from "./feedback.rules";
import * as focus from "./focus.rules";
import * as forms from "./forms.rules";
import * as hydration from "./hydration.rules";
import * as images from "./images.rules";
import * as interaction from "./interaction.rules";
import * as layout from "./layout.rules";
import * as locale from "./locale.rules";
import * as motion from "./motion.rules";
import * as mutation from "./mutation.rules";
import * as navigation from "./navigation.rules";
import * as observability from "./observability.rules";
import * as performance from "./performance.rules";
import * as routeState from "./route-state.rules";
import * as securityUi from "./security-ui.rules";
import * as semantics from "./semantics.rules";
import * as scopeIntegrity from "./scope-integrity.rules";
import * as theming from "./theming.rules";
import * as touchLayout from "./touch-layout.rules";
import * as typography from "./typography.rules";
import * as visualDesign from "./visual-design.rules";

export type AfendaRuleGroup = {
  category: AfendaRuntimeRuleCategory;
  rules: readonly AfendaRuntimeRule[];
};

export const AFENDA_RULE_GROUPS: readonly AfendaRuleGroup[] = [
  { category: "accessibility", rules: accessibility.AFENDA_ACCESSIBILITY_RULES },
  { category: "admin-shell", rules: adminShell.AFENDA_ADMIN_SHELL_RULES },
  { category: "anti-pattern", rules: antiPattern.AFENDA_ANTI_PATTERN_RULES },
  { category: "audit", rules: audit.AFENDA_AUDIT_RULES },
  { category: "content", rules: content.AFENDA_CONTENT_RULES },
  { category: "copy", rules: copy.AFENDA_COPY_RULES },
  { category: "data-display", rules: dataDisplay.AFENDA_DATA_DISPLAY_RULES },
  { category: "feedback", rules: feedback.AFENDA_FEEDBACK_RULES },
  { category: "focus", rules: focus.AFENDA_FOCUS_RULES },
  { category: "forms", rules: forms.AFENDA_FORMS_RULES },
  { category: "hydration", rules: hydration.AFENDA_HYDRATION_RULES },
  { category: "images", rules: images.AFENDA_IMAGES_RULES },
  { category: "interaction", rules: interaction.AFENDA_INTERACTION_RULES },
  { category: "layout", rules: layout.AFENDA_LAYOUT_RULES },
  { category: "locale", rules: locale.AFENDA_LOCALE_RULES },
  { category: "motion", rules: motion.AFENDA_MOTION_RULES },
  { category: "mutation", rules: mutation.AFENDA_MUTATION_RULES },
  { category: "navigation", rules: navigation.AFENDA_NAVIGATION_RULES },
  { category: "observability", rules: observability.AFENDA_OBSERVABILITY_RULES },
  { category: "performance", rules: performance.AFENDA_PERFORMANCE_RULES },
  { category: "route-state", rules: routeState.AFENDA_ROUTE_STATE_RULES },
  { category: "security-ui", rules: securityUi.AFENDA_SECURITY_UI_RULES },
  { category: "semantics", rules: semantics.AFENDA_SEMANTICS_RULES },
  { category: "scope-integrity", rules: scopeIntegrity.AFENDA_SCOPE_INTEGRITY_RULES },
  { category: "theming", rules: theming.AFENDA_THEMING_RULES },
  { category: "touch-layout", rules: touchLayout.AFENDA_TOUCH_LAYOUT_RULES },
  { category: "typography", rules: typography.AFENDA_TYPOGRAPHY_RULES },
  { category: "visual-design", rules: visualDesign.AFENDA_VISUAL_DESIGN_RULES },
];

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

  const groupCategoryOrder = AFENDA_RULE_GROUPS.map((group) => group.category).join(
    "|"
  );
  const canonicalCategoryOrder = AFENDA_RUNTIME_RULE_CATEGORIES.join("|");
  if (groupCategoryOrder !== canonicalCategoryOrder) {
    throw new Error(
      "AFENDA_RULE_GROUPS category order must match AFENDA_RUNTIME_RULE_CATEGORIES"
    );
  }
}
