import { companyRouteContracts } from "./contract.ts";

export type CompanyFeatureManifest = {
  description: string;
  id: string;
  packageName: string;
  routeContracts: typeof companyRouteContracts;
  title: string;
};

export const companyFeatureManifest: CompanyFeatureManifest = {
  id: "master-data.companies",
  title: "Companies",
  description: "Master-data feature package for company records.",
  packageName: "@repo/features-master-data-companies",
  routeContracts: companyRouteContracts,
};
