import { NotFoundError } from "@repo/errors";
import type {
  Company,
  CompanyList,
  CreateCompanyBody,
  ListCompaniesQuery,
  UpdateActiveCompanyBody,
  UpdateCompanyBody,
} from "@repo/features-master-data-companies/contract";
import {
  archiveCompany,
  createCompany,
  getCompany,
  listCompanies,
  updateCompany,
  updateCompanyById,
} from "@repo/features-master-data-companies/server";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import {
  createRuntimePermissionContext,
  resolveRuntimeCompanyAccess,
  resolveRuntimeTenantAccess,
} from "../../_runtime-access.ts";
import { workdayCompanySyncPostCommitHook } from "../_post-commit.ts";

export const listCompaniesForTenant = async (
  query: ListCompaniesQuery
): Promise<CompanyList> => {
  const access = await resolveRuntimeTenantAccess();

  requirePermission(
    createRuntimePermissionContext(access, "companies.list", "companies"),
    {
      allOf: [permissionCatalog.companies.read],
    }
  );

  return listCompanies(query, {
    grantedPermissions: access.grantedPermissions,
    requestId: access.requestId,
    tenantId: access.tenantId,
    userId: access.actorId,
  });
};

export const createCompanyForTenant = async (
  body: CreateCompanyBody
): Promise<Company> => {
  const access = await resolveRuntimeTenantAccess();

  return createCompany(body, {
    grantedPermissions: access.grantedPermissions,
    operationId: access.operationId,
    postCommitHooks: [workdayCompanySyncPostCommitHook],
    requestId: access.requestId,
    tenantId: access.tenantId,
    userId: access.actorId,
  });
};

export const getActiveCompanyForTenant = async (): Promise<Company> => {
  const access = await resolveRuntimeCompanyAccess();

  requirePermission(
    createRuntimePermissionContext(access, "companies.getActive", "companies"),
    {
      allOf: [permissionCatalog.companies.read],
    }
  );

  const company = await getCompany(access.companyId, {
    tenantId: access.tenantId,
    userId: access.actorId,
  });

  if (!company) {
    throw new NotFoundError("Active company was not found");
  }

  return company;
};

export const updateActiveCompanyForTenant = async (
  body: UpdateActiveCompanyBody
): Promise<Company> => {
  const access = await resolveRuntimeCompanyAccess();

  return updateCompany(body, {
    companyId: access.companyId,
    grantedPermissions: access.grantedPermissions,
    grantId: access.grantId,
    operationId: access.operationId,
    postCommitHooks: [workdayCompanySyncPostCommitHook],
    requestId: access.requestId,
    tenantId: access.tenantId,
    userId: access.actorId,
  });
};

export const updateCompanyForTenant = async (
  companyId: string,
  body: UpdateCompanyBody
): Promise<Company> => {
  const access = await resolveRuntimeTenantAccess();

  return updateCompanyById(body, {
    companyId,
    grantedPermissions: access.grantedPermissions,
    operationId: access.operationId,
    postCommitHooks: [workdayCompanySyncPostCommitHook],
    requestId: access.requestId,
    tenantId: access.tenantId,
    userId: access.actorId,
  });
};

export const archiveCompanyForTenant = async (
  companyId: string
): Promise<Company> => {
  const access = await resolveRuntimeTenantAccess();

  return archiveCompany({
    companyId,
    grantedPermissions: access.grantedPermissions,
    operationId: access.operationId,
    requestId: access.requestId,
    tenantId: access.tenantId,
    userId: access.actorId,
  });
};
