import "server-only";

import type {
  HrOrgListWindow,
  HrOrgPageModel,
  HrOrgPageModelInput,
  HrOrgSearchParams,
} from "./contracts/org-model.contract.ts";
import type {
  ListHrOrgPositionsQuery,
  ListHrOrgReportingRelationshipsQuery,
  ListHrOrgUnitsQuery,
} from "./contracts/query.contract.ts";
import {
  listHrOrgHeadcountWindow,
  listHrOrgPositionsWindow,
  listHrOrgReportingLinesWindow,
  listHrOrgStructureAuditTrailWindow,
  listHrOrgUnitsWindow,
  listHrVacantPositionsWindow,
  loadHrOrgChartTreeNodes,
} from "./queries.ts";
import { settleOrgListLoad } from "./shared/list-load.shared.ts";
import { buildHrOrgOverviewStatGroups } from "./shared/overview-stat.surface.ts";
import { hrOrgUiCopy } from "./shared/ui-copy.shared.ts";

const emptyWindow = <TItem>(): HrOrgListWindow<TItem> => ({
  rows: [],
  pageSize: 0,
  totalCount: 0,
  hasNextPage: false,
});

export async function buildHrOrgPageModel(
  input: HrOrgPageModelInput
): Promise<HrOrgPageModel> {
  const search = {
    unitsSearch: input.unitsSearch,
    positionsSearch: input.positionsSearch,
    reportingLinesSearch: input.reportingLinesSearch,
    vacanciesSearch: input.vacanciesSearch,
    headcountSearch: input.headcountSearch,
    auditTrailSearch: input.auditTrailSearch,
    unitTypeFilter: input.unitTypeFilter,
    statusFilter: input.statusFilter,
    locationFilter: input.locationFilter,
    legalEntityFilter: input.legalEntityFilter,
  } satisfies HrOrgSearchParams;
  const unitListQuery = {
    search: search.unitsSearch,
    unitType: search.unitTypeFilter,
    status: search.statusFilter,
    locationCode: search.locationFilter,
    legalEntityCode: search.legalEntityFilter,
  } satisfies ListHrOrgUnitsQuery;
  const positionListQuery = {
    search: search.positionsSearch,
    status: search.statusFilter,
    locationCode: search.locationFilter,
    legalEntityCode: search.legalEntityFilter,
  } satisfies ListHrOrgPositionsQuery;
  const reportingLineListQuery = {
    search: search.reportingLinesSearch,
  } satisfies ListHrOrgReportingRelationshipsQuery;
  const [
    snapshot,
    chart,
    units,
    positions,
    reportingLines,
    vacancies,
    headcount,
    auditTrail,
  ] = await Promise.all([
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.overview.structureLabel,
      load: () => buildHrOrgOverviewStatGroups(input.readContext),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.orgChart.title,
      load: () => loadHrOrgChartTreeNodes(input.readContext),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.units.surfaceHeaderTitle,
      load: () => listHrOrgUnitsWindow(unitListQuery, input.readContext),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.positions.surfaceHeaderTitle,
      load: () =>
        listHrOrgPositionsWindow(positionListQuery, input.readContext),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.reportingLines.surfaceHeaderTitle,
      load: () =>
        listHrOrgReportingLinesWindow(
          reportingLineListQuery,
          input.readContext
        ),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.vacancies.surfaceHeaderTitle,
      load: () => listHrVacantPositionsWindow(input.readContext),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.headcount.surfaceHeaderTitle,
      load: () => listHrOrgHeadcountWindow(input.readContext),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.auditTrail.surfaceHeaderTitle,
      load: () => listHrOrgStructureAuditTrailWindow(input.readContext),
    }),
  ]);

  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    search,
    overviewStatGroups:
      snapshot.value ?? buildHrOrgOverviewStatGroups(input.readContext),
    orgChartNodes: chart.value ?? [],
    unitsList: units.value ?? emptyWindow(),
    positionsList: positions.value ?? emptyWindow(),
    reportingLinesList: reportingLines.value ?? emptyWindow(),
    vacanciesList: vacancies.value ?? emptyWindow(),
    headcountList: headcount.value ?? emptyWindow(),
    auditTrailList: auditTrail.value ?? emptyWindow(),
  } satisfies HrOrgPageModel;
}
