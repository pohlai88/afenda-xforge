import { ForbiddenError } from "@repo/errors";
import type { CompanyList } from "@repo/features-master-data-companies/contract";
import { listCompanies } from "@repo/features-master-data-companies/server";
import type { CustomerList } from "@repo/features-master-data-customers/contract";
import { listCustomers } from "@repo/features-master-data-customers/server";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import type {
  RuntimeCompanyAccess,
  RuntimeTenantAccess,
} from "../../_runtime-access.ts";
import {
  createRuntimePermissionContext,
  resolveRuntimeCompanyAccess,
  resolveRuntimeTenantAccess,
} from "../../_runtime-access.ts";

type LoadState<T> =
  | {
      data: T;
      status: "ready";
    }
  | {
      message: string;
      status: "error";
    }
  | {
      status: "forbidden";
    };

const isForbiddenError = (error: unknown): boolean =>
  error instanceof ForbiddenError;

const toErrorState = (error: unknown): LoadState<never> => ({
  message: error instanceof Error ? error.message : "Unable to load section",
  status: "error",
});

const loadOptionalCompanyAccess =
  async (): Promise<RuntimeCompanyAccess | null> => {
    try {
      return await resolveRuntimeCompanyAccess();
    } catch (error) {
      if (isForbiddenError(error)) {
        return null;
      }

      throw error;
    }
  };

const loadCustomers = async (
  access: RuntimeTenantAccess
): Promise<LoadState<CustomerList>> => {
  try {
    requirePermission(
      createRuntimePermissionContext(
        access,
        "dashboard.customers",
        "customers"
      ),
      {
        allOf: [permissionCatalog.customers.read],
      }
    );

    return {
      data: await listCustomers(
        {
          page: 1,
          pageSize: 5,
        },
        {
          grantedPermissions: access.grantedPermissions,
          tenantId: access.tenantId,
          userId: access.actorId,
        }
      ),
      status: "ready",
    };
  } catch (error) {
    if (isForbiddenError(error)) {
      return {
        status: "forbidden",
      };
    }

    return toErrorState(error);
  }
};

const loadCompanies = async (
  access: RuntimeTenantAccess
): Promise<LoadState<CompanyList>> => {
  try {
    requirePermission(
      createRuntimePermissionContext(
        access,
        "dashboard.companies",
        "companies"
      ),
      {
        allOf: [permissionCatalog.companies.read],
      }
    );

    return {
      data: await listCompanies(
        {
          page: 1,
          pageSize: 5,
        },
        {
          tenantId: access.tenantId,
          userId: access.actorId,
        }
      ),
      status: "ready",
    };
  } catch (error) {
    if (isForbiddenError(error)) {
      return {
        status: "forbidden",
      };
    }

    return toErrorState(error);
  }
};

export type DashboardData = {
  companyId: string | null;
  companies: LoadState<CompanyList>;
  customers: LoadState<CustomerList>;
  tenantId: string;
  tenantRole: string;
  userEmail: string | null;
};

export const loadDashboardData = async (): Promise<DashboardData> => {
  const [access, companyAccess] = await Promise.all([
    resolveRuntimeTenantAccess(),
    loadOptionalCompanyAccess(),
  ]);

  const [customers, companies] = await Promise.all([
    loadCustomers(access),
    loadCompanies(access),
  ]);

  return {
    companyId: companyAccess?.companyId ?? null,
    companies,
    customers,
    tenantId: access.tenantId,
    tenantRole: access.role,
    userEmail: access.userEmail,
  };
};
