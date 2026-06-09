import "server-only";

import type {
  HrOrgPageModel,
  HrOrgPageModelInput,
} from "./hr.workforce.org.contract.ts";
import { hrOrgStore } from "./hr.workforce.org.store.ts";
import { settleOrgListLoad } from "./hr.workforce.org-list-load.shared.ts";
import { buildHrOrgOverviewStatGroups } from "./hr.workforce.org-overview-stat.surface.ts";
import { parseHrOrgSearchParams } from "./hr.workforce.org-search-params.parse.shared.ts";
import { hrOrgUiCopy } from "./hr.workforce.org-ui.copy.shared.ts";
import {
  buildHrOrgAuditTrailListSurface,
  buildHrOrgHeadcountListSurface,
  buildHrOrgPositionsListSurface,
  buildHrOrgReportingLinesListSurface,
  buildHrOrgUnitsListSurface,
  buildHrOrgVacanciesListSurface,
} from "./hr.workforce.org-units-list.surface.ts";

export async function buildHrOrgPageModel(
  input: HrOrgPageModelInput
): Promise<HrOrgPageModel> {
  const search = parseHrOrgSearchParams({
    orgUnitsSearch: input.unitsSearch,
    orgPositionsSearch: input.positionsSearch,
    orgReportingLinesSearch: input.reportingLinesSearch,
    orgVacanciesSearch: input.vacanciesSearch,
    orgHeadcountSearch: input.headcountSearch,
    orgAuditTrailSearch: input.auditTrailSearch,
    orgUnitTypeFilter: input.unitTypeFilter,
    orgStatusFilter: input.statusFilter,
    orgLocationFilter: input.locationFilter,
    orgLegalEntityFilter: input.legalEntityFilter,
  });
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
      load: buildHrOrgOverviewStatGroups,
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.orgChart.title,
      load: () => hrOrgStore.list(),
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.units.surfaceHeaderTitle,
      load: buildHrOrgUnitsListSurface,
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.positions.surfaceHeaderTitle,
      load: buildHrOrgPositionsListSurface,
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.reportingLines.surfaceHeaderTitle,
      load: buildHrOrgReportingLinesListSurface,
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.vacancies.surfaceHeaderTitle,
      load: buildHrOrgVacanciesListSurface,
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.headcount.surfaceHeaderTitle,
      load: buildHrOrgHeadcountListSurface,
    }),
    settleOrgListLoad({
      sectionTitle: hrOrgUiCopy.auditTrail.surfaceHeaderTitle,
      load: buildHrOrgAuditTrailListSurface,
    }),
  ]);

  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    search,
    overviewStatGroups: snapshot.value ?? buildHrOrgOverviewStatGroups(),
    orgChartNodes: chart.value ?? hrOrgStore.list(),
    unitsList: units.value ?? buildHrOrgUnitsListSurface(),
    positionsList: positions.value ?? buildHrOrgPositionsListSurface(),
    reportingLinesList:
      reportingLines.value ?? buildHrOrgReportingLinesListSurface(),
    vacanciesList: vacancies.value ?? buildHrOrgVacanciesListSurface(),
    headcountList: headcount.value ?? buildHrOrgHeadcountListSurface(),
    auditTrailList: auditTrail.value ?? buildHrOrgAuditTrailListSurface(),
    employeePickerOptions: [],
    orgUnitPickerOptions: [],
  } satisfies HrOrgPageModel;
}
