import type { EmployeeLifecycleManagementCapability } from "./capability.contract.ts";
import { employeeLifecycleManagementCapabilities } from "./capability.contract.ts";

export const employeeLifecycleManagementRouteContractVersion =
  "2026-06-09" as const;

export const employeeLifecycleManagementRoutePaths = {
  hub: "/hr",
  lifecycle: "/hr/lifecycle",
  detail: (employeeId: string): `/hr/lifecycle/${string}` =>
    `/hr/lifecycle/${employeeId}`,
  stages: "/hr/lifecycle/stages",
  history: "/hr/lifecycle/history",
  tasks: "/hr/lifecycle/tasks",
  auditTrail: "/hr/lifecycle/audit-trail",
  transitions: "/hr/lifecycle/transitions",
} as const;

export type EmployeeLifecycleManagementRoutePath =
  | (typeof employeeLifecycleManagementRoutePaths)["hub"]
  | (typeof employeeLifecycleManagementRoutePaths)["lifecycle"]
  | (typeof employeeLifecycleManagementRoutePaths)["stages"]
  | (typeof employeeLifecycleManagementRoutePaths)["history"]
  | (typeof employeeLifecycleManagementRoutePaths)["tasks"]
  | (typeof employeeLifecycleManagementRoutePaths)["auditTrail"]
  | (typeof employeeLifecycleManagementRoutePaths)["transitions"]
  | ReturnType<typeof employeeLifecycleManagementRoutePaths.detail>;

export type EmployeeLifecycleManagementRouteContract = {
  method: "GET" | "POST" | "PATCH";
  path: string;
  version: typeof employeeLifecycleManagementRouteContractVersion;
  capability: EmployeeLifecycleManagementCapability;
};

export type EmployeeLifecycleManagementRouteContractSet = {
  overview: EmployeeLifecycleManagementRouteContract;
  stages: EmployeeLifecycleManagementRouteContract;
  history: EmployeeLifecycleManagementRouteContract;
  auditTrail: EmployeeLifecycleManagementRouteContract;
  tasks: EmployeeLifecycleManagementRouteContract;
  transitions: EmployeeLifecycleManagementRouteContract;
};

export const employeeLifecycleManagementRouteContracts: EmployeeLifecycleManagementRouteContractSet =
  {
    overview: {
      method: "GET",
      path: "/api/hr/lifecycle/overview",
      version: employeeLifecycleManagementRouteContractVersion,
      capability: employeeLifecycleManagementCapabilities.overviewRead,
    },
    stages: {
      method: "GET",
      path: "/api/hr/lifecycle/stages",
      version: employeeLifecycleManagementRouteContractVersion,
      capability: employeeLifecycleManagementCapabilities.stagesRead,
    },
    history: {
      method: "GET",
      path: "/api/hr/lifecycle/history",
      version: employeeLifecycleManagementRouteContractVersion,
      capability: employeeLifecycleManagementCapabilities.historyRead,
    },
    auditTrail: {
      method: "GET",
      path: "/api/hr/lifecycle/audit-trail",
      version: employeeLifecycleManagementRouteContractVersion,
      capability: employeeLifecycleManagementCapabilities.auditRead,
    },
    tasks: {
      method: "GET",
      path: "/api/hr/lifecycle/tasks",
      version: employeeLifecycleManagementRouteContractVersion,
      capability: employeeLifecycleManagementCapabilities.workflowRead,
    },
    transitions: {
      method: "POST",
      path: "/api/hr/lifecycle/transitions",
      version: employeeLifecycleManagementRouteContractVersion,
      capability: employeeLifecycleManagementCapabilities.transitionsWrite,
    },
  };

export const hrLifecycleRoutePaths = {
  hub: employeeLifecycleManagementRoutePaths.hub,
  lifecycle: employeeLifecycleManagementRoutePaths.lifecycle,
} as const;

export type HrLifecycleRoutePath =
  (typeof hrLifecycleRoutePaths)[keyof typeof hrLifecycleRoutePaths];
