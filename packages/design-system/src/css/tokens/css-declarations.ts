import {
  AFENDA_ERP_VISUAL_LANE_BY_ID as ERP_VISUAL_LANE_BY_ID,
  AFENDA_ERP_VISUAL_LANE_IDS as ERP_VISUAL_LANE_IDS,
  AFENDA_LANE_COLOR_SCALE_FIELDS as LANE_COLOR_SCALE_FIELDS,
  AFENDA_SIDEBAR_COLOR_TOKENS as SIDEBAR_COLOR_TOKENS,
  afendaActiveLaneCssVarName as activeLaneCssVarName,
  afendaLaneCssVarName as laneCssVarName,
  afendaTenantLaneCssVarName as tenantLaneCssVarName,
  type AfendaErpVisualLaneId as ErpVisualLaneId,
} from "../../contracts/afenda/registries";
import type { CssDeclaration } from "./css-declaration.types";

export const STATUS_LIGHT_DECLARATIONS: readonly CssDeclaration[] = [
  ["--success", "oklch(0.50 0.14 145)"],
  ["--success-foreground", "oklch(0.985 0.004 258)"],
  ["--success-muted", "oklch(0.94 0.03 145)"],
  ["--success-muted-foreground", "oklch(0.28 0.06 145)"],
  ["--success-border", "oklch(0.78 0.08 145)"],
  ["--warning", "oklch(0.55 0.14 50)"],
  ["--warning-foreground", "oklch(0.985 0.004 258)"],
  ["--warning-muted", "oklch(0.95 0.04 50)"],
  ["--warning-muted-foreground", "oklch(0.34 0.06 50)"],
  ["--warning-border", "oklch(0.82 0.1 50)"],
  ["--destructive", "oklch(0.577 0.22 27)"],
  ["--destructive-foreground", "oklch(0.985 0.004 258)"],
  ["--destructive-muted", "oklch(0.965 0.025 27)"],
  ["--destructive-muted-foreground", "oklch(0.42 0.12 27)"],
  ["--destructive-border", "oklch(0.82 0.08 27)"],
  ["--invert", "oklch(0.20 0.015 258)"],
  ["--invert-foreground", "oklch(0.985 0.003 258)"],
  ["--info", "oklch(0.52 0.12 230)"],
  ["--info-foreground", "oklch(0.985 0.004 258)"],
  ["--info-muted", "oklch(0.94 0.03 230)"],
  ["--info-muted-foreground", "oklch(0.3 0.05 230)"],
  ["--info-border", "oklch(0.78 0.08 230)"],
] as const;

export const STATUS_DARK_DECLARATIONS: readonly CssDeclaration[] = [
  ["--success", "oklch(0.52 0.13 145)"],
  ["--success-foreground", "oklch(0.985 0.004 258)"],
  ["--success-muted", "oklch(0.25 0.04 145)"],
  ["--success-muted-foreground", "oklch(0.86 0.08 145)"],
  ["--success-border", "oklch(0.45 0.08 145)"],
  ["--warning", "oklch(0.78 0.12 50)"],
  ["--warning-foreground", "oklch(0.18 0.014 50)"],
  ["--warning-muted", "oklch(0.27 0.04 50)"],
  ["--warning-muted-foreground", "oklch(0.9 0.08 50)"],
  ["--warning-border", "oklch(0.48 0.08 50)"],
  ["--destructive", "oklch(0.58 0.196 25)"],
  ["--destructive-foreground", "oklch(0.985 0.004 258)"],
  ["--destructive-muted", "oklch(0.28 0.055 27)"],
  ["--destructive-muted-foreground", "oklch(0.9 0.055 27)"],
  ["--destructive-border", "oklch(0.48 0.09 27)"],
  ["--invert", "oklch(0.25 0.013 258)"],
  ["--invert-foreground", "oklch(0.985 0.003 258)"],
  ["--info", "oklch(0.55 0.12 230)"],
  ["--info-foreground", "oklch(0.985 0.004 258)"],
  ["--info-muted", "oklch(0.25 0.04 230)"],
  ["--info-muted-foreground", "oklch(0.88 0.06 230)"],
  ["--info-border", "oklch(0.46 0.07 230)"],
] as const;

export const CHART_LIGHT_DECLARATIONS: readonly CssDeclaration[] = [
  ["--chart-1", "oklch(0.52 0.10 198)"],
  ["--chart-2", "oklch(0.50 0.08 250)"],
  ["--chart-3", "oklch(0.55 0.09 160)"],
  ["--chart-4", "oklch(0.58 0.08 68)"],
  ["--chart-5", "oklch(0.52 0.09 285)"],
  ["--chart-6", "oklch(0.54 0.07 212)"],
  ["--chart-7", "oklch(0.54 0.08 330)"],
] as const;

export const CHART_DARK_DECLARATIONS: readonly CssDeclaration[] = [
  ["--chart-1", "oklch(0.72 0.10 198)"],
  ["--chart-2", "oklch(0.70 0.08 250)"],
  ["--chart-3", "oklch(0.74 0.09 160)"],
  ["--chart-4", "oklch(0.76 0.085 68)"],
  ["--chart-5", "oklch(0.72 0.09 285)"],
  ["--chart-6", "oklch(0.72 0.07 212)"],
  ["--chart-7", "oklch(0.72 0.08 330)"],
] as const;

export const SIDEBAR_LIGHT_DECLARATIONS: readonly CssDeclaration[] = [
  ["--sidebar", "oklch(0.970 0.005 258)"],
  ["--sidebar-foreground", "var(--foreground)"],
  ["--sidebar-primary", "var(--primary)"],
  ["--sidebar-primary-foreground", "var(--primary-foreground)"],
  ["--sidebar-accent", "oklch(0.948 0.014 198)"],
  ["--sidebar-accent-foreground", "oklch(0.22 0.022 198)"],
  ["--sidebar-border", "oklch(0.902 0.010 258)"],
  ["--sidebar-ring", "var(--ring)"],
] as const;

export const SIDEBAR_DARK_DECLARATIONS: readonly CssDeclaration[] = [
  ["--sidebar", "oklch(0.135 0.011 258)"],
  ["--sidebar-foreground", "var(--foreground)"],
  ["--sidebar-primary", "var(--primary)"],
  ["--sidebar-primary-foreground", "var(--primary-foreground)"],
  ["--sidebar-accent", "oklch(0.22 0.020 198)"],
  ["--sidebar-accent-foreground", "oklch(0.92 0.006 258)"],
  ["--sidebar-border", "oklch(0.28 0.014 258)"],
  ["--sidebar-ring", "var(--ring)"],
] as const;

export function sidebarRootDeclarations(
  declarations: readonly CssDeclaration[]
): readonly CssDeclaration[] {
  const byName = new Map(declarations.map(([name, value]) => [name, value]));

  return SIDEBAR_COLOR_TOKENS.map((token) => {
    const cssVar = `--${token}`;
    const value = byName.get(cssVar);

    if (!value) {
      throw new Error(`sidebar token missing declaration for ${cssVar}`);
    }

    return [cssVar, value] as const;
  });
}

export const SIDEBAR_THEME_INLINE_DECLARATIONS: readonly CssDeclaration[] =
  SIDEBAR_COLOR_TOKENS.map(
    (token) => [`--color-${token}`, `var(--${token})`] as const
  );

function tenantLaneVar(tenantVar: string, fallback: string): string {
  return `var(${tenantVar}, ${fallback})`;
}

function laneDeclarationsForMode(mode: "dark" | "light"): CssDeclaration[] {
  const declarations: CssDeclaration[] = [];

  for (const laneId of ERP_VISUAL_LANE_IDS) {
    const lane = ERP_VISUAL_LANE_BY_ID[laneId];
    const scale = lane.scales[mode];

    for (const field of LANE_COLOR_SCALE_FIELDS) {
      const cssVar = laneCssVarName(laneId, field);
      const tenantVar = tenantLaneCssVarName(laneId, field);
      declarations.push([cssVar, tenantLaneVar(tenantVar, scale[field])]);
    }
  }

  return declarations;
}

function activeLaneDeclarations(
  fallbackLaneId: ErpVisualLaneId
): CssDeclaration[] {
  const fallback = ERP_VISUAL_LANE_BY_ID[fallbackLaneId].scales.light;

  return LANE_COLOR_SCALE_FIELDS.map((field) => {
    const activeVar = activeLaneCssVarName(field);
    const laneVar = laneCssVarName(fallbackLaneId, field);

    return [activeVar, `var(${laneVar}, ${fallback[field]})`] as CssDeclaration;
  });
}

export const GLOBALS_CSS_LANE_ROOT_DECLARATIONS =
  laneDeclarationsForMode("light");
export const GLOBALS_CSS_LANE_DARK_DECLARATIONS =
  laneDeclarationsForMode("dark");
export const GLOBALS_CSS_ACTIVE_LANE_DECLARATIONS =
  activeLaneDeclarations("governance");

export function laneThemeInlineDeclarations(): CssDeclaration[] {
  const declarations: CssDeclaration[] = [];

  for (const laneId of ERP_VISUAL_LANE_IDS) {
    for (const field of LANE_COLOR_SCALE_FIELDS) {
      const cssVar = laneCssVarName(laneId, field);
      const utilitySuffix = field === "solid" ? laneId : `${laneId}-${field}`;
      declarations.push([`--color-lane-${utilitySuffix}`, `var(${cssVar})`]);
    }
  }

  for (const field of LANE_COLOR_SCALE_FIELDS) {
    const activeVar = activeLaneCssVarName(field);
    const utilitySuffix = field === "solid" ? "active" : `active-${field}`;
    declarations.push([`--color-lane-${utilitySuffix}`, `var(${activeVar})`]);
  }

  return declarations;
}
