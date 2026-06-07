import { metricsResponse, withMetrics } from "@repo/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withMetrics(
  async (): Promise<Response> => metricsResponse(),
  "app"
);
