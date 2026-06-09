import { fieldWorkerRemoteWorkforceManagementRouteContracts } from "./contract.ts";

export type FieldWorkerRemoteWorkforceManagementManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof fieldWorkerRemoteWorkforceManagementRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const fieldWorkerRemoteWorkforceManagementManifest: FieldWorkerRemoteWorkforceManagementManifest = {
  id: "hr-suite.industry-specific.field-worker-remote-workforce-management",
  title: "Field Worker Remote Workforce Management",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/industry-specific/field-worker-remote-workforce-management.",
  domain: "industry-specific",
  packageName: "@repo/features-industry-specific-field-worker-remote-workforce-management",
  routeContracts: fieldWorkerRemoteWorkforceManagementRouteContracts,
  suite: "hr-suite",
};
