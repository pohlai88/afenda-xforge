import { successionPlanningRouteContracts } from "./contract.ts";

export type SuccessionPlanningManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof successionPlanningRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const successionPlanningManifest: SuccessionPlanningManifest = {
  id: "hr-suite.talent-management.succession-planning",
  title: "Succession Planning",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/talent-management/succession-planning.",
  domain: "talent-management",
  packageName: "@repo/features-talent-management-succession-planning",
  routeContracts: successionPlanningRouteContracts,
  suite: "hr-suite",
};
