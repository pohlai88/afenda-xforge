import { listAuditEvents } from "@repo/audit";
import { ForbiddenError } from "@repo/errors";
import type { CompanyList } from "@repo/features-master-data-companies/contract";
import { listCompanies } from "@repo/features-master-data-companies/server";
import type { CustomerList } from "@repo/features-master-data-customers/contract";
import { listCustomers } from "@repo/features-master-data-customers/server";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import type {
  RuntimeCompanyAccess,
  RuntimeTenantAccess,
} from "../../../_runtime-access.ts";
import {
  createRuntimePermissionContext,
  resolveRuntimeCompanyAccess,
  resolveRuntimeTenantAccess,
} from "../../../_runtime-access.ts";

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

export type DashboardActivityEvent = {
  action: string;
  id: string;
  occurredAt: Date;
  outcome: string;
  summary: string;
};

export type DashboardActivityState = LoadState<{
  events: readonly DashboardActivityEvent[];
  total: number;
}>;

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
          grantedPermissions: access.grantedPermissions,
          requestId: access.requestId,
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

const loadAuditActivity = async (
  access: RuntimeTenantAccess
): Promise<DashboardActivityState> => {
  try {
    requirePermission(
      createRuntimePermissionContext(
        access,
        "dashboard.audit-activity",
        "audit"
      ),
      {
        allOf: [permissionCatalog.audit.read],
      }
    );

    const result = await listAuditEvents({
      limit: 5,
      offset: 0,
      tenantId: access.tenantId,
    });

    return {
      data: {
        events: result.events.map((event) => ({
          action: event.action,
          id: event.id,
          occurredAt: event.occurredAt,
          outcome: event.outcome,
          summary: event.summary,
        })),
        total: result.total,
      },
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
  activity: DashboardActivityState;
  actorId: string;
  companyId: string | null;
  companies: LoadState<CompanyList>;
  customers: LoadState<CustomerList>;
  grantedPermissions: readonly string[];
  tenantId: string;
  tenantRole: string;
  userEmail: string | null;
};

export const loadDashboardData = async (): Promise<DashboardData> => {
  const [access, companyAccess] = await Promise.all([
    resolveRuntimeTenantAccess(),
    loadOptionalCompanyAccess(),
  ]);

  const [customers, companies, activity] = await Promise.all([
    loadCustomers(access),
    loadCompanies(access),
    loadAuditActivity(access),
  ]);

  return {
    activity,
    actorId: access.actorId,
    companyId: companyAccess?.companyId ?? null,
    companies,
    customers,
    grantedPermissions: access.grantedPermissions,
    tenantId: access.tenantId,
    tenantRole: access.role,
    userEmail: access.userEmail,
  };
};
