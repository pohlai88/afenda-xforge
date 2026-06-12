import "server-only";

import { requireActiveTenantMembership } from "@repo/auth/server";
import {
  hasHrEmployeeRecordsSearch,
  syncAllHrEmployeeRecordsSearchDocuments,
} from "@repo/features-employee-management-employee-records-management/server";
import {
  hasPostgresSearchConfig,
  resolveSearchProvider,
} from "@repo/search/postgres";

export async function ensureWorkspaceSearchReady(): Promise<boolean> {
  if (resolveSearchProvider() === "postgres") {
    if (!hasPostgresSearchConfig()) {
      return false;
    }

    if (!hasHrEmployeeRecordsSearch()) {
      return true;
    }

    const membership = await requireActiveTenantMembership();
    await syncAllHrEmployeeRecordsSearchDocuments({
      tenantId: membership.tenantId,
    });
    return true;
  }

  if (!hasHrEmployeeRecordsSearch()) {
    return false;
  }

  const membership = await requireActiveTenantMembership();
  await syncAllHrEmployeeRecordsSearchDocuments({
    tenantId: membership.tenantId,
  });
  return true;
}
