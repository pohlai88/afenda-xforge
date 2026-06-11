import { createContractRoute } from "@repo/api/route";
import { InternalError } from "@repo/errors";
import type { CompanyIdParams } from "@repo/features-master-data-companies/contract";
import { updateCompanyRouteContract } from "@repo/features-master-data-companies/contract";
import { createLogger } from "@repo/logger";
import { updateCompanyForTenant } from "../_execution.ts";

const companyApiLogger = createLogger("app.companies");

const resolveCompanyParams = (
  params: CompanyIdParams | undefined
): CompanyIdParams => {
  if (!params?.companyId) {
    throw new InternalError("Company params contract was not resolved");
  }

  return params;
};

export const PATCH = createContractRoute(
  updateCompanyRouteContract,
  async ({ body, params }) => {
    if (!body) {
      throw new InternalError("Company update body contract was not resolved");
    }

    const resolvedParams = resolveCompanyParams(
      params as CompanyIdParams | undefined
    );

    return {
      data: await updateCompanyForTenant(resolvedParams.companyId, body),
    };
  },
  {
    logger: companyApiLogger,
    metricsApp: "app",
  }
);
