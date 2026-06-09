export const hrRecordsAuditActions = {
  employee: {
    created: "hr.employees.employee.created",
    updated: "hr.employees.employee.updated",
    archived: "hr.employees.employee.archived",
    rehired: "hr.employees.employee.rehired",
  },
  assignment: {
    recorded: "hr.employees.assignment.recorded",
  },
  profile: {
    updated: "hr.employees.profile.updated",
  },
  emergencyContact: {
    updated: "hr.employees.emergency_contact.updated",
  },
} as const;

export type HrRecordsAuditAction =
  | (typeof hrRecordsAuditActions)["employee"][keyof (typeof hrRecordsAuditActions)["employee"]]
  | (typeof hrRecordsAuditActions)["assignment"][keyof (typeof hrRecordsAuditActions)["assignment"]]
  | (typeof hrRecordsAuditActions)["profile"][keyof (typeof hrRecordsAuditActions)["profile"]]
  | (typeof hrRecordsAuditActions)["emergencyContact"][keyof (typeof hrRecordsAuditActions)["emergencyContact"]];
