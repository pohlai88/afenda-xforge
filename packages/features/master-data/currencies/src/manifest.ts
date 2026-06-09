import { currencyRouteContracts } from "./contract.ts";

export type CurrencyFeatureManifest = {
  description: string;
  id: string;
  packageName: string;
  routeContracts: typeof currencyRouteContracts;
  title: string;
};

export const currencyFeatureManifest: CurrencyFeatureManifest = {
  id: "master-data.currencies",
  title: "Currencies",
  description: "Master-data feature package for currency records.",
  packageName: "@repo/features-master-data-currencies",
  routeContracts: currencyRouteContracts,
};
