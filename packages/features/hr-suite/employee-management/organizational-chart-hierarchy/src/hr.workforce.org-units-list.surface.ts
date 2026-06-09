export const hrOrgUnitsSurfaceKey = "hr.workforce.org.units.list" as const;
export const hrOrgPositionsSurfaceKey =
  "hr.workforce.org.positions.list" as const;
export const hrOrgReportingLinesSurfaceKey =
  "hr.workforce.org.reporting-lines.list" as const;
export const hrOrgVacanciesSurfaceKey =
  "hr.workforce.org.vacancies.list" as const;
export const hrOrgHeadcountSurfaceKey =
  "hr.workforce.org.headcount.list" as const;
export const hrOrgAuditTrailSurfaceKey =
  "hr.workforce.org.audit-trail.list" as const;

export const hrOrgUnitsSearchParam = "orgUnitsSearch" as const;
export const hrOrgPositionsSearchParam = "orgPositionsSearch" as const;
export const hrOrgReportingLinesSearchParam =
  "orgReportingLinesSearch" as const;
export const hrOrgVacanciesSearchParam = "orgVacanciesSearch" as const;
export const hrOrgHeadcountSearchParam = "orgHeadcountSearch" as const;
export const hrOrgAuditTrailSearchParam = "orgAuditTrailSearch" as const;

export function buildHrOrgUnitsListSurface(): {
  readonly key: typeof hrOrgUnitsSurfaceKey;
} {
  return { key: hrOrgUnitsSurfaceKey } as const;
}

export function buildHrOrgPositionsListSurface(): {
  readonly key: typeof hrOrgPositionsSurfaceKey;
} {
  return { key: hrOrgPositionsSurfaceKey } as const;
}

export function buildHrOrgReportingLinesListSurface(): {
  readonly key: typeof hrOrgReportingLinesSurfaceKey;
} {
  return { key: hrOrgReportingLinesSurfaceKey } as const;
}

export function buildHrOrgVacanciesListSurface(): {
  readonly key: typeof hrOrgVacanciesSurfaceKey;
} {
  return { key: hrOrgVacanciesSurfaceKey } as const;
}

export function buildHrOrgHeadcountListSurface(): {
  readonly key: typeof hrOrgHeadcountSurfaceKey;
} {
  return { key: hrOrgHeadcountSurfaceKey } as const;
}

export function buildHrOrgAuditTrailListSurface(): {
  readonly key: typeof hrOrgAuditTrailSurfaceKey;
} {
  return { key: hrOrgAuditTrailSurfaceKey } as const;
}
