import { learningManagementSystemLmsRouteContracts } from "./contract.ts";

export type LearningManagementSystemLmsManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof learningManagementSystemLmsRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const learningManagementSystemLmsManifest: LearningManagementSystemLmsManifest =
  {
    id: "hr-suite.talent-management.learning-management-system-lms",
    title: "Learning Management System Lms",
    description:
      "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/talent-management/learning-management-system-lms.",
    domain: "talent-management",
    packageName:
      "@repo/features-talent-management-learning-management-system-lms",
    routeContracts: learningManagementSystemLmsRouteContracts,
    suite: "hr-suite",
  };
