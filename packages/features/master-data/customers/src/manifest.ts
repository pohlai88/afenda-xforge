import { customerRouteContracts } from "./contract.ts";

export type CustomerFeatureManifest = {
  description: string;
  id: string;
  routeContracts: typeof customerRouteContracts;
  title: string;
};

export const customerFeatureManifest: CustomerFeatureManifest = {
  id: "master-data.customers",
  title: "Customers",
  description: "Master-data feature scaffold for customer records.",
  routeContracts: customerRouteContracts,
};
