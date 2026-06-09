import "server-only";

import {
  hrOrgAuditEventProjectionSchema,
  hrOrgChartNodeProjectionSchema,
  hrOrgOverviewProjectionSchema,
  hrOrgPositionProjectionSchema,
  hrOrgReportingRelationshipProjectionSchema,
  hrOrgUnitProjectionSchema,
} from "../contracts/index.ts";
import type {
  HrOrgAuditTrailListRow,
  HrOrgChartNode,
  HrOrgHeadcountListRow,
  HrOrgListWindow,
  HrOrgPositionListRow,
  HrOrgReportingRelationshipListRow,
  HrOrgUnitListRow,
  HrOrgVacancyListRow,
} from "../contracts/org-model.contract.ts";
import { hrOrgStore } from "../store.ts";

const toWindow = <TItem>(rows: readonly TItem[]): HrOrgListWindow<TItem> => ({
  rows,
  pageSize: rows.length,
  totalCount: rows.length,
  hasNextPage: false,
});

export function loadHrOrgChartTreeNodes(): readonly HrOrgChartNode[] {
  return hrOrgStore
    .list()
    .map((row) => hrOrgChartNodeProjectionSchema.parse(row));
}

export function loadHrOrgOverviewSnapshot(): {
  totalUnits: number;
  totalPositions: number;
  totalVacancies: number;
  totalHeadcount: number;
} {
  const units = hrOrgStore.listUnits();
  const positions = hrOrgStore.listPositions();
  const vacancies = hrOrgStore.listVacancies();
  const headcount = hrOrgStore.listHeadcount();

  return hrOrgOverviewProjectionSchema.parse({
    totalUnits: units.length,
    totalPositions: positions.length,
    totalVacancies: vacancies.length,
    totalHeadcount: headcount.reduce(
      (total, row) => total + row.activePositionCount,
      0
    ),
  });
}

export function listHrOrgUnitsWindow(): HrOrgListWindow<HrOrgUnitListRow> {
  return toWindow(
    hrOrgStore.listUnits().map((row) => hrOrgUnitProjectionSchema.parse(row))
  );
}

export function listHrOrgPositionsWindow(): HrOrgListWindow<HrOrgPositionListRow> {
  return toWindow(
    hrOrgStore
      .listPositions()
      .map((row) => hrOrgPositionProjectionSchema.parse(row))
  );
}

export function listHrOrgReportingLinesWindow(): HrOrgListWindow<HrOrgReportingRelationshipListRow> {
  return toWindow(
    hrOrgStore
      .listReportingRelationships()
      .map((row) => hrOrgReportingRelationshipProjectionSchema.parse(row))
  );
}

export function listHrVacantPositionsWindow(): HrOrgListWindow<HrOrgVacancyListRow> {
  return toWindow(hrOrgStore.listVacancies());
}

export function listHrOrgHeadcountWindow(): HrOrgListWindow<HrOrgHeadcountListRow> {
  return toWindow(hrOrgStore.listHeadcount());
}

export function listHrOrgStructureAuditTrailWindow(): HrOrgListWindow<HrOrgAuditTrailListRow> {
  return toWindow(
    hrOrgStore
      .listAuditEvents()
      .map((row) => hrOrgAuditEventProjectionSchema.parse(row))
  );
}
