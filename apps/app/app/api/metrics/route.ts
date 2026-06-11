import { createLogger, withRequestLogging } from "@repo/logger";
import { metricsResponse, withMetrics } from "@repo/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const metricsLogger = createLogger("app.api.metrics");

const scrapeMetrics = withRequestLogging(
  async (): Promise<Response> => metricsResponse(),
  {
    logger: metricsLogger,
    metricsApp: "app",
    quietReqLogger: true,
    quietResLogger: true,
  }
);

export const GET = withMetrics(scrapeMetrics, "app");
