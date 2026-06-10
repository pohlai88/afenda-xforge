export const offboardingExitManagementRequirementCoverage = [
  "HRM-OFF-001",
  "HRM-OFF-002",
  "HRM-OFF-003",
  "HRM-OFF-004",
  "HRM-OFF-005",
  "HRM-OFF-024",
  "HRM-OFF-025",
  "HRM-OFF-028",
] as const;

export type OffboardingExitManagementRequirementCode =
  (typeof offboardingExitManagementRequirementCoverage)[number];

export const offboardingExitManagementAcceptanceCoverage = [
  "AC-001",
  "AC-002",
  "AC-005",
  "AC-021",
  "AC-022",
  "AC-024",
] as const;

export type OffboardingExitManagementAcceptanceCode =
  (typeof offboardingExitManagementAcceptanceCoverage)[number];
