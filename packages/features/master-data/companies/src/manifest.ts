import { companyRouteContracts } from "./contract.ts";

export type CompanyFeatureManifest = {
  description: string;
  id: string;
  routeContracts: typeof companyRouteContracts;
  title: string;
};

export const companyFeatureManifest: CompanyFeatureManifest = {
  id: "master-data.companies",
  title: "Companies",
  description: "Master-data feature scaffold for company records.",
  routeContracts: companyRouteContracts,
};
