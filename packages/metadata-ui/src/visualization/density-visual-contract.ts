import type { MetadataRenderDensity } from "../contracts/render-context.contract";

export type DensityVisualDefinition = {
  cardPadding: string;
  formGridGap: string;
  formSpacing: string;
  formTitleClass: string;
  sectionSpacing: string;
  stackSpacing: string;
  toolbarGap: string;
  toolbarInnerSpacing: string;
  toolbarTitleClass: string;
};

export const DENSITY_VISUAL_MATRIX: Record<
  MetadataRenderDensity,
  DensityVisualDefinition
> = {
  compact: {
    cardPadding: "p-4",
    formGridGap: "gap-3",
    formSpacing: "space-y-4",
    formTitleClass: "font-semibold text-lg",
    sectionSpacing: "space-y-2",
    stackSpacing: "space-y-4",
    toolbarGap: "gap-2 lg:gap-3",
    toolbarInnerSpacing: "space-y-1",
    toolbarTitleClass: "font-semibold text-lg tracking-tight",
  },
  comfortable: {
    cardPadding: "p-8",
    formGridGap: "gap-6",
    formSpacing: "space-y-8",
    formTitleClass: "font-semibold text-2xl",
    sectionSpacing: "space-y-6",
    stackSpacing: "space-y-8",
    toolbarGap: "gap-6 lg:gap-8",
    toolbarInnerSpacing: "space-y-3",
    toolbarTitleClass: "font-semibold text-3xl tracking-tight",
  },
  default: {
    cardPadding: "p-6",
    formGridGap: "gap-4",
    formSpacing: "space-y-6",
    formTitleClass: "font-semibold text-xl",
    sectionSpacing: "space-y-4",
    stackSpacing: "space-y-6",
    toolbarGap: "gap-4",
    toolbarInnerSpacing: "space-y-2",
    toolbarTitleClass: "font-semibold text-2xl tracking-tight",
  },
};

export function resolveDensityVisualDefinition(
  density: MetadataRenderDensity = "default"
): DensityVisualDefinition {
  return DENSITY_VISUAL_MATRIX[density];
}

export function resolveDensitySurfaceProps(
  density: MetadataRenderDensity = "default"
): { "data-density"?: "compact" | "comfortable" } {
  if (density === "default") {
    return {};
  }

  return { "data-density": density };
}

export function resolveFieldControlDensityClassName(
  _density: MetadataRenderDensity = "default"
): string {
  return "h-auto min-h-[var(--density-control-height)] control-density";
}

export function resolveTableRowDensityClassName(): string {
  return "row-density";
}

export function resolveDensityTextareaClassName(
  density: MetadataRenderDensity = "default"
): string {
  const minHeightByDensity: Record<MetadataRenderDensity, string> = {
    compact: "min-h-20",
    comfortable: "min-h-28",
    default: "min-h-24",
  };

  return `${minHeightByDensity[density]} w-full`;
}
