import {
  type AfendaRuntimeReferenceContract,
  afendaRuntimeReferenceContract,
} from "./runtime-reference.contract";
import {
  AFENDA_THEME_PRESET_NAMES,
  type AfendaThemePresetName,
} from "./registries/theme-preset.registry";

export const AFENDA_DESIGN_SYSTEM_ID = "afenda.design-system" as const;
export const AFENDA_DESIGN_SYSTEM_VERSION = "0.1.0" as const;

export const AFENDA_COLOR_MODES = ["light", "dark"] as const;

export const AFENDA_THEME_PRESETS = AFENDA_THEME_PRESET_NAMES;

export type AfendaColorMode = (typeof AFENDA_COLOR_MODES)[number];
export type AfendaThemePreset = AfendaThemePresetName;

export const AFENDA_GOVERNANCE_PRINCIPLES = [
  "Runtime guideline rules are authority; old token contracts are migration inputs.",
  "Design system contracts stay declarative and must not own auth, audit, permission, tenant, company, or execution logic.",
  "Agent output must satisfy accessibility, focus, form, state, performance, layout, and copy rules before UI work is complete.",
  "Tenant customization may change safe presentation only; it must not change security or business authority.",
  "Legacy Afenda contracts migrate through adapters and are deleted after consumers shift to the canonical contract.",
] as const;

export const AFENDA_ALLOWED_CUSTOMIZATION_KEYS = [
  "themePreset",
  "colorMode",
  "density",
  "fieldLabel",
  "fieldVisibility",
  "fieldOrder",
  "formLayout",
  "tableColumns",
  "filterPresets",
  "presentationTone",
  "safeActionExposure",
] as const;

export const AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS = [
  "permissionFinality",
  "tenantResolution",
  "companyGrant",
  "auditPolicy",
  "executionPipeline",
  "workflowAuthority",
  "businessRule",
  "databaseMutation",
] as const;

export type AfendaAllowedCustomizationKey =
  (typeof AFENDA_ALLOWED_CUSTOMIZATION_KEYS)[number];
export type AfendaForbiddenCustomizationKey =
  (typeof AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS)[number];

export type AfendaDesignSystemContract = {
  defaults: {
    themePreset: AfendaThemePreset;
  };
  description: string;
  governance: {
    allowedCustomization: readonly AfendaAllowedCustomizationKey[];
    forbiddenCustomization: readonly AfendaForbiddenCustomizationKey[];
    principles: readonly string[];
  };
  id: typeof AFENDA_DESIGN_SYSTEM_ID;
  runtimeReference: AfendaRuntimeReferenceContract;
  version: typeof AFENDA_DESIGN_SYSTEM_VERSION;
};

export const afendaDesignSystemContract = {
  id: AFENDA_DESIGN_SYSTEM_ID,
  version: AFENDA_DESIGN_SYSTEM_VERSION,
  description:
    "Canonical Afenda design-system contract that governs UI output and agent runtime checks.",
  defaults: {
    themePreset: "vercel-geist",
  },
  governance: {
    principles: AFENDA_GOVERNANCE_PRINCIPLES,
    allowedCustomization: AFENDA_ALLOWED_CUSTOMIZATION_KEYS,
    forbiddenCustomization: AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS,
  },
  runtimeReference: afendaRuntimeReferenceContract,
} as const satisfies AfendaDesignSystemContract;
