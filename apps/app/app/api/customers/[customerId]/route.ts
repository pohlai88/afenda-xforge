import { createContractRoute } from "@repo/api/route";
import { InternalError } from "@repo/errors";
import type { CustomerIdParams } from "@repo/features-master-data-customers/contract";
import {
  archiveCustomerRouteContract,
  updateCustomerRouteContract,
} from "@repo/features-master-data-customers/contract";
import { createLogger } from "@repo/logger";
import {
  archiveCustomerForTenant,
  updateCustomerForTenant,
} from "../_execution.ts";

const customerApiLogger = createLogger("app.customers");

const resolveCustomerParams = (
  params: CustomerIdParams | undefined
): CustomerIdParams => {
  if (!params?.customerId) {
    throw new InternalError("Customer params contract was not resolved");
  }

  return params;
};

export const PATCH = createContractRoute(
  updateCustomerRouteContract,
  async ({ body, params }) => {
    if (!body) {
      throw new InternalError("Customer update body contract was not resolved");
    }

    const resolvedParams = resolveCustomerParams(params);

    return {
      data: await updateCustomerForTenant(resolvedParams.customerId, body),
    };
  },
  {
    logger: customerApiLogger,
    metricsApp: "app",
  }
);

export const DELETE = createContractRoute(
  archiveCustomerRouteContract,
  async ({ params }) => {
    const resolvedParams = resolveCustomerParams(params);

    return {
      data: await archiveCustomerForTenant(resolvedParams.customerId),
    };
  },
  {
    logger: customerApiLogger,
    metricsApp: "app",
  }
);
