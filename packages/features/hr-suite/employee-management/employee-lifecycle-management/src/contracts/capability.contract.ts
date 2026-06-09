type CapabilityTuple = readonly [string, ...string[]];

export const employeeLifecycleManagementCapabilityValueMap = {
  overviewRead: "hr.lifecycle.overview.read",
  stagesRead: "hr.lifecycle.stages.read",
  historyRead: "hr.lifecycle.history.read",
  transitionsWrite: "hr.lifecycle.transitions.write",
  workflowRead: "hr.lifecycle.workflow.read",
  workflowWrite: "hr.lifecycle.workflow.write",
  auditRead: "hr.lifecycle.audit.read",
  sensitiveRead: "hr.lifecycle.sensitive.read",
} as const;

export const employeeLifecycleManagementCapabilities: typeof employeeLifecycleManagementCapabilityValueMap =
  employeeLifecycleManagementCapabilityValueMap;

export type EmployeeLifecycleManagementCapability =
  (typeof employeeLifecycleManagementCapabilityValueMap)[keyof typeof employeeLifecycleManagementCapabilityValueMap];

export type EmployeeLifecycleManagementCapabilityGroup = {
  id: string;
  label: string;
  capabilities: CapabilityTuple;
};

export const employeeLifecycleManagementCapabilityCatalog: readonly EmployeeLifecycleManagementCapability[] =
  Object.values(
    employeeLifecycleManagementCapabilityValueMap
  ) as readonly EmployeeLifecycleManagementCapability[];

export const employeeLifecycleManagementCapabilityGroups: readonly EmployeeLifecycleManagementCapabilityGroup[] =
  [
    {
      id: "overview",
      label: "Overview",
      capabilities: [employeeLifecycleManagementCapabilities.overviewRead],
    },
    {
      id: "lifecycle",
      label: "Lifecycle",
      capabilities: [
        employeeLifecycleManagementCapabilities.stagesRead,
        employeeLifecycleManagementCapabilities.historyRead,
        employeeLifecycleManagementCapabilities.transitionsWrite,
      ],
    },
    {
      id: "automation",
      label: "Automation",
      capabilities: [
        employeeLifecycleManagementCapabilities.workflowRead,
        employeeLifecycleManagementCapabilities.workflowWrite,
      ],
    },
    {
      id: "audit",
      label: "Audit",
      capabilities: [
        employeeLifecycleManagementCapabilities.auditRead,
        employeeLifecycleManagementCapabilities.sensitiveRead,
      ],
    },
  ];

export const employeeLifecycleManagementSensitiveCapabilities: readonly EmployeeLifecycleManagementCapability[] =
  [
    employeeLifecycleManagementCapabilities.auditRead,
    employeeLifecycleManagementCapabilities.sensitiveRead,
  ];

export const employeeLifecycleManagementWriteCapabilities: readonly EmployeeLifecycleManagementCapability[] =
  [
    employeeLifecycleManagementCapabilities.transitionsWrite,
    employeeLifecycleManagementCapabilities.workflowWrite,
  ];
