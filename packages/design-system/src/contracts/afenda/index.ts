/**
 * Canonical Afenda design-system contract branch.
 *
 * This replaces the old `afenda/master` branch with a runtime reference contract
 * built from web-design-guidelines. Legacy contracts are migration inputs only.
 */
export * from "./design-system.contract";
export * from "./design-system.manifest";
export * from "./design-system.schema";
export * from "./runtime-reference.contract";
export * from "./token-ui.contract";
export * from "./catalogs/module-lane.catalog";
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
