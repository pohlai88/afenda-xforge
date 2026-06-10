export const lamEntitlementScopeFieldLabels = {
  employmentType: "Employee Category",
  grade: "Grade",
  countryCode: "Country",
  legalEntityCode: "Legal Entity",
  workLocationCode: "Location",
  policyGroupId: "Policy Group",
  departmentId: "Department",
  tenureMonthsMin: "Minimum Tenure (Months)",
  tenureMonthsMax: "Maximum Tenure (Months)",
} as const;

export const lamEntitlementDimensionAliases = {
  employeeCategory: "employmentType",
} as const;

export type LamEntitlementDimensionAlias =
  keyof typeof lamEntitlementDimensionAliases;

export const resolveEntitlementDimensionField = (
  alias: LamEntitlementDimensionAlias
): keyof typeof lamEntitlementScopeFieldLabels =>
  lamEntitlementDimensionAliases[
    alias
  ] as keyof typeof lamEntitlementScopeFieldLabels;
