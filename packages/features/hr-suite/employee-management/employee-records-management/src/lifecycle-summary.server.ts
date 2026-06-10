import "server-only";

import { getEmployeeLifecycleOverviewEntry } from "../../employee-lifecycle-management/src/server.ts";

export function getHrEmployeeLifecycleSummary(
  employeeId: string,
  context?: {
    organizationId?: string;
    canRead?: boolean;
    canViewSensitive?: boolean;
  }
) {
  return getEmployeeLifecycleOverviewEntry(
    employeeId,
    {
      companyId: context?.organizationId,
    },
    {
      canRead: context?.canRead ?? true,
      canViewSensitive: context?.canViewSensitive ?? false,
      companyId: context?.organizationId,
    }
  );
}
