export const hrRecordsAuditTrailSurfaceKey = "hr.records.audit-trail" as const;
export const hrRecordsAuditTrailSearchParam = "auditTrailSearch" as const;

export function buildHrRecordsAuditTrailListSurface(): {
  readonly key: typeof hrRecordsAuditTrailSurfaceKey;
  readonly searchParam: typeof hrRecordsAuditTrailSearchParam;
} {
  return {
    key: hrRecordsAuditTrailSurfaceKey,
    searchParam: hrRecordsAuditTrailSearchParam,
  } as const;
}
