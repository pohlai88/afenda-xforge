import { unionManagementRouteContracts } from "./contract.ts";

export type UnionManagementManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof unionManagementRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const unionManagementManifest: UnionManagementManifest = {
  id: "hr-suite.industry-specific.union-management",
  title: "Union Management",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/industry-specific/union-management.",
  domain: "industry-specific",
  packageName: "@repo/features-industry-specific-union-management",
  routeContracts: unionManagementRouteContracts,
  suite: "hr-suite",
};
