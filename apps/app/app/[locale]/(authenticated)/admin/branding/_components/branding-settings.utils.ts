import type {
  AfendaPartialLaneColorModeScale as PartialLaneColorModeScale,
  AfendaTenantBrandingSettings as TenantBrandingSettings,
  AfendaUserBrandingPreferences as UserBrandingPreferences,
} from "@repo/design-system/contracts/afenda/customization";
import type { AfendaErpVisualLaneId as ErpVisualLaneId } from "@repo/design-system/contracts/afenda/registries";
import {
  AFENDA_ERP_CATALOG_MODULE_ENTRIES as ERP_CATALOG_MODULE_ENTRIES,
  getAfendaDefaultLaneForFeature as getDefaultLaneForFeature,
} from "@repo/design-system/contracts/afenda/catalogs";
import {
  resolveLaneForFeature,
} from "@repo/design-system";

export const SORTED_MODULE_ENTRIES = ERP_CATALOG_MODULE_ENTRIES.map(
  (entry) => [entry.featureId, entry.defaultLane] as const
);

export function formatFeatureLabel(featureId: string): string {
  if (featureId.endsWith("*")) {
    return `${featureId.replace("*", "")} (prefix rule)`;
  }

  return featureId
    .split(".")
    .map((segment) =>
      segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    )
    .join(" · ");
}

export function getFeatureDomain(featureId: string): string {
  return featureId.replace("*", "").split(".")[0] ?? "other";
}

export function resolveCatalogDefaultLane(featureId: string): ErpVisualLaneId {
  if (featureId.endsWith("*")) {
    const prefix = featureId.slice(0, -1);
    return getDefaultLaneForFeature(`${prefix}.sample`);
  }

  return getDefaultLaneForFeature(featureId);
}

export function resolveAssignedLane(
  branding: TenantBrandingSettings,
  featureId: string
): ErpVisualLaneId {
  if (featureId.endsWith("*")) {
    const prefixKey = featureId;
    const prefix = featureId.slice(0, -1);
    return (
      branding.moduleLaneOverrides?.[prefixKey] ??
      getDefaultLaneForFeature(`${prefix}.sample`)
    );
  }

  return resolveLaneForFeature(branding, featureId);
}

export function isModuleLaneOverride(
  branding: TenantBrandingSettings,
  featureId: string
): boolean {
  return (
    resolveAssignedLane(branding, featureId) !==
    resolveCatalogDefaultLane(featureId)
  );
}

export function countLaneOverrides(branding: TenantBrandingSettings): number {
  return SORTED_MODULE_ENTRIES.filter(([featureId]) =>
    isModuleLaneOverride(branding, featureId)
  ).length;
}

export function isBrandingDirty<T>(current: T, initial: T): boolean {
  return JSON.stringify(current) !== JSON.stringify(initial);
}

export function isUserPreferencesDirty(
  current: UserBrandingPreferences,
  initial: UserBrandingPreferences
): boolean {
  return isBrandingDirty(current, initial);
}

export function filterModuleEntries(
  entries: readonly (readonly [string, ErpVisualLaneId])[],
  query: string,
  branding: TenantBrandingSettings
): readonly (readonly [string, ErpVisualLaneId])[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return entries;
  }

  return entries.filter(([featureId, defaultLane]) => {
    const assignedLane = resolveAssignedLane(branding, featureId);
    const label = formatFeatureLabel(featureId).toLowerCase();

    return (
      featureId.toLowerCase().includes(normalized) ||
      label.includes(normalized) ||
      defaultLane.toLowerCase().includes(normalized) ||
      assignedLane.toLowerCase().includes(normalized)
    );
  });
}

export function getCatalogResolutionLabel(featureId: string): string {
  const entry = ERP_CATALOG_MODULE_ENTRIES.find(
    (candidate) => candidate.featureId === featureId
  );

  return entry?.resolution === "prefix" ? "Prefix rule" : "Explicit default";
}

function diffPartialLaneColorModeScale(
  effective: PartialLaneColorModeScale | undefined,
  baseline: PartialLaneColorModeScale | undefined
): PartialLaneColorModeScale | undefined {
  if (!effective) {
    return;
  }

  const lightSolid =
    effective.light?.solid === baseline?.light?.solid
      ? undefined
      : effective.light?.solid;
  const darkSolid =
    effective.dark?.solid === baseline?.dark?.solid
      ? undefined
      : effective.dark?.solid;

  const next: PartialLaneColorModeScale = {};

  if (lightSolid) {
    next.light = { solid: lightSolid };
  }

  if (darkSolid) {
    next.dark = { solid: darkSolid };
  }

  return Object.keys(next).length > 0 ? next : undefined;
}

function diffLaneColorRecord(
  effective: Record<string, PartialLaneColorModeScale> | undefined,
  baseline: Record<string, PartialLaneColorModeScale> | undefined
): Record<string, PartialLaneColorModeScale> | undefined {
  if (!effective) {
    return;
  }

  const keys = new Set([
    ...Object.keys(effective),
    ...Object.keys(baseline ?? {}),
  ]);
  const next: Record<string, PartialLaneColorModeScale> = {};

  for (const key of keys) {
    const delta = diffPartialLaneColorModeScale(
      effective[key],
      baseline?.[key]
    );
    if (delta) {
      next[key] = delta;
    }
  }

  return Object.keys(next).length > 0 ? next : undefined;
}

export function extractUserLaneColorOverridesDelta(
  tenant: TenantBrandingSettings,
  effective: TenantBrandingSettings
): UserBrandingPreferences["laneColorOverrides"] {
  const byLane = diffLaneColorRecord(
    effective.laneColorOverrides?.byLane,
    tenant.laneColorOverrides?.byLane
  );
  const byFeature = diffLaneColorRecord(
    effective.laneColorOverrides?.byFeature,
    tenant.laneColorOverrides?.byFeature
  );

  if (!(byLane || byFeature)) {
    return;
  }

  return {
    ...(byLane ? { byLane } : {}),
    ...(byFeature ? { byFeature } : {}),
  };
}
