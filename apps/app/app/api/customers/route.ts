import { createContractRoute } from "@repo/api";
import { InternalError } from "@repo/errors";
import {
  createCustomerRouteContract,
  listCustomersRouteContract,
} from "@repo/features-master-data-customers";
import { createLogger } from "@repo/logger";
import {
  createCustomerForTenant,
  listCustomersForTenant,
} from "./_execution.ts";

const customerApiLogger = createLogger("app.customers");

export const GET = createContractRoute(
  listCustomersRouteContract,
  async ({ query }) => {
    if (!query) {
      throw new InternalError("Customer list query contract was not resolved");
    }

    return {
      data: await listCustomersForTenant(query),
    };
  },
  {
    logger: customerApiLogger,
    metricsApp: "app",
  }
);

export const POST = createContractRoute(
  createCustomerRouteContract,
  async ({ body }) => {
    if (!body) {
      throw new InternalError("Customer create body contract was not resolved");
    }

    return {
      data: await createCustomerForTenant(body),
      status: 201,
    };
  },
  {
    logger: customerApiLogger,
    metricsApp: "app",
  }
);
