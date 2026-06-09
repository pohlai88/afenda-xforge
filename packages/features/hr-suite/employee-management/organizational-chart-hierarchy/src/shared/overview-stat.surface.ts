import { hrOrgStore } from "../store.ts";

export const hrOrgOverviewStatSurfaceKey =
  "hr.workforce.org.overview.stats" as const;

export function buildHrOrgOverviewStatGroups(): readonly {
  key: typeof hrOrgOverviewStatSurfaceKey;
  stats: readonly {
    id: string;
    label: string;
    value: number;
  }[];
}[] {
  const units = hrOrgStore.listUnits();
  const positions = hrOrgStore.listPositions();
  const reportingLines = hrOrgStore.listReportingRelationships();
  const vacancies = hrOrgStore.listVacancies();
  const headcount = hrOrgStore.listHeadcount();

  return [
    {
      key: hrOrgOverviewStatSurfaceKey,
      stats: [
        { id: "units", label: "Units", value: units.length },
        { id: "positions", label: "Positions", value: positions.length },
        {
          id: "reporting-lines",
          label: "Reporting lines",
          value: reportingLines.length,
        },
        { id: "vacancies", label: "Vacancies", value: vacancies.length },
        {
          id: "headcount",
          label: "Headcount",
          value: headcount.reduce(
            (total, row) => total + row.activePositionCount,
            0
          ),
        },
      ],
    },
  ] as const;
}
