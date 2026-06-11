import type {
  CreateCustomerBody,
  Customer,
  CustomerList,
  ListCustomersQuery,
  UpdateCustomerBody,
} from "@repo/features-master-data-customers/contract";
import {
  archiveCustomer,
  createCustomer,
  listCustomers,
  updateCustomer,
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
    grantedPermissions: access.grantedPermissions,
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

export const updateCustomerForTenant = async (
  customerId: string,
  body: UpdateCustomerBody
): Promise<Customer> => {
  const access = await resolveRuntimeTenantAccess();

  return updateCustomer(
    {
      ...body,
      customerId,
    },
    {
      customerId,
      grantedPermissions: access.grantedPermissions,
      operationId: access.operationId,
      requestId: access.requestId,
      tenantId: access.tenantId,
      userId: access.actorId,
    }
  );
};

export const archiveCustomerForTenant = async (
  customerId: string
): Promise<Customer> => {
  const access = await resolveRuntimeTenantAccess();

  return archiveCustomer({
    customerId,
    grantedPermissions: access.grantedPermissions,
    operationId: access.operationId,
    requestId: access.requestId,
    tenantId: access.tenantId,
    userId: access.actorId,
  });
};
