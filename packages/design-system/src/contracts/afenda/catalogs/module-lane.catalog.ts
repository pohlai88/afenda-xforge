import { z } from "zod";

import { defineGovernanceReferences, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_GOV_DATA_DISPLAY,
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_TENANT_BRANDING,
  AFENDA_GOV_TENANT_CONTEXT,
  AFENDA_GOV_THEMING,
  AFENDA_GOV_VISUAL_LANE_REGISTRY,
} from "./governance-reference.catalog";
import {
  AFENDA_ERP_VISUAL_LANE_IDS,
  afendaErpVisualLaneIdSchema,
  type AfendaErpVisualLaneId,
} from "../registries";

export const AFENDA_MODULE_LANE_CATALOG_ID =
  "afenda.module-lane-catalog" as const;
export const AFENDA_MODULE_LANE_CATALOG_VERSION = "0.1.0" as const;

export const AFENDA_ERP_MODULE_LANE_DEFAULT_LANE: AfendaErpVisualLaneId =
  "governance";

export const AFENDA_MODULE_LANE_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_VISUAL_LANE_REGISTRY,
  AFENDA_GOV_TENANT_BRANDING,
  AFENDA_GOV_TENANT_CONTEXT,
  AFENDA_GOV_THEMING,
  AFENDA_GOV_DATA_DISPLAY,
]);

/**
 * Explicit featureId -> lane mappings. Prefix rules cover family defaults.
 */
export const AFENDA_ERP_MODULE_LANE_DEFAULTS = {
  "master-data.customers": "customer",
  "master-data.companies": "customer",
  "master-data.products": "goods",
  "master-data.suppliers": "goods",
  "master-data.locations": "goods",
  "master-data.currencies": "money",
  "master-data.tax-codes": "money",
  "system-admin.control-plane": "governance",
  "system-admin.customization-governance": "governance",
  "system-admin.tenant-settings": "governance",
  "system-admin.users-access": "governance",
  "system-admin.audit": "governance",
  "system-admin.overview": "intelligence",
  "system-admin.health-metrics": "operations",
  "system-admin.integrations": "operations",
} as const satisfies Readonly<Record<string, AfendaErpVisualLaneId>>;

export type AfendaModuleLanePrefixRule = {
  lane: AfendaErpVisualLaneId;
  prefix: string;
};

export const AFENDA_MODULE_LANE_PREFIX_RULES = [
  { prefix: "hr-suite.payroll-compensation", lane: "money" },
  { prefix: "hr-suite.talent-management", lane: "people" },
  { prefix: "hr-suite.employee-management", lane: "people" },
  { prefix: "hr-suite.time-attendance", lane: "people" },
  { prefix: "hr-suite.industry-specific", lane: "operations" },
  { prefix: "hr-suite.", lane: "people" },
  { prefix: "master-data.currencies", lane: "money" },
  { prefix: "master-data.tax-codes", lane: "money" },
  { prefix: "master-data.customers", lane: "customer" },
  { prefix: "master-data.companies", lane: "customer" },
  { prefix: "master-data.", lane: "goods" },
  { prefix: "system-admin.", lane: "governance" },
].sort((left, right) => right.prefix.length - left.prefix.length) as readonly AfendaModuleLanePrefixRule[];

export type AfendaCatalogModuleEntry = {
  defaultLane: AfendaErpVisualLaneId;
  featureId: string;
  resolution: "explicit" | "prefix";
};

function matchesModuleLanePrefix(featureId: string, prefix: string): boolean {
  if (prefix.endsWith(".")) {
    return featureId.startsWith(prefix);
  }

  return featureId === prefix || featureId.startsWith(`${prefix}.`);
}

export function getAfendaDefaultLaneForFeature(
  featureId: string
): AfendaErpVisualLaneId {
  const explicit = (
    AFENDA_ERP_MODULE_LANE_DEFAULTS as Readonly<
      Record<string, AfendaErpVisualLaneId>
    >
  )[featureId];
  if (explicit) {
    return explicit;
  }

  for (const rule of AFENDA_MODULE_LANE_PREFIX_RULES) {
    if (matchesModuleLanePrefix(featureId, rule.prefix)) {
      return rule.lane;
    }
  }

  return AFENDA_ERP_MODULE_LANE_DEFAULT_LANE;
}

const AFENDA_PREFIX_CATALOG_ENTRIES: readonly AfendaCatalogModuleEntry[] =
  AFENDA_MODULE_LANE_PREFIX_RULES.map((rule) => ({
    featureId: `${rule.prefix}*`,
    defaultLane: rule.lane,
    resolution: "prefix" as const,
  }));

export const AFENDA_ERP_CATALOG_MODULE_ENTRIES: readonly AfendaCatalogModuleEntry[] =
  [
    ...Object.entries(AFENDA_ERP_MODULE_LANE_DEFAULTS).map(
      ([featureId, defaultLane]) => ({
        featureId,
        defaultLane,
        resolution: "explicit" as const,
      })
    ),
    ...AFENDA_PREFIX_CATALOG_ENTRIES.filter(
      (entry) =>
        !Object.keys(AFENDA_ERP_MODULE_LANE_DEFAULTS).some((featureId) =>
          featureId.startsWith(entry.featureId.replace("*", ""))
        )
    ),
  ].sort((left, right) => left.featureId.localeCompare(right.featureId));

export function listAfendaCatalogModuleEntries(): readonly AfendaCatalogModuleEntry[] {
  return AFENDA_ERP_CATALOG_MODULE_ENTRIES;
}

export const afendaCatalogModuleEntrySchema = z
  .object({
    defaultLane: afendaErpVisualLaneIdSchema,
    featureId: z.string().trim().min(1),
    resolution: z.enum(["explicit", "prefix"]),
  })
  .strict();

export const afendaModuleLaneCatalogSchema = z
  .object({
    defaultLane: afendaErpVisualLaneIdSchema,
    entries: z.array(afendaCatalogModuleEntrySchema).min(1).readonly(),
    governanceReferences: governanceReferencesSchema,
    id: z.literal(AFENDA_MODULE_LANE_CATALOG_ID),
    laneIds: z.array(afendaErpVisualLaneIdSchema).min(1).readonly(),
    prefixRules: z
      .array(
        z
          .object({
            lane: afendaErpVisualLaneIdSchema,
            prefix: z.string().trim().min(1),
          })
          .strict()
      )
      .min(1)
      .readonly(),
    version: z.literal(AFENDA_MODULE_LANE_CATALOG_VERSION),
  })
  .strict()
  .refine(
    (catalog) =>
      catalog.prefixRules.every((rule, index, rules) => {
        const previousRule = rules[index - 1];

        return (
          index === 0 ||
          Boolean(previousRule && previousRule.prefix.length >= rule.prefix.length)
        );
      }),
    "Afenda module lane prefix rules must be sorted by descending specificity"
  );

export const afendaModuleLaneCatalog = {
  id: AFENDA_MODULE_LANE_CATALOG_ID,
  version: AFENDA_MODULE_LANE_CATALOG_VERSION,
  laneIds: AFENDA_ERP_VISUAL_LANE_IDS,
  defaultLane: AFENDA_ERP_MODULE_LANE_DEFAULT_LANE,
  prefixRules: AFENDA_MODULE_LANE_PREFIX_RULES,
  entries: AFENDA_ERP_CATALOG_MODULE_ENTRIES,
  governanceReferences: AFENDA_MODULE_LANE_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaModuleLaneCatalog(): void {
  afendaModuleLaneCatalogSchema.parse(afendaModuleLaneCatalog);
}
