import { orgUnitRouteContracts } from "./contract.ts";

export type OrgUnitFeatureManifest = {
  description: string;
  id: string;
  packageName: string;
  routeContracts: typeof orgUnitRouteContracts;
  title: string;
};

export const orgUnitFeatureManifest: OrgUnitFeatureManifest = {
  id: "master-data.org-units",
  title: "Org Units",
  description: "Master-data feature package for organizational unit records.",
  packageName: "@repo/features-master-data-org-units",
  routeContracts: orgUnitRouteContracts,
};
