import { z } from "zod";

import {
  AFENDA_ALLOWED_CUSTOMIZATION_KEYS,
  AFENDA_DESIGN_SYSTEM_ID,
  AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS,
  type AfendaAllowedCustomizationKey,
} from "../design-system.contract";
import {
  AFENDA_ERP_VISUAL_LANE_IDS,
  afendaDensityRegistryModeSchema,
  afendaErpVisualLaneIdSchema,
  afendaLaneColorScaleSchema,
  afendaThemePresetRegistryNameSchema,
  type AfendaErpVisualLaneId,
  type AfendaLaneColorScale,
  type AfendaLaneColorScaleField,
} from "../registries";

export const AFENDA_TENANT_BRANDING_CONTRACT_ID =
  "afenda.tenant-branding-contract" as const;
export const AFENDA_TENANT_BRANDING_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_TENANT_BRANDING_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:tenant-context-contract",
  "AFENDA:theming-contract",
  "AFENDA:theme-preset-registry",
  "AFENDA:visual-design-contract",
  "AFENDA:security-ui-contract",
  "XFORGE:tenant-company-scope",
] as const;

export const afendaPartialLaneColorScaleSchema =
  afendaLaneColorScaleSchema.partial();

export const afendaPartialLaneColorModeScaleSchema = z
  .object({
    light: afendaPartialLaneColorScaleSchema.optional(),
    dark: afendaPartialLaneColorScaleSchema.optional(),
  })
  .strict();

export const afendaTenantBrandingSettingsSchema = z
  .object({
    themePreset: afendaThemePresetRegistryNameSchema,
    density: afendaDensityRegistryModeSchema.optional(),
    moduleLaneOverrides: z
      .record(z.string().trim().min(1), afendaErpVisualLaneIdSchema)
      .optional(),
    laneColorOverrides: z
      .object({
        byLane: z
          .record(afendaErpVisualLaneIdSchema, afendaPartialLaneColorModeScaleSchema)
          .optional(),
        byFeature: z
          .record(z.string().trim().min(1), afendaPartialLaneColorModeScaleSchema)
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type AfendaTenantBrandingSettings = z.infer<
  typeof afendaTenantBrandingSettingsSchema
>;

export type AfendaPartialLaneColorScale = z.infer<
  typeof afendaPartialLaneColorScaleSchema
>;

export type AfendaPartialLaneColorModeScale = z.infer<
  typeof afendaPartialLaneColorModeScaleSchema
>;

export const AFENDA_TENANT_BRANDING_IMPLEMENTED_CUSTOMIZATION_KEYS = [
  "themePreset",
  "density",
] as const satisfies readonly AfendaAllowedCustomizationKey[];

export const AFENDA_TENANT_BRANDING_DEFERRED_CUSTOMIZATION_KEYS = [
  "colorMode",
  "presentationTone",
] as const satisfies readonly AfendaAllowedCustomizationKey[];

export const AFENDA_TENANT_BRANDING_ALLOWED_CUSTOMIZATION_KEYS = [
  "themePreset",
  "colorMode",
  "density",
  "presentationTone",
] as const satisfies readonly AfendaAllowedCustomizationKey[];

export type AfendaTenantBrandingContract = {
  allowedCustomization: readonly AfendaAllowedCustomizationKey[];
  defaults: AfendaTenantBrandingSettings;
  description: string;
  forbiddenCustomization: readonly string[];
  governanceReferences: readonly string[];
  id: typeof AFENDA_TENANT_BRANDING_CONTRACT_ID;
  parentContractId: typeof AFENDA_DESIGN_SYSTEM_ID;
  version: typeof AFENDA_TENANT_BRANDING_CONTRACT_VERSION;
};

export const AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS = {
  themePreset: "afenda",
} as const satisfies AfendaTenantBrandingSettings;

export const afendaTenantBrandingLaneIdSchema = z.enum(
  AFENDA_ERP_VISUAL_LANE_IDS as unknown as [
    AfendaErpVisualLaneId,
    ...AfendaErpVisualLaneId[],
  ]
);

export const afendaTenantBrandingContract = {
  id: AFENDA_TENANT_BRANDING_CONTRACT_ID,
  version: AFENDA_TENANT_BRANDING_CONTRACT_VERSION,
  parentContractId: AFENDA_DESIGN_SYSTEM_ID,
  description:
    "Afenda tenant branding customization boundary for safe presentation-only tenant settings.",
  defaults: AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS,
  allowedCustomization: AFENDA_TENANT_BRANDING_ALLOWED_CUSTOMIZATION_KEYS,
  forbiddenCustomization: AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS,
  governanceReferences: AFENDA_TENANT_BRANDING_GOVERNANCE_REFERENCES,
} as const satisfies AfendaTenantBrandingContract;

export function afendaMergeLaneScaleFields(
  base: AfendaLaneColorScale,
  override?: AfendaPartialLaneColorScale
): AfendaLaneColorScale {
  if (!override) {
    return base;
  }

  const merged = { ...base };
  for (const field of Object.keys(override) as AfendaLaneColorScaleField[]) {
    const value = override[field];
    if (value) {
      merged[field] = value;
    }
  }

  return merged;
}

export function validateAfendaTenantBrandingSettings(
  settings: AfendaTenantBrandingSettings
): AfendaTenantBrandingSettings {
  return afendaTenantBrandingSettingsSchema.parse(settings);
}

export const afendaTenantBrandingContractSchema = z
  .object({
    allowedCustomization: z
      .array(z.enum(AFENDA_ALLOWED_CUSTOMIZATION_KEYS))
      .min(1)
      .readonly(),
    defaults: afendaTenantBrandingSettingsSchema,
    description: z.string().trim().min(1),
    forbiddenCustomization: z
      .array(z.enum(AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS))
      .min(1)
      .readonly(),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_TENANT_BRANDING_CONTRACT_ID),
    parentContractId: z.literal(AFENDA_DESIGN_SYSTEM_ID),
    version: z.literal(AFENDA_TENANT_BRANDING_CONTRACT_VERSION),
  })
  .strict()
  .refine(
    (contract) =>
      contract.forbiddenCustomization.includes("permissionFinality") &&
      contract.forbiddenCustomization.includes("tenantResolution") &&
      contract.forbiddenCustomization.includes("auditPolicy") &&
      contract.forbiddenCustomization.includes("executionPipeline"),
    "Tenant branding must explicitly forbid security, tenant, audit, and execution authority customization"
  );

function assertTenantBrandingCustomizationPartition(): void {
  const deferredKeys = new Set<AfendaAllowedCustomizationKey>(
    AFENDA_TENANT_BRANDING_DEFERRED_CUSTOMIZATION_KEYS
  );

  for (const key of AFENDA_TENANT_BRANDING_IMPLEMENTED_CUSTOMIZATION_KEYS) {
    if (deferredKeys.has(key)) {
      throw new Error(
        `Tenant branding customization key "${key}" cannot be both implemented and deferred`
      );
    }
  }

  const partitionKeys = [
    ...AFENDA_TENANT_BRANDING_IMPLEMENTED_CUSTOMIZATION_KEYS,
    ...AFENDA_TENANT_BRANDING_DEFERRED_CUSTOMIZATION_KEYS,
  ]
    .slice()
    .sort();

  if (
    partitionKeys.join("|") !==
    [...AFENDA_TENANT_BRANDING_ALLOWED_CUSTOMIZATION_KEYS].sort().join("|")
  ) {
    throw new Error(
      "Tenant branding allowedCustomization must equal implemented keys plus deferred keys"
    );
  }

  const settingsShape = afendaTenantBrandingSettingsSchema.shape;
  for (const key of AFENDA_TENANT_BRANDING_IMPLEMENTED_CUSTOMIZATION_KEYS) {
    if (!(key in settingsShape)) {
      throw new Error(
        `Tenant branding implemented customization key "${key}" must exist on afendaTenantBrandingSettingsSchema`
      );
    }
  }
}

export function validateAfendaTenantBrandingContract(): void {
  afendaTenantBrandingContractSchema.parse(afendaTenantBrandingContract);
  validateAfendaTenantBrandingSettings(afendaTenantBrandingContract.defaults);

  for (const key of afendaTenantBrandingContract.allowedCustomization) {
    if (!AFENDA_ALLOWED_CUSTOMIZATION_KEYS.includes(key)) {
      throw new Error(
        `Tenant branding allowedCustomization key "${key}" is not in parent AFENDA_ALLOWED_CUSTOMIZATION_KEYS`
      );
    }
  }

  assertTenantBrandingCustomizationPartition();
}

export const AFENDA_USER_BRANDING_CONTRACT_ID =
  "afenda.user-branding-contract" as const;
export const AFENDA_USER_BRANDING_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_COLOR_MODE_PREFERENCES = [
  "light",
  "dark",
  "system",
] as const;

export const AFENDA_USER_BRANDING_GOVERNANCE_REFERENCES = [
  "AFENDA:tenant-branding-contract",
  "AFENDA:design-system-contract",
  "AFENDA:tenant-context-contract",
  "AFENDA:theme-preset-registry",
  "AFENDA:visual-design-contract",
  "AFENDA:security-ui-contract",
] as const;

export const afendaColorModePreferenceSchema = z.enum(
  AFENDA_COLOR_MODE_PREFERENCES
);

export type AfendaColorModePreference = z.infer<
  typeof afendaColorModePreferenceSchema
>;

export const afendaUserBrandingPreferencesSchema = z
  .object({
    colorMode: afendaColorModePreferenceSchema.optional(),
    themePreset: afendaThemePresetRegistryNameSchema.optional(),
    moduleLaneOverrides: z
      .record(z.string().trim().min(1), afendaErpVisualLaneIdSchema)
      .optional(),
    laneColorOverrides: z
      .object({
        byLane: z
          .record(afendaErpVisualLaneIdSchema, afendaPartialLaneColorModeScaleSchema)
          .optional(),
        byFeature: z
          .record(z.string().trim().min(1), afendaPartialLaneColorModeScaleSchema)
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type AfendaUserBrandingPreferences = z.infer<
  typeof afendaUserBrandingPreferencesSchema
>;

export type AfendaUserBrandingContract = {
  description: string;
  emptyPreferences: AfendaUserBrandingPreferences;
  governanceReferences: readonly string[];
  id: typeof AFENDA_USER_BRANDING_CONTRACT_ID;
  parentContractId: typeof AFENDA_TENANT_BRANDING_CONTRACT_ID;
  version: typeof AFENDA_USER_BRANDING_CONTRACT_VERSION;
};

export const AFENDA_EMPTY_USER_BRANDING_PREFERENCES =
  {} as const satisfies AfendaUserBrandingPreferences;

export const afendaUserBrandingContract = {
  id: AFENDA_USER_BRANDING_CONTRACT_ID,
  version: AFENDA_USER_BRANDING_CONTRACT_VERSION,
  parentContractId: AFENDA_TENANT_BRANDING_CONTRACT_ID,
  description:
    "Afenda user branding preference overlay for safe optional user-level presentation preferences.",
  emptyPreferences: AFENDA_EMPTY_USER_BRANDING_PREFERENCES,
  governanceReferences: AFENDA_USER_BRANDING_GOVERNANCE_REFERENCES,
} as const satisfies AfendaUserBrandingContract;

export const afendaUserBrandingContractSchema = z
  .object({
    description: z.string().trim().min(1),
    emptyPreferences: afendaUserBrandingPreferencesSchema,
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_USER_BRANDING_CONTRACT_ID),
    parentContractId: z.literal(AFENDA_TENANT_BRANDING_CONTRACT_ID),
    version: z.literal(AFENDA_USER_BRANDING_CONTRACT_VERSION),
  })
  .strict()
  .refine(
    (contract) =>
      contract.governanceReferences.includes("AFENDA:tenant-branding-contract") &&
      contract.governanceReferences.includes("AFENDA:security-ui-contract"),
    "User branding must inherit tenant branding and security-ui governance"
  );

export function validateAfendaUserBrandingPreferences(
  preferences: AfendaUserBrandingPreferences
): AfendaUserBrandingPreferences {
  return afendaUserBrandingPreferencesSchema.parse(preferences);
}

export function validateAfendaUserBrandingContract(): void {
  afendaUserBrandingContractSchema.parse(afendaUserBrandingContract);
  validateAfendaUserBrandingPreferences(
    afendaUserBrandingContract.emptyPreferences
  );
}

export function isAfendaUserBrandingEmpty(
  preferences: AfendaUserBrandingPreferences
): boolean {
  return !(
    preferences.colorMode ||
    preferences.themePreset ||
    preferences.moduleLaneOverrides ||
    preferences.laneColorOverrides
  );
}
