/** App nav sidebar suite metadata — mirrors HR Suite breadcrumb tier. */
export const APP_SIDEBAR_WORKSPACE_SUITE_LABEL = "THE-WORKSPACE";

/** App nav sidebar domain metadata labels — mirrors site sidebar navLabel casing. */
export const APP_SIDEBAR_NAV_GROUP_LABELS = {
  workspace: "WORKSPACE",
  infrastructure: "INFRASTRUCTURE",
  governance: "GOVERNANCE",
  resources: "RESOURCES",
  hr: "HR",
  settings: "SETTINGS",
} as const;

export function formatEisenhowerMatrixMetadataLabel(
  matrixCount: number,
  limit: number
): string {
  return `EISENHOWER-MATRIX (${matrixCount}/${limit})`;
}
