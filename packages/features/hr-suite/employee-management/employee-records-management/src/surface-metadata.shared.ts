import {
  hrRecordsAssignmentsSearchParam,
  hrRecordsAssignmentsSurfaceKey,
} from "./assignments-list.surface.ts";
import {
  hrRecordsAuditTrailSearchParam,
  hrRecordsAuditTrailSurfaceKey,
} from "./audit-trail-list.surface.ts";
import {
  hrRecordsDirectorySearchParam,
  hrRecordsDirectorySurfaceKey,
  hrRecordsEmploymentStatusFilterParam,
} from "./directory-list.surface.ts";
import {
  hrRecordsDocumentReferencesSearchParam,
  hrRecordsDocumentReferencesSurfaceKey,
} from "./document-references-list.surface.ts";
import {
  hrRecordsIncompleteSearchParam,
  hrRecordsIncompleteSurfaceKey,
} from "./incomplete-list.surface.ts";
import {
  hrRecordsSeparatedSearchParam,
  hrRecordsSeparatedSurfaceKey,
} from "./separated-list.surface.ts";
import {
  hrRecordsStatusHistorySearchParam,
  hrRecordsStatusHistorySurfaceKey,
} from "./status-history-list.surface.ts";
import {
  hrRecordsAssignmentsColumnsId,
  hrRecordsAuditTrailColumnsId,
  hrRecordsDirectoryColumnsId,
  hrRecordsDocumentReferencesColumnsId,
  hrRecordsIncompleteColumnsId,
  hrRecordsSeparatedColumnsId,
  hrRecordsStatusHistoryColumnsId,
} from "./surface-columns.shared.ts";

export const HR_RECORDS_LIST_SURFACE_KEYS = [
  hrRecordsIncompleteSurfaceKey,
  hrRecordsDirectorySurfaceKey,
  hrRecordsAssignmentsSurfaceKey,
  hrRecordsAuditTrailSurfaceKey,
  hrRecordsStatusHistorySurfaceKey,
  hrRecordsDocumentReferencesSurfaceKey,
  hrRecordsSeparatedSurfaceKey,
] as const;

export type HrRecordsListSurfaceKey =
  (typeof HR_RECORDS_LIST_SURFACE_KEYS)[number];

export function getHrRecordsListSurfaceKeys(): readonly HrRecordsListSurfaceKey[] {
  return HR_RECORDS_LIST_SURFACE_KEYS;
}

export const HR_RECORDS_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrRecordsIncompleteSurfaceKey]: hrRecordsIncompleteColumnsId,
  [hrRecordsDirectorySurfaceKey]: hrRecordsDirectoryColumnsId,
  [hrRecordsAssignmentsSurfaceKey]: hrRecordsAssignmentsColumnsId,
  [hrRecordsAuditTrailSurfaceKey]: hrRecordsAuditTrailColumnsId,
  [hrRecordsStatusHistorySurfaceKey]: hrRecordsStatusHistoryColumnsId,
  [hrRecordsDocumentReferencesSurfaceKey]: hrRecordsDocumentReferencesColumnsId,
  [hrRecordsSeparatedSurfaceKey]: hrRecordsSeparatedColumnsId,
} as const;

export const HR_RECORDS_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrRecordsIncompleteSurfaceKey]: hrRecordsIncompleteSearchParam,
  [hrRecordsDirectorySurfaceKey]: hrRecordsDirectorySearchParam,
  [hrRecordsAssignmentsSurfaceKey]: hrRecordsAssignmentsSearchParam,
  [hrRecordsAuditTrailSurfaceKey]: hrRecordsAuditTrailSearchParam,
  [hrRecordsStatusHistorySurfaceKey]: hrRecordsStatusHistorySearchParam,
  [hrRecordsDocumentReferencesSurfaceKey]:
    hrRecordsDocumentReferencesSearchParam,
  [hrRecordsSeparatedSurfaceKey]: hrRecordsSeparatedSearchParam,
} as const;

export const HR_RECORDS_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  [hrRecordsIncompleteSearchParam]: "incompleteSearch",
  [hrRecordsDirectorySearchParam]: "directorySearch",
  [hrRecordsAssignmentsSearchParam]: "assignmentsSearch",
  [hrRecordsAuditTrailSearchParam]: "auditTrailSearch",
  [hrRecordsStatusHistorySearchParam]: "statusHistorySearch",
  [hrRecordsDocumentReferencesSearchParam]: "documentReferencesSearch",
  [hrRecordsSeparatedSearchParam]: "separatedSearch",
  [hrRecordsEmploymentStatusFilterParam]: "employmentStatusFilter",
} as const;

export const HR_RECORDS_WORKBENCH_READ_ONLY_SURFACE_KEYS =
  new Set<HrRecordsListSurfaceKey>([
    hrRecordsAssignmentsSurfaceKey,
    hrRecordsAuditTrailSurfaceKey,
    hrRecordsStatusHistorySurfaceKey,
    hrRecordsDocumentReferencesSurfaceKey,
  ]);
