import { createContractRoute } from "@repo/api/route";
import { createLogger } from "@repo/logger";
import { listAuditEventsForTenant } from "./_execution.ts";
import { listAuditEventsRouteContract } from "./contract.ts";

const auditApiLogger = createLogger("app.audit");

export const GET = createContractRoute(
  listAuditEventsRouteContract,
  async ({ query }) => ({
    data: await listAuditEventsForTenant(
      query ?? {
        limit: 50,
        offset: 0,
      }
    ),
  }),
  {
    logger: auditApiLogger,
    metricsApp: "app",
  }
);
