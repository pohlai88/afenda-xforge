import { getFlags } from "@repo/feature-flags/access";
import { createLogger, withRequestLogging } from "@repo/logger";

const flagsLogger = createLogger("app.api.flags");

const flagsRoute = withRequestLogging(
  async (request: Request): Promise<Response> => getFlags(request),
  {
    customProps: () => ({
      routeGroup: "feature-flags",
    }),
    quietReqLogger: true,
    quietResLogger: true,
    logger: flagsLogger,
    metricsApp: "app",
  }
);

export const GET: typeof flagsRoute = flagsRoute;
