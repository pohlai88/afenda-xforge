type NonEmptyStringList = readonly [string, ...string[]];

export type EmployeeLifecycleManagementBoundedContext = {
  ownedCapabilities: NonEmptyStringList;
  ownedEntities: NonEmptyStringList;
  inputs: NonEmptyStringList;
  outputs: NonEmptyStringList;
  exclusions: NonEmptyStringList;
};

export const employeeLifecycleManagementBoundedContext: EmployeeLifecycleManagementBoundedContext =
  {
    ownedCapabilities: [
      "lifecycle-stage-governance",
      "effective-dated-transitions",
      "workflow-orchestration",
      "notifications-and-reminders",
      "audit-history",
    ],
    ownedEntities: [
      "lifecycle-stage-definition",
      "lifecycle-transition",
      "lifecycle-history-entry",
      "workflow-trigger",
      "audit-event",
    ],
    inputs: [
      "employee-record-created",
      "employment-status-changed",
      "manager-changed",
      "contract-changed",
      "approval-decision-recorded",
    ],
    outputs: [
      "current-lifecycle-state",
      "transition-history",
      "workflow-trigger",
      "notifications",
      "audit-event",
    ],
    exclusions: [
      "employee-master-profile",
      "document-binary-storage",
      "organization-hierarchy-design",
      "payroll-calculation",
      "leave-balance-calculation",
      "attendance-records",
      "compliance-rule-monitoring",
      "iam-permission-design",
      "exit-interview-execution",
    ],
  } as const;
