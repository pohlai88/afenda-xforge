import { careerPathingDevelopmentPlansRouteContracts } from "./contract.ts";

export type CareerPathingDevelopmentPlansManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof careerPathingDevelopmentPlansRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const careerPathingDevelopmentPlansManifest: CareerPathingDevelopmentPlansManifest = {
  id: "hr-suite.talent-management.career-pathing-development-plans",
  title: "Career Pathing Development Plans",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/talent-management/career-pathing-development-plans.",
  domain: "talent-management",
  packageName: "@repo/features-talent-management-career-pathing-development-plans",
  routeContracts: careerPathingDevelopmentPlansRouteContracts,
  suite: "hr-suite",
};
