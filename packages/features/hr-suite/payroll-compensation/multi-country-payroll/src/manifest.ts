import { multiCountryPayrollRouteContracts } from "./contract.ts";

export type MultiCountryPayrollManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof multiCountryPayrollRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const multiCountryPayrollManifest: MultiCountryPayrollManifest = {
  id: "hr-suite.payroll-compensation.multi-country-payroll",
  title: "Multi Country Payroll",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/payroll-compensation/multi-country-payroll.",
  domain: "payroll-compensation",
  packageName: "@repo/features-payroll-compensation-multi-country-payroll",
  routeContracts: multiCountryPayrollRouteContracts,
  suite: "hr-suite",
};
