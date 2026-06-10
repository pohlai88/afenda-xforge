import "server-only";

import { systemAdminAccessSectionDefinition } from "./domains/access/metadata.ts";
import { systemAdminAuditSectionDefinition } from "./domains/audit/metadata.ts";
import { systemAdminCustomizationSectionDefinition } from "./domains/customization/metadata.ts";
import { systemAdminIntegrationsSectionDefinition } from "./domains/integrations/metadata.ts";
import { systemAdminOperationsSectionDefinition } from "./domains/operations/metadata.ts";
import { systemAdminOverviewSectionDefinition } from "./domains/overview/metadata.ts";
import {
  listSystemAdminSectionsFromRegistry,
  readSystemAdminOverviewFromRegistry,
} from "./domains/overview/queries.ts";
import { systemAdminTenantSettingsSectionDefinition } from "./domains/tenant-settings/metadata.ts";
import type {
  ListSystemAdminSectionsQuery,
  SystemAdminOverview,
  SystemAdminScope,
  SystemAdminSection,
} from "./schema.ts";

export const systemAdminSectionRegistry: readonly SystemAdminSection[] = [
  systemAdminOverviewSectionDefinition,
  systemAdminTenantSettingsSectionDefinition,
  systemAdminAccessSectionDefinition,
  systemAdminCustomizationSectionDefinition,
  systemAdminAuditSectionDefinition,
  systemAdminOperationsSectionDefinition,
  systemAdminIntegrationsSectionDefinition,
];

export const listSystemAdminSections = (
  query: ListSystemAdminSectionsQuery,
  context: SystemAdminScope
): SystemAdminSection[] =>
  listSystemAdminSectionsFromRegistry(
    systemAdminSectionRegistry,
    query,
    context
  );

export const readSystemAdminOverview = (
  context: SystemAdminScope
): SystemAdminOverview =>
  readSystemAdminOverviewFromRegistry(systemAdminSectionRegistry, context);

export { reviewSystemAdminCustomizationImport } from "./domains/customization/queries.ts";
