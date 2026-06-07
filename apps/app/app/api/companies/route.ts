import { createContractRoute } from "@repo/api/route";
import { InternalError } from "@repo/errors";
import {
  createCompanyRouteContract,
  listCompaniesRouteContract,
} from "@repo/features-master-data-companies/contract";
import { createLogger } from "@repo/logger";
import {
  createCompanyForTenant,
  listCompaniesForTenant,
} from "./_execution.ts";

const companyApiLogger = createLogger("app.companies");

export const GET = createContractRoute(
  listCompaniesRouteContract,
  async ({ query }) => {
    if (!query) {
      throw new InternalError("Company list query contract was not resolved");
    }

    return {
      data: await listCompaniesForTenant(query),
    };
  },
  {
    logger: companyApiLogger,
    metricsApp: "app",
  }
);

export const POST = createContractRoute(
  createCompanyRouteContract,
  async ({ body }) => {
    if (!body) {
      throw new InternalError("Company create body contract was not resolved");
    }

    return {
      data: await createCompanyForTenant(body),
      status: 201,
    };
  },
  {
    logger: companyApiLogger,
    metricsApp: "app",
  }
);
