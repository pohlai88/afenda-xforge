export const employeeLifecycleManagementRequirementCoverage = [
  "HRM-LCY-001",
  "HRM-LCY-002",
  "HRM-LCY-003",
  "HRM-LCY-004",
  "HRM-LCY-005",
  "HRM-LCY-006",
  "HRM-LCY-007",
  "HRM-LCY-008",
  "HRM-LCY-009",
  "HRM-LCY-010",
  "HRM-LCY-011",
  "HRM-LCY-012",
  "HRM-LCY-013",
  "HRM-LCY-014",
  "HRM-LCY-015",
  "HRM-LCY-016",
  "HRM-LCY-017",
  "HRM-LCY-018",
  "HRM-LCY-019",
  "HRM-LCY-020",
  "HRM-LCY-021",
  "HRM-LCY-022",
  "HRM-LCY-023",
  "HRM-LCY-024",
  "HRM-LCY-025",
  "HRM-LCY-026",
  "HRM-LCY-027",
  "HRM-LCY-028",
] as const;

export type EmployeeLifecycleManagementRequirementCode =
  (typeof employeeLifecycleManagementRequirementCoverage)[number];

export const employeeLifecycleManagementAcceptanceCoverage = [
  "AC-001",
  "AC-002",
  "AC-003",
  "AC-004",
  "AC-005",
  "AC-006",
  "AC-007",
  "AC-008",
  "AC-009",
  "AC-010",
  "AC-011",
  "AC-012",
  "AC-013",
  "AC-014",
  "AC-015",
  "AC-016",
  "AC-017",
  "AC-018",
  "AC-019",
  "AC-020",
] as const;

export type EmployeeLifecycleManagementAcceptanceCode =
  (typeof employeeLifecycleManagementAcceptanceCoverage)[number];
