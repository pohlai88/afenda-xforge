import "server-only";

import { hrWorkforceEssRoutePaths } from "./contract.ts";
import { getEmployeeSelfservicePortalProfile } from "./queries/profile.query.ts";
import type {
  EmployeeSelfservicePortalProfileQuery,
  EmployeeSelfservicePortalProfileView,
} from "./schema.ts";
import type { HrSuiteFeatureContext } from "./shared/index.ts";

export type EmployeeSelfservicePortalProfilePageModel = {
  profile: EmployeeSelfservicePortalProfileView;
  routePath: string;
};

export function buildEmployeeSelfservicePortalProfilePageModel(
  query: EmployeeSelfservicePortalProfileQuery = {},
  context?: HrSuiteFeatureContext
): EmployeeSelfservicePortalProfilePageModel | null {
  const profile = getEmployeeSelfservicePortalProfile(query, context);

  if (!profile) {
    return null;
  }

  return {
    profile,
    routePath: `${hrWorkforceEssRoutePaths.hub}/profile`,
  };
}
