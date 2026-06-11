import type { ErpVisualLaneId } from "../contracts/visual-lane.contract";
import {
  activeLaneCssVarName,
  ERP_VISUAL_LANE_BY_ID,
  ERP_VISUAL_LANE_IDS,
  LANE_COLOR_SCALE_FIELDS,
  laneCssVarName,
  tenantLaneCssVarName,
} from "../contracts/visual-lane.contract";
import type { CssDeclaration } from "./css-theme";

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
