import { createLogger, withRequestLogging } from "@repo/logger";
import { handleObservabilityDrainPost } from "@repo/observability/drain";
import { loadObservabilityKeys } from "@repo/observability/keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const observabilityDrainLogger = createLogger("app.observability.drain");
const drainSignatureSecret: string =
  loadObservabilityKeys().VERCEL_DRAIN_SIGNATURE_SECRET ?? "";

export const POST = withRequestLogging(
  async (request: Request): Promise<Response> =>
    handleObservabilityDrainPost(request, {
      logger: observabilityDrainLogger,
      signatureSecret: drainSignatureSecret,
    }),
  {
    quietReqLogger: true,
    quietResLogger: true,
    logger: observabilityDrainLogger,
    metricsApp: "app",
  }
);
