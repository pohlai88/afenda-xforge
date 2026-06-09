import { trainingDevelopmentRouteContracts } from "./contract.ts";

export type TrainingDevelopmentManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof trainingDevelopmentRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const trainingDevelopmentManifest: TrainingDevelopmentManifest = {
  id: "hr-suite.talent-management.training-development",
  title: "Training Development",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/talent-management/training-development.",
  domain: "talent-management",
  packageName: "@repo/features-talent-management-training-development",
  routeContracts: trainingDevelopmentRouteContracts,
  suite: "hr-suite",
};
