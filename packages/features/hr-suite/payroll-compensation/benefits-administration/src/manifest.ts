import { benefitsAdministrationRouteContracts } from "./contract.ts";

export type BenefitsAdministrationManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof benefitsAdministrationRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const benefitsAdministrationManifest: BenefitsAdministrationManifest = {
  id: "hr-suite.payroll-compensation.benefits-administration",
  title: "Benefits Administration",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/payroll-compensation/benefits-administration.",
  domain: "payroll-compensation",
  packageName: "@repo/features-payroll-compensation-benefits-administration",
  routeContracts: benefitsAdministrationRouteContracts,
  suite: "hr-suite",
};
