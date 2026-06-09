import { locationRouteContracts } from "./contract.ts";

export type LocationFeatureManifest = {
  description: string;
  id: string;
  packageName: string;
  routeContracts: typeof locationRouteContracts;
  title: string;
};

export const locationFeatureManifest: LocationFeatureManifest = {
  id: "master-data.locations",
  title: "Locations",
  description: "Master-data feature package for location records.",
  packageName: "@repo/features-master-data-locations",
  routeContracts: locationRouteContracts,
};
