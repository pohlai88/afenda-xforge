export const hrRecordsIncompleteSurfaceKey = "hr.records.incomplete" as const;
export const hrRecordsIncompleteSearchParam = "incompleteSearch" as const;

export function buildHrRecordsIncompleteListSurface(): {
  readonly key: typeof hrRecordsIncompleteSurfaceKey;
  readonly searchParam: typeof hrRecordsIncompleteSearchParam;
} {
  return {
    key: hrRecordsIncompleteSurfaceKey,
    searchParam: hrRecordsIncompleteSearchParam,
  } as const;
}
