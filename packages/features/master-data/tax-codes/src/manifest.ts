import { taxCodeRouteContracts } from "./contract.ts";

export type TaxCodeFeatureManifest = {
  description: string;
  id: string;
  packageName: string;
  routeContracts: typeof taxCodeRouteContracts;
  title: string;
};

export const taxCodeFeatureManifest: TaxCodeFeatureManifest = {
  id: "master-data.tax-codes",
  title: "Tax Codes",
  description: "Master-data feature package for tax code records.",
  packageName: "@repo/features-master-data-tax-codes",
  routeContracts: taxCodeRouteContracts,
};
