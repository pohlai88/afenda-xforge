import type { ErpVisualLaneId } from "./visual-lane.contract";

export const ERP_MODULE_LANE_DEFAULT_LANE: ErpVisualLaneId = "governance";

/**
 * Explicit featureId → lane overrides. Prefix rules in `getDefaultLaneForFeature`
 * handle the rest of the catalog.
 */
export const ERP_MODULE_LANE_DEFAULTS: Readonly<Record<string, ErpVisualLaneId>> = {
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
};

const PREFIX_LANE_RULES = [
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
]
  .sort((left, right) => right.prefix.length - left.prefix.length) as readonly {
  lane: ErpVisualLaneId;
  prefix: string;
}[];

export function getDefaultLaneForFeature(featureId: string): ErpVisualLaneId {
  const explicit = ERP_MODULE_LANE_DEFAULTS[featureId];
  if (explicit) {
    return explicit;
  }

  for (const rule of PREFIX_LANE_RULES) {
    if (featureId === rule.prefix || featureId.startsWith(`${rule.prefix}.`)) {
      return rule.lane;
    }
  }

  return ERP_MODULE_LANE_DEFAULT_LANE;
}
