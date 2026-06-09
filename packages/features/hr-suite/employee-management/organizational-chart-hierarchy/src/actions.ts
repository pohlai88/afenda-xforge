import "server-only";

import { runHrSuiteFeatureAction } from "./execution/action.ts";
import {
  upsertHrOrgPositionAction as upsertHrOrgPositionActionImpl,
  upsertHrOrgReportingRelationshipAction as upsertHrOrgReportingRelationshipActionImpl,
  upsertHrOrgUnitAction as upsertHrOrgUnitActionImpl,
} from "./hr.workforce.org.actions.server.ts";

export const upsertHrOrgPositionAction = (
  ...args: Parameters<typeof upsertHrOrgPositionActionImpl>
): ReturnType<typeof upsertHrOrgPositionActionImpl> =>
  runHrSuiteFeatureAction(() => upsertHrOrgPositionActionImpl(...args));

export const upsertHrOrgReportingRelationshipAction = (
  ...args: Parameters<typeof upsertHrOrgReportingRelationshipActionImpl>
): ReturnType<typeof upsertHrOrgReportingRelationshipActionImpl> =>
  runHrSuiteFeatureAction(() =>
    upsertHrOrgReportingRelationshipActionImpl(...args)
  );

export const upsertHrOrgUnitAction = (
  ...args: Parameters<typeof upsertHrOrgUnitActionImpl>
): ReturnType<typeof upsertHrOrgUnitActionImpl> =>
  runHrSuiteFeatureAction(() => upsertHrOrgUnitActionImpl(...args));
