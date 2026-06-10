import "server-only";

import { requireActiveCompanyAccess } from "@repo/auth/server";

const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const boolHeader = (request: Request, name: string): boolean | undefined => {
  const value = header(request, name);
  if (!value) {
    return;
  }

  return value === "true" || value === "1";
};

export type HrEmployeeUserAccountApiContext = {
  canRead: boolean;
  canWrite: boolean;
  companyId: string;
  tenantId: string;
};

export const isHrEmployeeUserAccountHeaderMode = (): boolean =>
  process.env.AFENDA_HR_RECORDS_TRUST_ORCHESTRATION_HEADERS === "true";

const createHeaderTrustedEmployeeUserAccountContext = (
  request: Request
): HrEmployeeUserAccountApiContext => {
  const tenantId = header(request, "x-tenant-id");
  const companyId = header(request, "x-company-id");

  if (!tenantId || !companyId) {
    throw new Error("Tenant and company context are required");
  }

  return {
    canRead: boolHeader(request, "x-can-read-employee-records") ?? false,
    canWrite: boolHeader(request, "x-can-write-employee-records") ?? false,
    companyId,
    tenantId,
  };
};

const canWriteEmployeeUserAccountsFromSession = (grant: string): boolean =>
  grant === "owner" || grant === "admin";

export const createHrEmployeeUserAccountContext = async (
  request: Request
): Promise<HrEmployeeUserAccountApiContext> => {
  if (isHrEmployeeUserAccountHeaderMode()) {
    return createHeaderTrustedEmployeeUserAccountContext(request);
  }

  const access = await requireActiveCompanyAccess();

  if (!canWriteEmployeeUserAccountsFromSession(access.company.grant)) {
    return {
      canRead: true,
      canWrite: false,
      companyId: access.company.companyId,
      tenantId: access.membership.tenantId,
    };
  }

  return {
    canRead: true,
    canWrite: true,
    companyId: access.company.companyId,
    tenantId: access.membership.tenantId,
  };
};
