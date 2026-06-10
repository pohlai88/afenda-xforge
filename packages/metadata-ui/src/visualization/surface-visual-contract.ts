import type { MetadataSectionKind } from "../contracts/section-renderer.contract";
import type { MetadataSurfaceKind } from "../contracts/surface.contract";

export type MetadataSurfaceHierarchySlot =
  | "description"
  | "primary"
  | "secondary-actions"
  | "title";

export type MetadataSurfaceRegionSlot =
  | "activity-feed"
  | "charts"
  | "data-grid"
  | "field-groups"
  | "filters"
  | "kpi-cards"
  | "metadata-sections"
  | "navigation"
  | "pagination"
  | "related-actions"
  | "step-content"
  | "stepper"
  | "validation";

export type SurfaceVisualDefinition = {
  hierarchy: readonly MetadataSurfaceHierarchySlot[];
  primaryRegions: readonly MetadataSurfaceRegionSlot[];
  shellClass: string;
};

export const METADATA_SURFACE_HIERARCHY_SLOTS: readonly MetadataSurfaceHierarchySlot[] =
  ["title", "description", "primary", "secondary-actions"];

export const SURFACE_VISUAL_MATRIX: Record<
  MetadataSurfaceKind,
  SurfaceVisualDefinition
> = {
  dashboard: {
    hierarchy: METADATA_SURFACE_HIERARCHY_SLOTS,
    primaryRegions: ["kpi-cards", "charts", "activity-feed"],
    shellClass: "metadata-surface metadata-surface-dashboard",
  },
  detail: {
    hierarchy: METADATA_SURFACE_HIERARCHY_SLOTS,
    primaryRegions: ["metadata-sections", "related-actions"],
    shellClass: "metadata-surface metadata-surface-detail",
  },
  form: {
    hierarchy: METADATA_SURFACE_HIERARCHY_SLOTS,
    primaryRegions: ["field-groups", "validation"],
    shellClass: "metadata-surface metadata-surface-form",
  },
  list: {
    hierarchy: METADATA_SURFACE_HIERARCHY_SLOTS,
    primaryRegions: ["filters", "data-grid", "pagination"],
    shellClass: "metadata-surface metadata-surface-list",
  },
  workflow: {
    hierarchy: METADATA_SURFACE_HIERARCHY_SLOTS,
    primaryRegions: ["stepper", "step-content", "navigation"],
    shellClass: "metadata-surface metadata-surface-workflow",
  },
};

const sectionKindToSurfaceKind: Partial<
  Record<MetadataSectionKind, MetadataSurfaceKind>
> = {
  card: "detail",
  dashboard: "dashboard",
  details: "detail",
  form: "form",
  list: "list",
  section: "detail",
  table: "list",
  workflow: "workflow",
};

export function resolveSurfaceVisualDefinition(
  kind: MetadataSurfaceKind
): SurfaceVisualDefinition {
  return SURFACE_VISUAL_MATRIX[kind];
}

export function resolveSurfaceKindProps(kind: MetadataSurfaceKind): {
  "data-surface-kind": MetadataSurfaceKind;
} {
  return { "data-surface-kind": kind };
}

export function resolveSurfaceRegionProps(
  kind: MetadataSurfaceKind,
  region: MetadataSurfaceHierarchySlot | MetadataSurfaceRegionSlot
): {
  "data-surface-kind": MetadataSurfaceKind;
  "data-surface-region": string;
} {
  return {
    "data-surface-kind": kind,
    "data-surface-region": region,
  };
}

export function resolveSurfaceShellClassName(
  kind: MetadataSurfaceKind
): string {
  return resolveSurfaceVisualDefinition(kind).shellClass;
}

export function resolveSectionSurfaceKind(
  sectionKind?: MetadataSectionKind
): MetadataSurfaceKind | undefined {
  if (!sectionKind) {
    return;
  }

  return sectionKindToSurfaceKind[sectionKind];
}

export function assertSurfaceHierarchy(
  kind: MetadataSurfaceKind,
  regions: readonly string[]
): boolean {
  const definition = resolveSurfaceVisualDefinition(kind);

  for (const slot of definition.hierarchy) {
    if (!regions.includes(slot)) {
      return false;
    }
  }

  return true;
}
