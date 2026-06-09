export type EmployeeLifecycleManagementExecutionContext = Readonly<{
  actorId?: string;
  companyId?: string;
  requestId?: string;
  tenantId?: string;
}>;

export const runEmployeeLifecycleManagementAction = <T>(
  operation: () => T
): T => operation();
