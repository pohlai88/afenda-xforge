import { defineRegistry } from "../../registry.schema";

export const AFENDA_RUNTIME_RULE_CATEGORY_CATALOG_ID =
  "afenda.runtime-rule-category-catalog" as const;
export const AFENDA_RUNTIME_RULE_CATEGORY_CATALOG_VERSION = "0.1.0" as const;

/** Order matches `AFENDA_RULE_GROUPS` registration order. */
export const AFENDA_RUNTIME_RULE_CATEGORIES = defineRegistry([
  "accessibility",
  "admin-shell",
  "anti-pattern",
  "audit",
  "content",
  "copy",
  "data-display",
  "feedback",
  "focus",
  "forms",
  "hydration",
  "images",
  "interaction",
  "layout",
  "locale",
  "motion",
  "mutation",
  "navigation",
  "observability",
  "performance",
  "route-state",
  "security-ui",
  "semantics",
  "scope-integrity",
  "theming",
  "touch-layout",
  "typography",
  "visual-design",
]);

export type AfendaRuntimeRuleCategory =
  (typeof AFENDA_RUNTIME_RULE_CATEGORIES)[number];
