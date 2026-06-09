import { bonusIncentiveManagementRouteContracts } from "./contract.ts";

export type BonusIncentiveManagementManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof bonusIncentiveManagementRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const bonusIncentiveManagementManifest: BonusIncentiveManagementManifest =
  {
    id: "hr-suite.payroll-compensation.bonus-incentive-management",
    title: "Bonus Incentive Management",
    description:
      "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/payroll-compensation/bonus-incentive-management.",
    domain: "payroll-compensation",
    packageName:
      "@repo/features-payroll-compensation-bonus-incentive-management",
    routeContracts: bonusIncentiveManagementRouteContracts,
    suite: "hr-suite",
  };
