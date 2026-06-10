import "server-only";

import { requirePermission } from "@repo/permissions";
import { createSystemAdminPermissionContext } from "../../feature-scope.ts";
import type {
  ListSystemAdminSectionsQuery,
  SystemAdminOverview,
  SystemAdminScope,
  SystemAdminSection,
} from "../../schema.ts";
import { overviewCapabilities } from "./contract.ts";

const overviewWarnings = [
  "Full admin UI route is deferred until the admin shell is finalized.",
  "System admin must compose governed foundation packages and must not own platform authority.",
] as const;

export const listSystemAdminSectionsFromRegistry = (
  sections: readonly SystemAdminSection[],
  query: ListSystemAdminSectionsQuery,
  context: SystemAdminScope
): SystemAdminSection[] => {
  requirePermission(
    createSystemAdminPermissionContext(
      context,
      overviewCapabilities.overviewRead
    ),
    { allOf: [overviewCapabilities.overviewRead] }
  );

  return sections.filter(
    (section) => !query.domain || section.domain === query.domain
  );
};

export const readSystemAdminOverviewFromRegistry = (
  sections: readonly SystemAdminSection[],
  context: SystemAdminScope
): SystemAdminOverview => ({
  sections: listSystemAdminSectionsFromRegistry(sections, {}, context),
  tenantId: context.tenantId,
  warnings: [...overviewWarnings],
});
