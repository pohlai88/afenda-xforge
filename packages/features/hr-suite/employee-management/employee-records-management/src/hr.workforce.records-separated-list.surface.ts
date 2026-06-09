export const hrRecordsSeparatedSurfaceKey = "hr.records.separated" as const;
export const hrRecordsSeparatedSearchParam = "separatedSearch" as const;

export function buildHrRecordsSeparatedListSurface(): {
  readonly key: typeof hrRecordsSeparatedSurfaceKey;
  readonly searchParam: typeof hrRecordsSeparatedSearchParam;
} {
  return {
    key: hrRecordsSeparatedSurfaceKey,
    searchParam: hrRecordsSeparatedSearchParam,
  } as const;
}
