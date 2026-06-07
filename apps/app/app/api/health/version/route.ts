import { createHealthRouteHandlers } from "@repo/health";
import { withRequestLogging } from "@repo/logger";
import { healthLogger } from "../_logger";
import { healthManager } from "../_manager";

const routes = createHealthRouteHandlers(healthManager);

export const GET = withRequestLogging(
  async (): Promise<Response> => routes.version(),
  {
    quietReqLogger: true,
    quietResLogger: true,
    logger: healthLogger,
  }
);
