import { hrOrgStore } from "./hr.workforce.org.store.ts";

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
  return [
    {
      key: hrOrgOverviewStatSurfaceKey,
      stats: [
        { id: "units", label: "Units", value: hrOrgStore.list().length },
        {
          id: "positions",
          label: "Positions",
          value: hrOrgStore.list().length,
        },
        { id: "reporting-lines", label: "Reporting lines", value: 0 },
      ],
    },
  ] as const;
}
