import { systemAdminRouteContracts } from "./contract.ts";
import {
  systemAdminFeatureId,
  systemAdminPackageName,
} from "./shared/index.ts";

export type SystemAdminControlPlaneFeatureManifest = {
  description: string;
  id: string;
  packageName: string;
  routeContracts: typeof systemAdminRouteContracts;
  title: string;
};

export const systemAdminControlPlaneFeatureManifest: SystemAdminControlPlaneFeatureManifest =
  {
    id: systemAdminFeatureId,
    title: "System Admin Control Plane",
    description:
      "Governed feature package for tenant system administration workflows.",
    packageName: systemAdminPackageName,
    routeContracts: systemAdminRouteContracts,
  };
