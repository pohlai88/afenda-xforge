import "server-only";

import type { SearchDocument } from "@repo/search";

const WORKSPACE_SEARCH_INDEX_LABELS: Record<string, string> = {
  hr_employee_records: "HR records",
};

export const getWorkspaceSearchIndexLabel = (indexKey: string): string =>
  WORKSPACE_SEARCH_INDEX_LABELS[indexKey] ?? indexKey;

export const resolveWorkspaceSearchResultHref = (
  indexKey: string,
  document: SearchDocument
): string | undefined => {
  if (typeof document.url === "string" && document.url.trim().length > 0) {
    return document.url.trim();
  }

  if (indexKey === "hr_employee_records") {
    return "/hr";
  }

  return undefined;
};
