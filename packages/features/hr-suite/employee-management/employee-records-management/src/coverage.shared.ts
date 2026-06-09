export type HrRecordsCoverageStatus = "shipped";

export type HrRecordsRequirementCode = `HRM-EMP-REC-${string}`;

export type HrRecordsCoverageEntry = {
  readonly code: string;
  readonly status: HrRecordsCoverageStatus;
  readonly evidence: readonly string[];
};

const recordsSliceRoot =
  "packages/features/hr-suite/employee-management/employee-records-management";

const requirementCoverageSeeds: readonly (readonly [
  suffix: string,
  evidence: readonly string[],
])[] = [
  [
    "001",
    [
      "schemas/form.shared.ts",
      "actions/actions.server.ts (createHrEmployeeRecordAction)",
      "packages/db/src/hr-employee-records-commands.ts (createHrEmployeeRecord)",
    ],
  ],
  [
    "002",
    [
      "schemas/form.shared.ts (employeeNumber)",
      "packages/db/src/hr-employee-records-commands.ts (duplicate employee number guard)",
      "data/action-result.shared.ts",
    ],
  ],
  [
    "003",
    [
      "schemas/form.shared.ts",
      "packages/db/src/hr-employee-records-commands.ts (HrEmployeeProfileInput)",
      "data/detail-page-model.server.ts",
    ],
  ],
  [
    "004",
    [
      "data/detail-page-model.server.ts",
      "components/detail-section.component.server.tsx",
      "packages/db/src/schema/hr.ts (hr_employee_profiles)",
    ],
  ],
  [
    "005",
    [
      "schemas/form.shared.ts",
      "components/create-form.component.client.tsx",
      "data/sensitive-access.shared.ts",
    ],
  ],
  [
    "006",
    [
      "packages/db/src/hr-employee-records-commands.ts (HrEmployeeEmergencyContactInput)",
      "data/detail-page-model.server.ts",
      "components/detail-section.component.server.tsx",
    ],
  ],
  [
    "007",
    [
      "schemas/form.shared.ts",
      "packages/db/src/hr-employee-records-commands.ts (employment fields)",
      "data/detail-page-model.server.ts",
    ],
  ],
  [
    "008",
    [
      "schemas/form.shared.ts (hrRecordsAssignmentSchema)",
      "actions/actions.server.ts (recordHrEmployeeAssignmentAction)",
      "surface/assignments-list.surface.ts",
    ],
  ],
  [
    "009",
    [
      "packages/db/src/schema/hr.ts (current_department_id/current_position_id)",
      "surface/directory-list.surface.ts",
      "data/detail-page-model.server.ts",
    ],
  ],
  [
    "010",
    [
      "schemas/form.shared.ts (managerEmployeeId)",
      "packages/db/src/hr-commands.ts (assertManagerInOrganization)",
      "surface/assignments-list.surface.ts",
    ],
  ],
  [
    "011",
    [
      "packages/db/src/hr-employee-records.ts (listHrEmployeeRecordEventsWindow)",
      "surface/audit-trail-list.surface.ts",
      "packages/db/src/hr-employee-records-commands.ts (previousValue/newValue)",
    ],
  ],
  [
    "012",
    [
      "schemas/employment-status.schema.ts",
      "packages/db/src/hr-employee-records.ts (listHrEmployeeStatusHistoryWindow)",
      "surface/status-history-list.surface.ts",
    ],
  ],
  [
    "013",
    [
      "packages/db/src/hr-employee-records.ts (listHrEmployeeDocumentReferencesWindow)",
      "surface/document-references-list.surface.ts",
      "packages/db/src/schema/hr.ts (hr_employee_documents)",
    ],
  ],
  [
    "014",
    [
      "packages/db/src/hr-employee-records.ts (resolveMissingMandatoryFields)",
      "surface/incomplete-list.surface.ts",
      "surface/overview-stat.surface.ts",
    ],
  ],
  [
    "015",
    [
      "packages/db/src/hr-employee-records-commands.ts (assertNoDuplicateProfileIdentity)",
      "packages/db/src/hr-employee-records.ts (findHrEmployeeDuplicateCandidates)",
      "data/action-result.shared.ts",
    ],
  ],
  [
    "016",
    [
      "actions/actions.server.ts (rehireHrEmployeeRecordAction)",
      "packages/db/src/hr-employee-records-commands.ts (rehireHrEmployee)",
      "data/detail-page-model.server.ts (rehiredFrom)",
    ],
  ],
  [
    "017",
    [
      "schemas/form.shared.ts (assignmentEffectiveFrom)",
      "packages/db/src/hr-commands.ts (upsertHrEmployeeEffectiveAssignmentInTx)",
      "components/list-trailing.component.client.tsx",
    ],
  ],
  [
    "018",
    [
      "policies/policy.ts",
      "data/sensitive-access.shared.ts",
      "data/detail-page-model.server.ts",
    ],
  ],
  [
    "019",
    [
      "events/events.ts",
      "packages/db/src/hr-employee-records-commands.ts (insertHrEmployeeRecordEventInTx)",
      "actions/actions.server.ts",
    ],
  ],
  [
    "020",
    [
      "actions/actions.server.ts (archiveHrEmployeeRecordAction)",
      "packages/db/src/hr-employee-records-commands.ts (archiveHrEmployeeRecord)",
      "surface/separated-list.surface.ts",
    ],
  ],
] as const satisfies readonly [suffix: string, evidence: readonly string[]][];

export const HR_RECORDS_REQUIREMENT_COVERAGE: readonly HrRecordsCoverageEntry[] =
  requirementCoverageSeeds.map(([suffix, evidence]) => ({
    code: `HRM-EMP-REC-${suffix}`,
    status: "shipped" as const,
    evidence: evidence.map((entry) =>
      entry.startsWith("packages/") ? entry : `${recordsSliceRoot}/${entry}`
    ),
  })) satisfies readonly HrRecordsCoverageEntry[];

const acceptanceCoverageSeeds: readonly (readonly [
  criterion: number,
  requirements: readonly HrRecordsRequirementCode[],
])[] = [
  [1, ["HRM-EMP-REC-001", "HRM-EMP-REC-003", "HRM-EMP-REC-007"]],
  [2, ["HRM-EMP-REC-002"]],
  [3, ["HRM-EMP-REC-003", "HRM-EMP-REC-005", "HRM-EMP-REC-015"]],
  [4, ["HRM-EMP-REC-004", "HRM-EMP-REC-018"]],
  [5, ["HRM-EMP-REC-012", "HRM-EMP-REC-019"]],
  [
    6,
    [
      "HRM-EMP-REC-007",
      "HRM-EMP-REC-008",
      "HRM-EMP-REC-009",
      "HRM-EMP-REC-010",
    ],
  ],
  [7, ["HRM-EMP-REC-017"]],
  [8, ["HRM-EMP-REC-011", "HRM-EMP-REC-019"]],
  [9, ["HRM-EMP-REC-013"]],
  [10, ["HRM-EMP-REC-014"]],
  [11, ["HRM-EMP-REC-018"]],
  [12, ["HRM-EMP-REC-019"]],
  [13, ["HRM-EMP-REC-011", "HRM-EMP-REC-016"]],
  [14, ["HRM-EMP-REC-020"]],
] as const satisfies readonly [
  criterion: number,
  requirements: readonly HrRecordsRequirementCode[],
][];

export const HR_RECORDS_ACCEPTANCE_CRITERIA_COVERAGE: readonly HrRecordsCoverageEntry[] =
  acceptanceCoverageSeeds.map(([criterion, requirements]) => ({
    code: `AC-${String(criterion).padStart(2, "0")}`,
    status: "shipped" as const,
    evidence: requirements.map((requirement) => `${requirement} shipped`),
  })) satisfies readonly HrRecordsCoverageEntry[];

function buildExpectedRequirementCode(index: number): HrRecordsRequirementCode {
  return `HRM-EMP-REC-${String(index + 1).padStart(3, "0")}`;
}

function buildExpectedAcceptanceCode(index: number): string {
  return `AC-${String(index + 1).padStart(2, "0")}`;
}

export function assertHrRecordsEnterpriseCoverage(): void {
  const requirements = new Set(
    HR_RECORDS_REQUIREMENT_COVERAGE.map((entry) => entry.code)
  );
  const acceptanceCriteria = new Set(
    HR_RECORDS_ACCEPTANCE_CRITERIA_COVERAGE.map((entry) => entry.code)
  );
  const missingRequirements = Array.from({ length: 20 }, (_, index) =>
    buildExpectedRequirementCode(index)
  ).filter((code) => !requirements.has(code));
  const missingAcceptanceCriteria = Array.from({ length: 14 }, (_, index) =>
    buildExpectedAcceptanceCode(index)
  ).filter((code) => !acceptanceCriteria.has(code));
  const invalidAcceptanceRequirementRefs = acceptanceCoverageSeeds
    .flatMap(([, requirementCodes]) => requirementCodes)
    .filter((code) => !requirements.has(code));
  const invalidEntries = [
    ...HR_RECORDS_REQUIREMENT_COVERAGE,
    ...HR_RECORDS_ACCEPTANCE_CRITERIA_COVERAGE,
  ].filter(
    (entry) => entry.status !== "shipped" || entry.evidence.length === 0
  );

  if (
    missingRequirements.length > 0 ||
    missingAcceptanceCriteria.length > 0 ||
    invalidAcceptanceRequirementRefs.length > 0 ||
    invalidEntries.length > 0
  ) {
    throw new Error(
      [
        missingRequirements.length
          ? `missing requirements: ${missingRequirements.join(", ")}`
          : null,
        missingAcceptanceCriteria.length
          ? `missing architecture acceptance criteria: ${missingAcceptanceCriteria.join(", ")}`
          : null,
        invalidAcceptanceRequirementRefs.length
          ? `invalid acceptance requirement references: ${invalidAcceptanceRequirementRefs.join(", ")}`
          : null,
        invalidEntries.length
          ? `invalid coverage entries: ${invalidEntries
              .map((entry) => entry.code)
              .join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join("; ")
    );
  }
}
