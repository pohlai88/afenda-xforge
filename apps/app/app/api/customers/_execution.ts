import type {
  CreateCustomerBody,
  Customer,
  CustomerList,
  ListCustomersQuery,
} from "@repo/features-master-data-customers/contract";
import {
  createCustomer,
  listCustomers,
} from "@repo/features-master-data-customers/server";
import { permissionCatalog, requirePermission } from "@repo/permissions";
import {
  createRuntimePermissionContext,
  resolveRuntimeTenantAccess,
} from "../../_runtime-access.ts";
import {
  customerNotificationPostCommitHook,
  linearCustomerSyncPostCommitHook,
} from "../_post-commit.ts";

export const listCustomersForTenant = async (
  query: ListCustomersQuery
): Promise<CustomerList> => {
  const access = await resolveRuntimeTenantAccess();

  requirePermission(
    createRuntimePermissionContext(access, "customers.list", "customers"),
    {
      allOf: [permissionCatalog.customers.read],
    }
  );

  return listCustomers(query, {
    tenantId: access.tenantId,
    userId: access.actorId,
  });
};

export const createCustomerForTenant = async (
  body: CreateCustomerBody
): Promise<Customer> => {
  const access = await resolveRuntimeTenantAccess();

  return createCustomer(body, {
    grantedPermissions: access.grantedPermissions,
    postCommitHooks: [
      customerNotificationPostCommitHook,
      linearCustomerSyncPostCommitHook,
    ],
    operationId: access.operationId,
    requestId: access.requestId,
    tenantId: access.tenantId,
    userId: access.actorId,
  });
};
