import { departmentRouteContracts } from "./contract.ts";

export type DepartmentFeatureManifest = {
  description: string;
  id: string;
  packageName: string;
  routeContracts: typeof departmentRouteContracts;
  title: string;
};

export const departmentFeatureManifest: DepartmentFeatureManifest = {
  id: "master-data.departments",
  title: "Departments",
  description: "Master-data feature package for department records.",
  packageName: "@repo/features-master-data-departments",
  routeContracts: departmentRouteContracts,
};
