type NonEmptyStringList = readonly [string, ...string[]];

export type OffboardingExitManagementOwnershipBoundary = {
  area: string;
  ownership: "owned" | "reference" | "excluded";
  details: NonEmptyStringList;
};

export type OffboardingExitManagementBoundedContext = {
  ownedCapabilities: NonEmptyStringList;
  ownedEntities: NonEmptyStringList;
  inputs: NonEmptyStringList;
  outputs: NonEmptyStringList;
  exclusions: NonEmptyStringList;
  ownershipMatrix: readonly OffboardingExitManagementOwnershipBoundary[];
};

export const offboardingExitManagementBoundedContext: OffboardingExitManagementBoundedContext =
  {
    ownedCapabilities: [
      "offboarding-governance",
      "exit-clearance-orchestration",
      "cross-functional-task-tracking",
      "exit-audit-history",
      "post-employment-closure",
    ],
    ownedEntities: [
      "offboarding-case",
      "approval-reference",
      "checklist-task",
      "exit-interview-record",
      "handover-record",
      "asset-recovery-reference",
      "access-revocation-reference",
      "settlement-blocker-reference",
      "closure-record",
      "audit-event",
    ],
    inputs: [
      "employee-initiated-resignation",
      "manager-initiated-separation",
      "employment-policy-reference",
      "asset-assignment-reference",
      "access-assignment-reference",
      "payroll-blocker-response",
    ],
    outputs: [
      "offboarding-case-snapshot",
      "clearance-readiness",
      "cross-functional-task-state",
      "payroll-readiness-reference",
      "rehire-eligibility-classification",
      "audit-event",
    ],
    exclusions: [
      "employee-master-profile",
      "document-binary-storage",
      "organization-hierarchy-stewardship",
      "payroll-calculation",
      "leave-balance-calculation",
      "attendance-record-ownership",
      "asset-inventory-master",
      "iam-account-provisioning-rules",
      "recruitment-replacement-execution",
      "legal-dispute-handling",
    ],
    ownershipMatrix: [
      {
        area: "exit-case-facts",
        ownership: "owned",
        details: [
          "exit type, reason, notice window, working dates, approval checkpoints",
        ],
      },
      {
        area: "approval-routing",
        ownership: "owned",
        details: [
          "offboarding approval state and decision trail, not enterprise workflow engine design",
        ],
      },
      {
        area: "checklist-tasks",
        ownership: "owned",
        details: [
          "cross-functional offboarding tasks, due dates, blockers, evidence",
        ],
      },
      {
        area: "exit-interview-and-handover",
        ownership: "owned",
        details: ["interview schedule, feedback capture, handover evidence"],
      },
      {
        area: "asset-recovery",
        ownership: "reference",
        details: [
          "references asset ownership and recovery state, not asset master records",
        ],
      },
      {
        area: "access-revocation",
        ownership: "reference",
        details: [
          "references revocation tasks and statuses, not IAM provisioning rules",
        ],
      },
      {
        area: "settlement-readiness",
        ownership: "reference",
        details: [
          "tracks blockers and readiness signals, not payroll computation",
        ],
      },
      {
        area: "document-links",
        ownership: "reference",
        details: [
          "stores document references and metadata, not file storage binaries",
        ],
      },
      {
        area: "closure-and-rehire",
        ownership: "owned",
        details: [
          "closure outcome, archive state, retention marker, rehire eligibility",
        ],
      },
      {
        area: "audit-history",
        ownership: "owned",
        details: ["offboarding actions with scoped, redactable audit metadata"],
      },
    ],
  } as const;
