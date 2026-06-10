import type { OffboardingExitManagementCapability } from "./capability.contract.ts";
import { offboardingExitManagementCapabilities } from "./capability.contract.ts";

export const offboardingExitManagementRouteContractVersion =
  "2026-06-10" as const;

export const offboardingExitManagementRoutePaths = {
  hub: "/hr",
  offboarding: "/hr/offboarding",
  overview: "/hr/offboarding/overview",
  cases: "/hr/offboarding/cases",
  detail: (caseId: string): `/hr/offboarding/cases/${string}` =>
    `/hr/offboarding/cases/${caseId}`,
  approvals: "/hr/offboarding/approvals",
  approvalDetail: (approvalId: string): `/hr/offboarding/approvals/${string}` =>
    `/hr/offboarding/approvals/${approvalId}`,
  approvalBlockers: "/hr/offboarding/approvals/blockers",
  auditTrail: "/hr/offboarding/audit-trail",
} as const;

export type OffboardingExitManagementRoutePath =
  | (typeof offboardingExitManagementRoutePaths)["hub"]
  | (typeof offboardingExitManagementRoutePaths)["offboarding"]
  | (typeof offboardingExitManagementRoutePaths)["overview"]
  | (typeof offboardingExitManagementRoutePaths)["cases"]
  | ReturnType<typeof offboardingExitManagementRoutePaths.detail>
  | (typeof offboardingExitManagementRoutePaths)["approvals"]
  | ReturnType<typeof offboardingExitManagementRoutePaths.approvalDetail>
  | (typeof offboardingExitManagementRoutePaths)["approvalBlockers"]
  | (typeof offboardingExitManagementRoutePaths)["auditTrail"];

export type OffboardingExitManagementRouteContract = {
  method: "GET" | "POST" | "PATCH";
  path: string;
  version: typeof offboardingExitManagementRouteContractVersion;
  capability: OffboardingExitManagementCapability;
};

export type OffboardingExitManagementRouteContractSet = {
  overview: OffboardingExitManagementRouteContract;
  cases: OffboardingExitManagementRouteContract;
  caseCreate: OffboardingExitManagementRouteContract;
  caseDetail: OffboardingExitManagementRouteContract;
  caseUpdate: OffboardingExitManagementRouteContract;
  approvals: OffboardingExitManagementRouteContract;
  approvalCreate: OffboardingExitManagementRouteContract;
  approvalDetail: OffboardingExitManagementRouteContract;
  approvalUpdate: OffboardingExitManagementRouteContract;
  approvalBlockers: OffboardingExitManagementRouteContract;
  auditTrail: OffboardingExitManagementRouteContract;
  auditEvents: OffboardingExitManagementRouteContract;
};

export const offboardingExitManagementRouteContracts: OffboardingExitManagementRouteContractSet =
  {
    overview: {
      method: "GET",
      path: "/api/hr/offboarding/overview",
      version: offboardingExitManagementRouteContractVersion,
      capability: offboardingExitManagementCapabilities.overviewRead,
    },
    cases: {
      method: "GET",
      path: "/api/hr/offboarding/cases",
      version: offboardingExitManagementRouteContractVersion,
      capability: offboardingExitManagementCapabilities.casesRead,
    },
    caseCreate: {
      method: "POST",
      path: "/api/hr/offboarding/cases",
      version: offboardingExitManagementRouteContractVersion,
      capability: offboardingExitManagementCapabilities.casesWrite,
    },
    caseDetail: {
      method: "GET",
      path: "/api/hr/offboarding/cases/[caseId]",
      version: offboardingExitManagementRouteContractVersion,
      capability: offboardingExitManagementCapabilities.casesRead,
    },
    caseUpdate: {
      method: "PATCH",
      path: "/api/hr/offboarding/cases/[caseId]",
      version: offboardingExitManagementRouteContractVersion,
      capability: offboardingExitManagementCapabilities.casesWrite,
    },
    approvals: {
      method: "GET",
      path: "/api/hr/offboarding/approvals",
      version: offboardingExitManagementRouteContractVersion,
      capability: offboardingExitManagementCapabilities.approvalsRead,
    },
    approvalCreate: {
      method: "POST",
      path: "/api/hr/offboarding/approvals",
      version: offboardingExitManagementRouteContractVersion,
      capability: offboardingExitManagementCapabilities.approvalsWrite,
    },
    approvalDetail: {
      method: "GET",
      path: "/api/hr/offboarding/approvals/[approvalId]",
      version: offboardingExitManagementRouteContractVersion,
      capability: offboardingExitManagementCapabilities.approvalsRead,
    },
    approvalUpdate: {
      method: "PATCH",
      path: "/api/hr/offboarding/approvals/[approvalId]",
      version: offboardingExitManagementRouteContractVersion,
      capability: offboardingExitManagementCapabilities.approvalsWrite,
    },
    approvalBlockers: {
      method: "GET",
      path: "/api/hr/offboarding/approvals/blockers",
      version: offboardingExitManagementRouteContractVersion,
      capability: offboardingExitManagementCapabilities.approvalsRead,
    },
    auditTrail: {
      method: "GET",
      path: "/api/hr/offboarding/audit-trail",
      version: offboardingExitManagementRouteContractVersion,
      capability: offboardingExitManagementCapabilities.auditRead,
    },
    auditEvents: {
      method: "POST",
      path: "/api/hr/offboarding/audit-events",
      version: offboardingExitManagementRouteContractVersion,
      capability: offboardingExitManagementCapabilities.governanceWrite,
    },
  };

export const hrOffboardingRoutePaths = {
  hub: offboardingExitManagementRoutePaths.hub,
  offboarding: offboardingExitManagementRoutePaths.offboarding,
} as const;

export type HrOffboardingRoutePath =
  (typeof hrOffboardingRoutePaths)[keyof typeof hrOffboardingRoutePaths];
