import { payrollProcessingRouteContracts } from "./contract.ts";

export type PayrollProcessingManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof payrollProcessingRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const payrollProcessingManifest: PayrollProcessingManifest = {
  id: "hr-suite.payroll-compensation.payroll-processing",
  title: "Payroll Processing",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/payroll-compensation/payroll-processing.",
  domain: "payroll-compensation",
  packageName: "@repo/features-payroll-compensation-payroll-processing",
  routeContracts: payrollProcessingRouteContracts,
  suite: "hr-suite",
};
