import { createContractRoute } from "@repo/api/route";
import { InternalError } from "@repo/errors";
import {
  getActiveCompanyRouteContract,
  updateActiveCompanyRouteContract,
} from "@repo/features-master-data-companies/contract";
import { createLogger } from "@repo/logger";
import {
  getActiveCompanyForTenant,
  updateActiveCompanyForTenant,
} from "../_execution.ts";

const activeCompanyApiLogger = createLogger("app.companies.active");

export const GET = createContractRoute(
  getActiveCompanyRouteContract,
  async () => ({
    data: await getActiveCompanyForTenant(),
  }),
  {
    logger: activeCompanyApiLogger,
    metricsApp: "app",
  }
);

export const PATCH = createContractRoute(
  updateActiveCompanyRouteContract,
  async ({ body }) => {
    if (!body) {
      throw new InternalError(
        "Active company update body contract was not resolved"
      );
    }

    return {
      data: await updateActiveCompanyForTenant(body),
    };
  },
  {
    logger: activeCompanyApiLogger,
    metricsApp: "app",
  }
);
