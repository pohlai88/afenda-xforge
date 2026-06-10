export const lamLeaveApplicationSubmitFieldLabels = {
  employeeId: "Employee",
  leaveTypeId: "Leave Type",
  startDate: "Start Date",
  endDate: "End Date",
  totalDays: "Total Days",
  reason: "Reason",
  supportingDocumentId: "Supporting Document",
  hireDate: "Hire Date",
  gender: "Gender",
  countryCode: "Country",
  legalEntityCode: "Legal Entity",
  workLocationCode: "Location",
  employmentType: "Employee Category",
  grade: "Grade",
  policyGroupId: "Policy Group",
  departmentId: "Department",
} as const;

export const bindEmployeeLeaveApplicationSubmitInput = <
  T extends { employeeId?: string | null },
>(
  input: T,
  scopedEmployeeId?: string | null
): T => {
  const scoped = scopedEmployeeId?.trim();
  if (!scoped) {
    return input;
  }

  return {
    ...input,
    employeeId: scoped,
  };
};

export const mapLamMutationErrorToHttpStatus = (error: string): number => {
  if (
    /access denied|scope|not permitted|does not match|not authorized|HR fallback delegation|disabled for this company/i.test(
      error
    )
  ) {
    return 403;
  }

  if (
    /must be|required|invalid|insufficient|not found|already exists|already linked|maximum|minimum|notice|overlap|blackout|eligible|document|balance|active leave type|policy group|cannot be confirmed|approverRef|step order|approval route|pending approval|rejection reason|submitted status|actor employee identity|workflow step/i.test(
      error
    )
  ) {
    return 422;
  }

  return 400;
};
