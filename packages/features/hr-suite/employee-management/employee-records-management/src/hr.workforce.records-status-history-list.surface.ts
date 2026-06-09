export const hrRecordsStatusHistorySurfaceKey =
  "hr.records.status-history" as const;
export const hrRecordsStatusHistorySearchParam = "statusHistorySearch" as const;

export function buildHrRecordsStatusHistoryListSurface(): {
  readonly key: typeof hrRecordsStatusHistorySurfaceKey;
  readonly searchParam: typeof hrRecordsStatusHistorySearchParam;
} {
  return {
    key: hrRecordsStatusHistorySurfaceKey,
    searchParam: hrRecordsStatusHistorySearchParam,
  } as const;
}
