import { supplierRouteContracts } from "./contract.ts";

export type SupplierFeatureManifest = {
  description: string;
  id: string;
  packageName: string;
  routeContracts: typeof supplierRouteContracts;
  title: string;
};

export const supplierFeatureManifest: SupplierFeatureManifest = {
  id: "master-data.suppliers",
  title: "Suppliers",
  description: "Master-data feature package for supplier records.",
  packageName: "@repo/features-master-data-suppliers",
  routeContracts: supplierRouteContracts,
};
