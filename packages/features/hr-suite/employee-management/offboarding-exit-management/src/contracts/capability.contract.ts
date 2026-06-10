type CapabilityTuple = readonly [string, ...string[]];

export const offboardingExitManagementCapabilityValueMap = {
  overviewRead: "hr.offboarding.overview.read",
  casesRead: "hr.offboarding.cases.read",
  approvalsRead: "hr.offboarding.approvals.read",
  auditRead: "hr.offboarding.audit.read",
  sensitiveRead: "hr.offboarding.sensitive.read",
  casesWrite: "hr.offboarding.cases.write",
  approvalsWrite: "hr.offboarding.approvals.write",
  governanceWrite: "hr.offboarding.governance.write",
} as const;

export const offboardingExitManagementCapabilities =
  offboardingExitManagementCapabilityValueMap;

export type OffboardingExitManagementCapability =
  (typeof offboardingExitManagementCapabilityValueMap)[keyof typeof offboardingExitManagementCapabilityValueMap];

export type OffboardingExitManagementCapabilityGroup = {
  id: string;
  label: string;
  capabilities: CapabilityTuple;
};

export const offboardingExitManagementCapabilityCatalog: readonly OffboardingExitManagementCapability[] =
  Object.values(
    offboardingExitManagementCapabilityValueMap
  ) as readonly OffboardingExitManagementCapability[];

export const offboardingExitManagementCapabilityGroups: readonly OffboardingExitManagementCapabilityGroup[] =
  [
    {
      id: "overview",
      label: "Overview",
      capabilities: [offboardingExitManagementCapabilities.overviewRead],
    },
    {
      id: "cases",
      label: "Cases",
      capabilities: [
        offboardingExitManagementCapabilities.casesRead,
        offboardingExitManagementCapabilities.casesWrite,
      ],
    },
    {
      id: "approvals",
      label: "Approvals",
      capabilities: [
        offboardingExitManagementCapabilities.approvalsRead,
        offboardingExitManagementCapabilities.approvalsWrite,
      ],
    },
    {
      id: "audit",
      label: "Audit",
      capabilities: [
        offboardingExitManagementCapabilities.auditRead,
        offboardingExitManagementCapabilities.sensitiveRead,
      ],
    },
    {
      id: "governance",
      label: "Governance",
      capabilities: [offboardingExitManagementCapabilities.governanceWrite],
    },
  ];

export const offboardingExitManagementSensitiveCapabilities: readonly OffboardingExitManagementCapability[] =
  [
    offboardingExitManagementCapabilities.auditRead,
    offboardingExitManagementCapabilities.sensitiveRead,
  ];

export const offboardingExitManagementWriteCapabilities: readonly OffboardingExitManagementCapability[] =
  [
    offboardingExitManagementCapabilities.casesWrite,
    offboardingExitManagementCapabilities.approvalsWrite,
    offboardingExitManagementCapabilities.governanceWrite,
  ];
