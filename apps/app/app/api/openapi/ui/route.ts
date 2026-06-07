import { withRequestLogging } from "@repo/logger";
import { createSwaggerUiRoute } from "@repo/openapi";
import { openApiLogger } from "../_logger";

const handleGet = createSwaggerUiRoute({
  documentTitle: "Xforge API Reference",
  heading: "Xforge API Reference",
  specUrl: "/api/openapi",
  themeColor: "#0f172a",
});

export const GET = withRequestLogging(
  async (): Promise<Response> => handleGet(),
  {
    quietReqLogger: true,
    quietResLogger: true,
    logger: openApiLogger,
  }
);
