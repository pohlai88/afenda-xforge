export type BonusIncentiveManagementMetadata = {
  description: string;
  domain: string;
  id: string;
  labels: {
    plural: string;
    singular: string;
  };
  source: "legacy-hr-suite";
  suite: "hr-suite";
  title: string;
};

export const bonusIncentiveManagementMetadata: BonusIncentiveManagementMetadata = {
  id: "hr-suite.payroll-compensation.bonus-incentive-management",
  title: "Bonus Incentive Management",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "payroll-compensation",
  labels: {
    singular: "Bonus Incentive Management record",
    plural: "Bonus Incentive Management records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
