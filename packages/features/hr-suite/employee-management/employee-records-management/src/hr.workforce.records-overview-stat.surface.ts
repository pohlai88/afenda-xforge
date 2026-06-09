import { loadHrRecordsOverviewSnapshot } from "./hr.workforce.records-overview.shared.ts";

export const hrRecordsOverviewStatSurfaceKey =
  "hr.records.overview.stats" as const;

export function buildHrRecordsOverviewStatGroups(
  organizationId?: string
): readonly {
  key: typeof hrRecordsOverviewStatSurfaceKey;
  stats: readonly {
    id: string;
    label: string;
    value: number;
  }[];
}[] {
  const snapshot = loadHrRecordsOverviewSnapshot(organizationId);

  return [
    {
      key: hrRecordsOverviewStatSurfaceKey,
      stats: [
        { id: "total", label: "Employees", value: snapshot.totalCount },
        { id: "active", label: "Active", value: snapshot.activeCount },
        { id: "archived", label: "Archived", value: snapshot.archivedCount },
      ],
    },
  ] as const;
}
