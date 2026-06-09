import "server-only";

import type {
  HrEmployeeRecordPageModel,
  HrRecordsPageModelInput,
} from "./hr.workforce.records.contract.ts";
import { buildHrRecordsOverviewStatGroups } from "./hr.workforce.records-overview-stat.surface.ts";
import { hrRecordsRoutePaths } from "./hr.workforce.records-route.contract.ts";
import { parseHrRecordsSearchParams } from "./hr.workforce.records-search-params.parse.shared.ts";
import { listHrEmployeeRecordSummaries } from "./queries/records.query.ts";

type HrRecordsPageModel = HrEmployeeRecordPageModel & {
  overviewStats: readonly {
    key: string;
    stats: readonly {
      id: string;
      label: string;
      value: number;
    }[];
  }[];
};

export function buildHrRecordsPageModel(
  input: HrRecordsPageModelInput
): HrRecordsPageModel {
  const search = parseHrRecordsSearchParams({
    incompleteSearch: input.incompleteSearch,
    directorySearch: input.directorySearch,
    assignmentsSearch: input.assignmentsSearch,
    auditTrailSearch: input.auditTrailSearch,
    statusHistorySearch: input.statusHistorySearch,
    documentReferencesSearch: input.documentReferencesSearch,
    separatedSearch: input.separatedSearch,
    employmentStatusFilter: input.employmentStatusFilter,
  });

  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    canViewSensitive: input.canViewSensitive,
    routePaths: hrRecordsRoutePaths,
    search,
    overviewStats: buildHrRecordsOverviewStatGroups(input.organizationId),
    records: listHrEmployeeRecordSummaries(search, {
      canRead: true,
      organizationId: input.organizationId,
    }),
  } satisfies HrRecordsPageModel;
}
