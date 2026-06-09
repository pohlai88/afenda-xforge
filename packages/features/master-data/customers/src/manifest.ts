import { customerRouteContracts } from "./contract.ts";

export type CustomerFeatureManifest = {
  description: string;
  id: string;
  packageName: string;
  routeContracts: typeof customerRouteContracts;
  title: string;
};

export const customerFeatureManifest: CustomerFeatureManifest = {
  id: "master-data.customers",
  title: "Customers",
  description: "Master-data feature package for customer records.",
  packageName: "@repo/features-master-data-customers",
  routeContracts: customerRouteContracts,
};
