import { healthManager } from "./_manager";

const toHealthStatusCode = (
  status: "healthy" | "degraded" | "unhealthy"
): number => (status === "unhealthy" ? 503 : 200);

export async function GET(): Promise<Response> {
  const report = await healthManager.getHealthReport();

  return Response.json(report, {
    status: toHealthStatusCode(report.status),
  });
}
