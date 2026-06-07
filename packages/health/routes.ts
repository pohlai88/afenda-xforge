import "server-only";

import type { HealthManager, HealthStatus, ProbeResult } from "./manager.ts";

export type HealthRouteHandlers = {
  health: () => Promise<Response>;
  live: () => Promise<Response>;
  ready: () => Promise<Response>;
  startup: () => Promise<Response>;
  version: () => Promise<Response>;
};

const toHealthStatusCode = (status: HealthStatus): number =>
  status === "unhealthy" ? 503 : 200;

const toProbeStatusCode = (result: ProbeResult): number =>
  result.status === "ok" ? 200 : 503;

export const createHealthRouteHandlers = (
  manager: HealthManager
): HealthRouteHandlers => ({
  health: async (): Promise<Response> => {
    const report = await manager.getHealthReport();

    return Response.json(report, {
      status: toHealthStatusCode(report.status),
    });
  },
  live: async (): Promise<Response> => {
    const result = await manager.getLiveness();

    return Response.json(result, {
      status: toProbeStatusCode(result),
    });
  },
  ready: async (): Promise<Response> => {
    const result = await manager.getReadiness();

    return Response.json(result, {
      status: toProbeStatusCode(result),
    });
  },
  startup: async (): Promise<Response> => {
    const result = await manager.getStartup();

    return Response.json(result, {
      status: toProbeStatusCode(result),
    });
  },
  version: async (): Promise<Response> =>
    Response.json(manager.getVersion(), {
      status: 200,
    }),
});
