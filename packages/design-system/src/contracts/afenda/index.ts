/**
 * Canonical Afenda design-system contract branch.
 *
 * This replaces the old `afenda/master` branch with a runtime reference contract
 * built from web-design-guidelines. Legacy contracts are migration inputs only.
 */
export * from "./design-system.contract";
export * from "./design-system.manifest";
export * from "./design-system.schema";
export * from "./globals-css.contract";
export * from "./presentation-metadata.contract";
export * from "./presentation-metadata.schema";
export * from "./presentation-resolution.contract";
export * from "./runtime-reference.contract";
export * from "./runtime-token-resolution.contract";
export * from "./token-ui.contract";
export * from "./visual-token.contract";
export * from "./catalogs/governance-reference.catalog";
export * from "./catalogs/module-lane.catalog";
export * from "./catalogs/runtime-rule-category.catalog";
export * from "./chart-usage.contract";
export * from "./customization";
export * from "./forms";
export * from "./gates/quality-gate.contract";
export * from "./hue-reservation.contract";
export * from "./registries";
export * from "./references/vercel-geist.contract";
export * from "./runtime";
export {
  AFENDA_RULE_GROUPS,
  AFENDA_RULE_REGISTRY,
  getAfendaRuleRegistryRule,
  validateAfendaRuleRegistry,
  type AfendaRuleGroup,
} from "./rules";
