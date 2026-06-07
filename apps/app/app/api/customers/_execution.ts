import { requireActiveTenantAccess } from "@repo/auth/server";
import type {
  CreateCustomerBody,
  Customer,
  CustomerList,
  ListCustomersQuery,
} from "@repo/features-master-data-customers";
import {
  createCustomer,
  listCustomers,
} from "@repo/features-master-data-customers";
import type { PermissionContext } from "@repo/permissions";
import {
  permissionCatalog,
  requirePermission,
  resolvePermissionsForTenantRole,
} from "@repo/permissions";
import {
  customerNotificationPostCommitHook,
  linearCustomerSyncPostCommitHook,
} from "../_post-commit.ts";

type CustomerAccess = {
  actorId: string;
  grantedPermissions: string[];
  tenantId: string;
};

const resolveCustomerAccess = async (): Promise<CustomerAccess> => {
  const access = await requireActiveTenantAccess();

  return {
    actorId: access.user.id,
    grantedPermissions: resolvePermissionsForTenantRole(access.membership.role),
    tenantId: access.membership.tenantId,
  };
};

const createCustomerPermissionContext = (
  access: CustomerAccess,
  action: string
): PermissionContext => ({
  action,
  actorId: access.actorId,
  grantedPermissions: access.grantedPermissions,
  resource: "customers",
  tenantId: access.tenantId,
});

export const listCustomersForTenant = async (
  query: ListCustomersQuery
): Promise<CustomerList> => {
  const access = await resolveCustomerAccess();

  requirePermission(createCustomerPermissionContext(access, "customers.list"), {
    allOf: [permissionCatalog.customers.read],
  });

  return listCustomers(query, {
    tenantId: access.tenantId,
    userId: access.actorId,
  });
};

export const createCustomerForTenant = async (
  body: CreateCustomerBody
): Promise<Customer> => {
  const access = await resolveCustomerAccess();

  return createCustomer(body, {
    grantedPermissions: access.grantedPermissions,
    postCommitHooks: [
      customerNotificationPostCommitHook,
      linearCustomerSyncPostCommitHook,
    ],
    tenantId: access.tenantId,
    userId: access.actorId,
  });
};
