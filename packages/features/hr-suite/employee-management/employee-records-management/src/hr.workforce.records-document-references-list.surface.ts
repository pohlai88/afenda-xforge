export const hrRecordsDocumentReferencesSurfaceKey =
  "hr.records.document-references" as const;
export const hrRecordsDocumentReferencesSearchParam =
  "documentReferencesSearch" as const;

export function buildHrRecordsDocumentReferencesListSurface(): {
  readonly key: typeof hrRecordsDocumentReferencesSurfaceKey;
  readonly searchParam: typeof hrRecordsDocumentReferencesSearchParam;
} {
  return {
    key: hrRecordsDocumentReferencesSurfaceKey,
    searchParam: hrRecordsDocumentReferencesSearchParam,
  } as const;
}
