import {
  requireActiveCompanyAccess,
  requireActiveTenantAccess,
} from "@repo/auth/server";
import { NotFoundError } from "@repo/errors";
import type {
  Company,
  CompanyList,
  CreateCompanyBody,
  ListCompaniesQuery,
  UpdateActiveCompanyBody,
} from "@repo/features-master-data-companies";
import {
  createCompany,
  getCompany,
  listCompanies,
  updateCompany,
} from "@repo/features-master-data-companies";
import type { PermissionContext } from "@repo/permissions";
import {
  permissionCatalog,
  requirePermission,
  resolvePermissionsForTenantRole,
} from "@repo/permissions";
import { workdayCompanySyncPostCommitHook } from "../_post-commit.ts";

type CompanyAccess = {
  actorId: string;
  companyId?: string;
  grantId?: string;
  grantedPermissions: string[];
  tenantId: string;
};

type ActiveCompanyExecutionAccess = CompanyAccess & {
  companyId: string;
  grantId: string;
};

const createCompanyPermissionContext = (
  access: CompanyAccess,
  action: string
): PermissionContext => ({
  action,
  actorId: access.actorId,
  companyId: access.companyId,
  grantedPermissions: access.grantedPermissions,
  resource: "companies",
  tenantId: access.tenantId,
});

const resolveTenantCompanyAccess = async (): Promise<CompanyAccess> => {
  const access = await requireActiveTenantAccess();

  return {
    actorId: access.user.id,
    grantedPermissions: resolvePermissionsForTenantRole(access.membership.role),
    tenantId: access.membership.tenantId,
  };
};

const resolveActiveCompanyExecutionAccess =
  async (): Promise<ActiveCompanyExecutionAccess> => {
    const access = await requireActiveCompanyAccess();

    return {
      actorId: access.user.id,
      companyId: access.company.companyId,
      grantId: access.company.grantId,
      grantedPermissions: resolvePermissionsForTenantRole(
        access.membership.role
      ),
      tenantId: access.membership.tenantId,
    };
  };

export const listCompaniesForTenant = async (
  query: ListCompaniesQuery
): Promise<CompanyList> => {
  const access = await resolveTenantCompanyAccess();

  requirePermission(createCompanyPermissionContext(access, "companies.list"), {
    allOf: [permissionCatalog.companies.read],
  });

  return listCompanies(query, {
    tenantId: access.tenantId,
    userId: access.actorId,
  });
};

export const createCompanyForTenant = async (
  body: CreateCompanyBody
): Promise<Company> => {
  const access = await resolveTenantCompanyAccess();

  return createCompany(body, {
    grantedPermissions: access.grantedPermissions,
    postCommitHooks: [workdayCompanySyncPostCommitHook],
    tenantId: access.tenantId,
    userId: access.actorId,
  });
};

export const getActiveCompanyForTenant = async (): Promise<Company> => {
  const access = await resolveActiveCompanyExecutionAccess();

  requirePermission(
    createCompanyPermissionContext(access, "companies.getActive"),
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
  const access = await resolveActiveCompanyExecutionAccess();

  return updateCompany(body, {
    companyId: access.companyId,
    grantedPermissions: access.grantedPermissions,
    grantId: access.grantId,
    postCommitHooks: [workdayCompanySyncPostCommitHook],
    tenantId: access.tenantId,
    userId: access.actorId,
  });
};
