import { performanceAppraisalsRouteContracts } from "./contract.ts";

export type PerformanceAppraisalsManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof performanceAppraisalsRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const performanceAppraisalsManifest: PerformanceAppraisalsManifest = {
  id: "hr-suite.talent-management.performance-appraisals",
  title: "Performance Appraisals",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/talent-management/performance-appraisals.",
  domain: "talent-management",
  packageName: "@repo/features-talent-management-performance-appraisals",
  routeContracts: performanceAppraisalsRouteContracts,
  suite: "hr-suite",
};
