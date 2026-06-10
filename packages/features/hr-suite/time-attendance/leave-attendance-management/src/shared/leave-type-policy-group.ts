export const normalizePolicyGroupId = (
  value: string | null | undefined
): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const policyGroupIdsMatch = (
  left: string | null | undefined,
  right: string | null | undefined
): boolean => normalizePolicyGroupId(left) === normalizePolicyGroupId(right);

export const leaveTypeMatchesPolicyGroupFilter = (args: {
  entryPolicyGroupId: string | null | undefined;
  filterPolicyGroupId?: string | null;
  unscopedPolicyGroupOnly?: boolean;
}): boolean => {
  if (args.unscopedPolicyGroupOnly === true) {
    return normalizePolicyGroupId(args.entryPolicyGroupId) === null;
  }

  const filterGroupId = normalizePolicyGroupId(args.filterPolicyGroupId);
  if (!filterGroupId) {
    return true;
  }

  const entryGroupId = normalizePolicyGroupId(args.entryPolicyGroupId);
  return entryGroupId === filterGroupId || entryGroupId === null;
};

export const isLeaveTypeAccessibleToEmployeePolicyGroup = (args: {
  leaveTypePolicyGroupId: string | null | undefined;
  employeePolicyGroupId: string | null | undefined;
}): boolean => {
  const leaveTypeGroup = normalizePolicyGroupId(args.leaveTypePolicyGroupId);
  if (leaveTypeGroup === null) {
    return true;
  }

  return policyGroupIdsMatch(leaveTypeGroup, args.employeePolicyGroupId);
};

export const assertLeaveTypeAccessibleToPolicyGroup = (args: {
  leaveType: { code: string; policyGroupId?: string | null };
  employeePolicyGroupId?: string | null;
}): void => {
  if (
    !isLeaveTypeAccessibleToEmployeePolicyGroup({
      leaveTypePolicyGroupId: args.leaveType.policyGroupId,
      employeePolicyGroupId: args.employeePolicyGroupId,
    })
  ) {
    throw new Error(
      `Leave type "${args.leaveType.code}" is not available for the employee policy group`
    );
  }
};

export const lamLeaveTypeFieldLabels = {
  policyGroupId: "Policy Group",
  code: "Code",
  name: "Name",
  kind: "Leave Kind",
  active: "Active",
  minNoticeDays: "Minimum Notice (Days)",
  maxConsecutiveDays: "Maximum Consecutive Days",
  eligibilityTenureMonthsMin: "Minimum Tenure (Months)",
  eligibilityGender: "Eligibility Gender",
  requiresDocument: "Supporting Document Required",
  paid: "Paid Leave",
} as const;
