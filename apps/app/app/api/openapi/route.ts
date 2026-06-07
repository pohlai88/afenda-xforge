import { withRequestLogging } from "@repo/logger";
import { createOpenApiRoute } from "@repo/openapi";
import { openApiLogger } from "./_logger";
import { getAppOpenApiDocument } from "./_spec";

const handleGet = createOpenApiRoute(getAppOpenApiDocument);

export const GET = withRequestLogging(
  async (): Promise<Response> => handleGet(),
  {
    logger: openApiLogger,
  }
);
