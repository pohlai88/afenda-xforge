import {
  upsertHrOrgPositionAction,
  upsertHrOrgReportingRelationshipAction,
  upsertHrOrgUnitAction,
} from "../server.ts";

export type HrOrgExecutionSurface = {
  upsertPosition: typeof upsertHrOrgPositionAction;
  upsertReportingRelationship: typeof upsertHrOrgReportingRelationshipAction;
  upsertUnit: typeof upsertHrOrgUnitAction;
};

export const hrOrgExecutionSurface: HrOrgExecutionSurface = {
  upsertPosition: upsertHrOrgPositionAction,
  upsertReportingRelationship: upsertHrOrgReportingRelationshipAction,
  upsertUnit: upsertHrOrgUnitAction,
};
