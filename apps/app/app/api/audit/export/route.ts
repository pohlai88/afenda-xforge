import { createContractRoute } from "@repo/api/route";
import { createLogger } from "@repo/logger";
import { exportAuditEventsForTenant } from "../_execution.ts";
import { auditExportRouteContract } from "./contract.ts";

const auditExportLogger = createLogger("app.api.audit.export");

export const GET = createContractRoute(
  auditExportRouteContract,
  async ({ query }) => {
    const resolvedQuery = query ?? {
      format: "csv" as const,
      limit: 50,
      offset: 0,
    };
    const payload = await exportAuditEventsForTenant(resolvedQuery);

    return {
      data: payload,
      headers: {
        "content-disposition":
          resolvedQuery.format === "csv"
            ? 'attachment; filename="audit-events.csv"'
            : 'attachment; filename="audit-events.json"',
        "content-type":
          resolvedQuery.format === "csv"
            ? "text/csv; charset=utf-8"
            : "application/json; charset=utf-8",
      },
    };
  },
  {
    logger: auditExportLogger,
    metricsApp: "app",
  }
);
