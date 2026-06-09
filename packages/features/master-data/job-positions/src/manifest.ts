import { jobPositionRouteContracts } from "./contract.ts";

export type JobPositionFeatureManifest = {
  description: string;
  id: string;
  packageName: string;
  routeContracts: typeof jobPositionRouteContracts;
  title: string;
};

export const jobPositionFeatureManifest: JobPositionFeatureManifest = {
  id: "master-data.job-positions",
  title: "Job Positions",
  description: "Master-data feature package for job position records.",
  packageName: "@repo/features-master-data-job-positions",
  routeContracts: jobPositionRouteContracts,
};
