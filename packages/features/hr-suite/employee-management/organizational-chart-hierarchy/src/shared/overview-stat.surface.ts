import type { HrOrgOverviewProjection } from "../contracts/index.ts";

export const hrOrgOverviewStatSurfaceKey =
  "hr.workforce.org.overview.stats" as const;

export function buildHrOrgOverviewStatGroups(
  snapshot: HrOrgOverviewProjection
): readonly {
  key: typeof hrOrgOverviewStatSurfaceKey;
  stats: readonly {
    id: string;
    label: string;
    value: number;
  }[];
}[] {
  return [
    {
      key: hrOrgOverviewStatSurfaceKey,
      stats: [
        { id: "units", label: "Units", value: snapshot.totalUnits },
        {
          id: "positions",
          label: "Positions",
          value: snapshot.totalPositions,
        },
        {
          id: "reporting-lines",
          label: "Reporting lines",
          value: snapshot.totalReportingLines,
        },
        { id: "vacancies", label: "Vacancies", value: snapshot.totalVacancies },
        {
          id: "headcount",
          label: "Headcount",
          value: snapshot.totalHeadcount,
        },
      ],
    },
  ] as const;
}
