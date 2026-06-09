import { productRouteContracts } from "./contract.ts";

export type ProductFeatureManifest = {
  description: string;
  id: string;
  packageName: string;
  routeContracts: typeof productRouteContracts;
  title: string;
};

export const productFeatureManifest: ProductFeatureManifest = {
  id: "master-data.products",
  title: "Products",
  description: "Master-data feature package for product records.",
  packageName: "@repo/features-master-data-products",
  routeContracts: productRouteContracts,
};
